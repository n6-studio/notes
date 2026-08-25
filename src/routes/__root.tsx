/// <reference types="vite/client" />

import { useLingui } from "@lingui/react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouteContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import type { ConvexQueryClient } from "kitcn/react";
import { getToken } from "~/lib/convex/auth-server";
import { ConvexAppProvider } from "~/lib/convex/convex-provider";
import appCss from "../styles.css?url";

const getAuth = createServerFn({ method: "GET" }).handler(
  async () => (await getToken()) ?? null
);

async function loadRootAuth(): Promise<{
  isAuthenticated: boolean;
  token: string | null;
}> {
  // During SSR, call getToken in-process. createServerFn would HTTP the same
  // Vercel deployment (`/_serverFn`) and trip INFINITE_LOOP_DETECTED.
  try {
    const token = import.meta.env.SSR
      ? ((await getToken()) ?? null)
      : await getAuth();
    return { isAuthenticated: Boolean(token), token };
  } catch (error) {
    console.error("[auth] getToken failed", error);
    return { isAuthenticated: false, token: null };
  }
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Notes — Capture ideas, links & todos in one line",
      },
      {
        name: "description",
        content:
          "Jot ideas, todos, bookmarks, and due dates in a single send—optional links, times, and images included. Start free with anonymous sign-in or Google.",
      },
      {
        name: "application-name",
        content: "Notes",
      },
      {
        property: "og:title",
        content: "Notes — Capture ideas, links & todos in one line",
      },
      {
        property: "og:description",
        content:
          "One box for everything you need to remember. Type, add context, send once, and come back when you are ready—real-time sync keeps it waiting.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary",
      },
      {
        name: "twitter:title",
        content: "Notes — Capture ideas, links & todos in one line",
      },
      {
        name: "twitter:description",
        content:
          "One box for everything you need to remember. Type, add context, send once, and come back when you are ready—real-time sync keeps it waiting.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  beforeLoad: async ({ context }) => {
    const auth = await loadRootAuth();
    if (auth.token) {
      context.convexQueryClient.serverHttpClient?.setAuth(auth.token);
    }
    return auth;
  },
  component: RootComponent,
});

function RootComponent() {
  const context = useRouteContext({ from: Route.id });
  return (
    <ConvexAppProvider
      convexQueryClient={context.convexQueryClient}
      initialToken={context.token}
      queryClient={context.queryClient}
    >
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ConvexAppProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { i18n } = useLingui();
  return (
    <html className="dark" lang={i18n.locale}>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <ReactQueryDevtools />
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtools />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
