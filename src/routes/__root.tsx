import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try refreshing or head back home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Try again
          </button>
          <a href="/" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent/10">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0c2340" },
      { title: "PDMS — Parkinson's Detection & Monitoring" },
      { name: "description", content: "Parkinson's detection using analysis of bradykinesia, tremor, rigidity, and typing assessments." },
      { property: "og:title", content: "PDMS — Parkinson's Detection & Monitoring" },
      { property: "og:description", content: "Parkinson's detection using analysis of bradykinesia, tremor, rigidity, and typing assessments." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "PDMS — Parkinson's Detection & Monitoring" },
      { name: "twitter:description", content: "Parkinson's detection using analysis of bradykinesia, tremor, rigidity, and typing assessments." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/601019de-d78c-4c09-9dfa-50b8d7319454/id-preview-49938e4c--d78af302-da23-4593-9cef-58d7884f20ca.lovable.app-1779645511419.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/601019de-d78c-4c09-9dfa-50b8d7319454/id-preview-49938e4c--d78af302-da23-4593-9cef-58d7884f20ca.lovable.app-1779645511419.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: appCss && String(appCss).length > 0 ? [{ rel: "stylesheet", href: appCss }] : [],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function AuthInvalidator() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        router.invalidate();
        qc.invalidateQueries();
      });
      return () => subscription.unsubscribe();
    } catch (err) {
      // If Supabase isn't configured, avoid crashing the app during dev.
      console.warn('Supabase auth not initialized:', err);
      return;
    }
  }, [router, qc]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInvalidator />
      <Outlet />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
