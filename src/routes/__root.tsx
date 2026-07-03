import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import { useContent } from "@/store/content";
import { loadSiteContent } from "@/lib/content.functions";
import appCss from "../styles.css?url";
import PreviewHealth from "@/components/PreviewHealth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
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
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async () => {
    try {
      const res = await loadSiteContent();
      return { siteContent: res.json ?? null };
    } catch {
      return { siteContent: null };
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "merQato.digital — Tropical Digital Infrastructure" },
      { name: "description", content: "Building operational systems from paradise. Digital infrastructure studio in Palawan, Philippines." },
      { property: "og:title", content: "merQato.digital — Tropical Digital Infrastructure" },
      { property: "og:description", content: "Building operational systems from paradise. Digital infrastructure studio in Palawan, Philippines." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "merQato.digital — Tropical Digital Infrastructure" },
      { name: "twitter:description", content: "Building operational systems from paradise. Digital infrastructure studio in Palawan, Philippines." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/00234aec-3a90-4ad1-8cab-f8cf0e12e595" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/00234aec-3a90-4ad1-8cab-f8cf0e12e595" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap" },
    ],
    scripts: [
      {
        children: `(function(){try{var t=localStorage.getItem('mq-theme');if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { siteContent } = Route.useLoaderData();
  const setTheme = useContent((s) => s.setTheme);

  // Hydrate the zustand store synchronously on both server and client before
  // first paint so every viewport (mobile / tablet / desktop) and every domain
  // renders the live DB content instead of the seeded defaults.
  useState(() => {
    if (!siteContent) return null;
    const state = useContent.getState();
    if (state.loaded) return null;
    try {
      const parsed = JSON.parse(siteContent);
      const merged = { ...state.content, ...parsed };
      const isStale = (u?: string) =>
        typeof u === "string" && (u.startsWith("/assets/") || u.startsWith("/src/assets/"));
      const heroImage = isStale(merged.hero?.image) ? state.content.hero.image : merged.hero.image;
      const blog = (merged.blog ?? []).map((p: any) => {
        const d = state.content.blog.find((x) => x.id === p.id);
        return { ...p, image: isStale(p.image) && d ? d.image : p.image };
      });
      const portfolio = (merged.portfolio ?? []).map((p: any) => {
        const d = state.content.portfolio.find((x) => x.id === p.id);
        return { ...p, image: isStale(p.image) && d ? d.image : p.image };
      });
      useContent.setState({
        content: { ...merged, hero: { ...merged.hero, image: heroImage }, blog, portfolio },
        loaded: true,
      });
    } catch {}
    return null;
  });

  useEffect(() => {
    try {
      const v = window.localStorage.getItem("mq-theme");
      setTheme(v === "light" ? "light" : "dark");
    } catch {}
  }, [setTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <PreviewHealth />
    </QueryClientProvider>
  );
}
