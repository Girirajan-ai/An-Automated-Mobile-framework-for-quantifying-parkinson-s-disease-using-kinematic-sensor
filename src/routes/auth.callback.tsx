import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureUserProfile } from "@/lib/profiles";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Confirming your email…");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (!cancelled) {
            toast.error(error.message);
            setMessage("Confirmation failed.");
            setTimeout(() => navigate({ to: "/login" }), 2000);
          }
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        await ensureUserProfile(data.session.user.id);
        toast.success("Signup successful! Email confirmed — welcome!");
        navigate({ to: "/dashboard" });
      } else {
        setMessage("Please sign in with your email and password.");
        setTimeout(() => navigate({ to: "/login" }), 2000);
      }
    }

    finish();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
