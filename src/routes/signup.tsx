import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authErrorMessage, checkSupabaseReachable, formatAuthCatchError, getAuthRedirectUrl } from "@/lib/auth";
import { ensureUserProfile } from "@/lib/profiles";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — PDMS" }, { name: "description", content: "Create a PDMS patient account." }] }),
  component: Signup,
});

function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", age: "", gender: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ email: string; needsConfirm: boolean } | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    checkSupabaseReachable().then((result) => {
      if (!result.ok) setConnectionError(result.message);
    });
  }, []);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    setLoading(true);
    setSuccess(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: form.password,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
          data: {
            name: form.name.trim(),
            age: form.age,
            gender: form.gender,
          },
        },
      });

      if (error) {
        toast.error(authErrorMessage(error));
        return;
      }

      if (!data.user) {
        toast.error("Sign up failed. Please try again.");
        return;
      }

      const profileInput = {
        name: form.name.trim(),
        age: form.age ? parseInt(form.age, 10) : null,
        gender: form.gender || null,
      };

      // Logged in immediately (email confirmation off)
      if (data.session) {
        const profile = await ensureUserProfile(data.user.id, profileInput);
        if (!profile.ok) {
          toast.error(`Signup successful, but profile save failed: ${profile.error}. Run supabase-setup-all.sql in Supabase.`);
        } else {
          toast.success("Signup successful! Your patient profile was created.");
        }
        setSuccess({ email: trimmedEmail, needsConfirm: false });
        setTimeout(() => nav({ to: "/dashboard" }), 1500);
        return;
      }

      // Account created — must confirm email before login (common Supabase default)
      setSuccess({ email: trimmedEmail, needsConfirm: true });
      toast.success("Signup successful! You can sign in after confirming your email.", { duration: 8000 });
    } catch (err) {
      console.error("[Signup]", err);
      toast.error(formatAuthCatchError(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen surface-gradient px-6 py-8 max-w-md mx-auto text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" aria-hidden />
        <h1 className="mt-4 text-2xl font-bold text-primary">Signup successful</h1>
        <p className="mt-3 text-muted-foreground">
          {success.needsConfirm ? (
            <>
              Account created for <strong>{success.email}</strong>. Check your email to confirm, then sign in.
              <span className="block mt-2 text-xs">
                For testing: Supabase → Authentication → Providers → Email → turn off “Confirm email”.
              </span>
            </>
          ) : (
            <>Welcome! Redirecting to your dashboard…</>
          )}
        </p>
        {success.needsConfirm && (
          <Button className="mt-8 w-full h-12 rounded-xl" onClick={() => nav({ to: "/login", search: { email: success.email } })}>
            Go to sign in
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-gradient px-6 py-8 max-w-md mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4"/>Back</Link>
      <h1 className="mt-6 text-3xl font-bold text-primary">Create account</h1>
      <p className="mt-2 text-muted-foreground">We'll create your patient profile.</p>

      {connectionError && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {connectionError}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={form.name} onChange={update("name")} className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" min={1} max={120} value={form.age} onChange={update("age")} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <select id="gender" value={form.gender} onChange={update("gender")}
              className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm">
              <option value="">Select…</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={form.email} onChange={update("email")} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} value={form.password} onChange={update("password")} className="mt-1" />
          <p className="mt-1 text-xs text-muted-foreground">At least 8 characters</p>
        </div>
        <Button type="submit" disabled={loading} className="w-full h-12 text-base rounded-xl">
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground text-center">
        Have an account? <Link to="/login" className="text-primary font-medium">Sign in</Link>
      </p>
    </div>
  );
}
