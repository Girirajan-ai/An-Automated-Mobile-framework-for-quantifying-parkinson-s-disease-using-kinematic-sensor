import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  bradykinesiaScore: z.number().min(0).max(100),
  tremorScore: z.number().min(0).max(100),
  rigidityScore: z.number().min(0).max(100),
  typingScore: z.number().min(0).max(100),
  severity: z.string().min(1).max(64),
  result: z.string().min(1).max(128),
  confidence: z.number().min(0).max(100),
});

export const generatePredictionSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;

    let summary =
      `Based on the captured tests, bradykinesia subscore is ${data.bradykinesiaScore}/100, ` +
      `tremor subscore is ${data.tremorScore}/100, rigidity subscore is ${data.rigidityScore}/100, ` +
      `and typing subscore is ${data.typingScore}/100. ` +
      `Composite assessment: ${data.result}.`;

    if (apiKey) {
      try {
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content:
                  "You are a clinical screening assistant for Parkinson's disease. Given four subscores (0-100, higher = more abnormal) for bradykinesia, tremor, rigidity, and typing, write a concise 3-4 sentence plain-language summary of what the pattern suggests and recommended next steps. Be careful, non-alarming, and always note that this is a screening tool, not a diagnosis.",
              },
              {
                role: "user",
                content: JSON.stringify(data),
              },
            ],
          }),
        });
        if (resp.ok) {
          const j = await resp.json();
          const text = j?.choices?.[0]?.message?.content;
          if (typeof text === "string" && text.trim()) summary = text.trim();
        } else if (resp.status === 429 || resp.status === 402) {
          summary += " (AI summary unavailable: rate-limit or credits required.)";
        }
      } catch (e) {
        console.error("AI summary failed", e);
      }
    }

    const { data: row, error } = await supabase
      .from("prediction_data")
      .insert({
        patient_id: userId,
        bradykinesia_score: data.bradykinesiaScore,
        tremor_score: data.tremorScore,
        rigidity_score: data.rigidityScore,
        typing_score: data.typingScore,
        prediction_result: data.result,
        severity: data.severity,
        confidence_percentage: data.confidence,
        summary,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return row;
  });
