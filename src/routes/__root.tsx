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
import {
  type RootAuthContext,
  rootAuthFromGetToken,
  shouldSkipRootAuthLookup,
} from "~/lib/convex/root-auth";
import appCss from "../styles.css?url";

const getAuth = createServerFn({ method: "POST" }).handler(async () => {
  try {
    return { lookupFailed: false, token: (await getToken()) ?? null };
  } catch (error) {
    console.error("[auth] getToken failed during SSR", error);
    return { lookupFailed: true, token: null };
  }
});

async function loadRootAuth(pathname: string): Promise<RootAuthContext> {
  if (shouldSkipRootAuthLookup(pathname)) {
    return rootAuthFromGetToken(null, false);
  }

  // SSR must call getToken in-process. createServerFn POSTs `/_serverFn`,
  // which Vercel routes back into this same function (508 Loop Detected).
  if (import.meta.env.SSR) {
    try {
      return rootAuthFromGetToken((await getToken()) ?? null, false);
    } catch (error) {
      console.error("[auth] getToken failed during SSR", error);
      return rootAuthFromGetToken(null, true);
    }
  }

  const auth = await getAuth();
  return rootAuthFromGetToken(auth.token, auth.lookupFailed);
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
  beforeLoad: async ({ context, location }) => {
    const auth = await loadRootAuth(location.pathname);
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
