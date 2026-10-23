import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

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

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

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
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RedMoon — Game Accounts, Middleman & Top Up" },
      {
        name: "description",
        content:
          "Toko game terpercaya RedMoon — Jual beli akun game aman, top up termurah, dan jasa middleman/rekber bergaransi untuk game strategi favorit Anda.",
      },
      {
        name: "keywords",
        content:
          "RedMoon, redmoon shop, redmoon-shop.com, jual akun game, beli akun game, top up game murah, middleman game, rekber game, Whiteout Survival, Kingshot, Rise of Kingdoms, Call of Dragons",
      },
      { name: "author", content: "RedMoon" },
      {
        name: "robots",
        content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
      },
      { name: "google-site-verification", content: "google4dfae9546e319b9f" },
      { property: "og:site_name", content: "RedMoon" },
      { property: "og:title", content: "RedMoon — Game Accounts, Middleman & Top Up" },
      {
        property: "og:description",
        content:
          "Toko game terpercaya RedMoon — Jual beli akun game aman, top up termurah, dan jasa middleman/rekber bergaransi.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://redmoon-shop.com/" },
      { property: "og:image", content: "https://redmoon-shop.com/logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "RedMoon — Game Accounts, Middleman & Top Up" },
      {
        name: "twitter:description",
        content:
          "Toko game terpercaya RedMoon — Jual beli akun game aman, top up termurah, dan jasa middleman/rekber bergaransi.",
      },
      { name: "twitter:image", content: "https://redmoon-shop.com/logo.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "canonical", href: "https://redmoon-shop.com/" },
      { rel: "icon", type: "image/png", href: "/logo.png" },
      { rel: "apple-touch-icon", href: "/logo.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://redmoon-shop.com/#organization",
              name: "RedMoon",
              url: "https://redmoon-shop.com/",
              logo: "https://redmoon-shop.com/logo.png",
              description:
                "Toko game terpercaya untuk jual beli akun, jasa middleman/rekber, dan top up game.",
            },
            {
              "@type": "WebSite",
              "@id": "https://redmoon-shop.com/#website",
              url: "https://redmoon-shop.com/",
              name: "RedMoon",
              publisher: {
                "@id": "https://redmoon-shop.com/#organization",
              },
            },
            {
              "@type": "Store",
              "@id": "https://redmoon-shop.com/#store",
              name: "RedMoon Gaming Store",
              url: "https://redmoon-shop.com/",
              description:
                "Jual beli akun game, middleman escrow terpercaya, dan top up game terlengkap dan termurah.",
              image: "https://redmoon-shop.com/logo.png",
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
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

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
