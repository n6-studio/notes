/// <reference types="vite/client" />

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
  async () => await getToken()
);

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
    const token = await getAuth();
    if (token) {
      context.convexQueryClient.serverHttpClient?.setAuth(token);
    }
    return {
      isAuthenticated: Boolean(token),
      token: token ?? null,
    };
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
  return (
    <html className="dark" lang="en">
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
