/// <reference types="vite/client" />

import { useLingui } from "@lingui/react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouteContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import { syncConvexAuthForStartLoader } from "kitcn/auth/start";
import type { ConvexQueryClient } from "kitcn/react";
import { getToken } from "~/lib/convex/auth-server";
import { ConvexAppProvider } from "~/lib/convex/convex-provider";
import appCss from "../styles.css?url";

const getAuth = createServerFn({ method: "GET" }).handler(
  async () => (await getToken()) ?? null
);

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  beforeLoad: async ({ context }) => {
    try {
      return await syncConvexAuthForStartLoader({
        convex: context.convexQueryClient,
        getToken: async () =>
          // During SSR, call getToken in-process. createServerFn would HTTP the
          // same Vercel deployment (`/_serverFn`) and trip INFINITE_LOOP_DETECTED.
          import.meta.env.SSR ? await getToken() : await getAuth(),
      });
    } catch (error) {
      console.error("[auth] getToken failed", error);
      return { isAuthenticated: false, token: null };
    }
  },
  component: RootComponent,
  head: () => ({
    links: [
      {
        href: appCss,
        rel: "stylesheet",
      },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      {
        title: "Notes — Capture ideas, links & todos in one line",
      },
      {
        content:
          "Jot ideas, todos, bookmarks, and due dates in a single send—optional links, times, and images included. Start free with anonymous sign-in or Google.",
        name: "description",
      },
      {
        content: "Notes",
        name: "application-name",
      },
      {
        content: "Notes — Capture ideas, links & todos in one line",
        property: "og:title",
      },
      {
        content:
          "One box for everything you need to remember. Type, add context, send once, and come back when you are ready—real-time sync keeps it waiting.",
        property: "og:description",
      },
      {
        content: "website",
        property: "og:type",
      },
      {
        content: "summary",
        name: "twitter:card",
      },
      {
        content: "Notes — Capture ideas, links & todos in one line",
        name: "twitter:title",
      },
      {
        content:
          "One box for everything you need to remember. Type, add context, send once, and come back when you are ready—real-time sync keeps it waiting.",
        name: "twitter:description",
      },
    ],
  }),
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
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "TanStack Query",
              render: <ReactQueryDevtoolsPanel />,
            },
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
