import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — PDMS" }, { name: "description", content: "Your patient profile." }] }),
  component: Profile,
});

function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", age: "", gender: "", patientId: "", email: "", createdAt: "" });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: p } = await supabase.from("profiles").select("*").eq("id", u.user.id).single();
      setForm({
        name: p?.name ?? "",
        age: p?.age?.toString() ?? "",
        gender: p?.gender ?? "",
        patientId: u.user.id,
        email: u.user.email ?? "",
        createdAt: p?.created_at ? new Date(p.created_at).toLocaleDateString() : "",
      });
      setLoading(false);
    })();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("profiles").update({
      name: form.name,
      age: form.age ? parseInt(form.age, 10) : null,
      gender: form.gender || null,
    }).eq("id", u.user.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  };

  if (loading) return <p className="text-muted-foreground mt-8">Loading…</p>;

  return (
    <div className="pb-6">
      <h1 className="text-2xl font-bold text-primary">Patient profile</h1>
      <div className="mt-4 rounded-2xl bg-card card-elev p-4 text-sm space-y-1">
        <p><span className="text-muted-foreground">Patient ID:</span> <span className="font-mono text-xs">{form.patientId.slice(0,8)}…</span></p>
        <p><span className="text-muted-foreground">Email:</span> {form.email}</p>
        <p><span className="text-muted-foreground">Registered:</span> {form.createdAt}</p>
      </div>

      <form onSubmit={save} className="mt-5 space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" min={1} max={120} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <select id="gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm">
              <option value="">Select…</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <Button type="submit" disabled={saving} className="w-full h-12 rounded-xl">
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </div>
  );
}
