import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authErrorMessage, checkSupabaseReachable, formatAuthCatchError } from "@/lib/auth";
import { ensureUserProfile } from "@/lib/profiles";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

type LoginSearch = { email?: string; signedup?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    email: typeof search.email === "string" ? search.email : undefined,
    signedup: typeof search.signedup === "string" ? search.signedup : undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in — PDMS" }, { name: "description", content: "Sign in to PDMS." }] }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const { email: emailFromUrl, signedup } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
  }, [emailFromUrl]);

  useEffect(() => {
    checkSupabaseReachable().then((result) => {
      if (!result.ok) setConnectionError(result.message);
    });
  }, []);

  useEffect(() => {
    if (signedup === "1") {
      toast.success("Signup successful! Sign in with your email and password.");
    }
  }, [signedup]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        toast.error(authErrorMessage(error));
        return;
      }

      const user = data.user ?? data.session?.user;
      if (!data.session || !user) {
        toast.error("Sign in did not return a session. Confirm your email or check Supabase auth settings.");
        return;
      }

      const profile = await ensureUserProfile(user.id);
      if (!profile.ok) {
        toast.warning(`Signed in, but profile could not be saved: ${profile.error}`);
      } else {
        toast.success("Sign in successful! Welcome back.");
      }
      nav({ to: "/dashboard" });
    } catch (err) {
      console.error("[Login]", err);
      toast.error(formatAuthCatchError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen surface-gradient px-6 py-8 max-w-md mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4"/>Back</Link>
      <h1 className="mt-6 text-3xl font-bold text-primary">Sign in</h1>
      <p className="mt-2 text-muted-foreground">Access your PDMS dashboard.</p>

      {connectionError && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {connectionError}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
        </div>
        <Button type="submit" disabled={loading} className="w-full h-12 text-base rounded-xl">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground text-center">
        Don't have an account? <Link to="/signup" className="text-primary font-medium">Create one</Link>
      </p>
    </div>
  );
}
