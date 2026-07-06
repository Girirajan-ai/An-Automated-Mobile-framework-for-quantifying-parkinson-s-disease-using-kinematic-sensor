import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Home, User, BarChart3, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const router = useRouter();
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({ to: "/" });
  };
  return (
    <div className="min-h-screen pb-24 surface-gradient">
      <header className="px-5 pt-5 pb-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">PDMS</span>
        </Link>
        <button onClick={signOut} className="p-2 text-muted-foreground" aria-label="Sign out">
          <LogOut className="h-5 w-5" />
        </button>
      </header>
      <main className="px-5"><Outlet /></main>

      <nav className="fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur border-t border-border px-2 py-2 flex justify-around">
        <NavItem to="/dashboard" icon={<Home className="h-5 w-5" />} label="Home" />
        <NavItem to="/results" icon={<BarChart3 className="h-5 w-5" />} label="Results" />
        <NavItem to="/profile" icon={<User className="h-5 w-5" />} label="Profile" />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} activeProps={{ className: "text-primary" }}
      className="flex-1 flex flex-col items-center gap-1 py-1 text-xs text-muted-foreground">
      {icon}<span>{label}</span>
    </Link>
  );
}
