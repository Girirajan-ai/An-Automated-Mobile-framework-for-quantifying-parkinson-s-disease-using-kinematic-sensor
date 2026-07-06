import json
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

FEATURES = ["bradykinesiaScore", "tremorScore", "rigidityScore", "typingScore"]
LABEL = "severity"
CLASSES = ["Normal", "Mild", "Moderate", "Severe"]

df = pd.read_csv("dataset_subscores.csv")
X, y = df[FEATURES], df[LABEL]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = RandomForestClassifier(
    n_estimators=60,
    max_depth=6,
    min_samples_leaf=4,
    class_weight="balanced",
    random_state=42,
)
model.fit(X_train, y_train)

cv_scores = cross_val_score(model, X_train, y_train, cv=5)
print(f"5-fold CV accuracy: {cv_scores.mean():.4f} +/- {cv_scores.std():.4f}")

y_pred = model.predict(X_test)
print("\nTest accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification report:\n", classification_report(y_test, y_pred))
print("Confusion matrix, order:", CLASSES)
print(confusion_matrix(y_test, y_pred, labels=CLASSES))

print("\nFeature importances:")
for f, imp in sorted(zip(FEATURES, model.feature_importances_), key=lambda x: -x[1]):
    print(f"  {f:20s} {imp:.4f}")


def export_tree(tree):
    t = tree.tree_
    nodes = []
    for i in range(t.node_count):
        if t.children_left[i] == t.children_right[i]:
            values = t.value[i][0]
            probs = [round(p, 4) for p in (values / values.sum()).tolist()]
            nodes.append({"leaf": True, "probs": probs})
        else:
            nodes.append({
                "leaf": False,
                "feature": int(t.feature[i]),
                "threshold": round(float(t.threshold[i]), 4),
                "left": int(t.children_left[i]),
                "right": int(t.children_right[i]),
            })
    return nodes


forest_export = {
    "features": FEATURES,
    "classes": model.classes_.tolist(),
    "trees": [export_tree(est) for est in model.estimators_],
}

with open("random_forest_model.json", "w") as f:
    json.dump(forest_export, f)

print(f"\nExported {len(model.estimators_)} trees.")
print("File size (KB):", round(os.path.getsize("random_forest_model.json") / 1024, 1))
