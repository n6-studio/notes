import type { I18n, Messages } from "@lingui/core";
import { setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { notifyManager } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { getGlobalStartContext } from "@tanstack/react-start";
import { ConvexQueryClient } from "kitcn/react";
import {
  attachConvexQueryClient,
  createQueryClient,
} from "./lib/convex/query-client";
import { skyViewTransitionTypes } from "./lib/sky-scene";
import { routeTree } from "./routeTree.gen";

interface StartI18nContext {
  i18n?: I18n;
  locale?: string;
}

interface DehydratedI18n {
  locale: string;
  messages: Messages;
}

export function getRouter() {
  if (typeof document !== "undefined") {
    notifyManager.setScheduler(window.requestAnimationFrame);
  }

  const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
  if (!convexUrl) {
    throw new Error("VITE_CONVEX_URL is not set");
  }

  const convexQueryClient = new ConvexQueryClient(convexUrl, {
    expectAuth: false,
  });

  const queryClient = createQueryClient();
  attachConvexQueryClient(queryClient, convexQueryClient);

  // Start types the middleware context as `never` at this call site.
  const globalContext = getGlobalStartContext() as StartI18nContext | undefined;
  const i18n = globalContext?.i18n ?? setupI18n();

  const router = createTanStackRouter({
    context: {
      convexQueryClient,
      queryClient,
    },
    defaultPreload: "intent",
    defaultViewTransition: {
      types: skyViewTransitionTypes,
    },
    routeTree,
    scrollRestoration: true,
    Wrap: ({ children }) => <I18nProvider i18n={i18n}>{children}</I18nProvider>,
  });

  if (router.isServer) {
    router.options.dehydrate = () => ({
      i18n: { locale: i18n.locale, messages: i18n.messages },
    });
  } else {
    router.options.hydrate = (dehydrated: { i18n?: DehydratedI18n }) => {
      if (dehydrated.i18n) {
        i18n.loadAndActivate(dehydrated.i18n);
      }
    };
  }

  setupRouterSsrQueryIntegration({
    queryClient,
    router,
    wrapQueryClient: false,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
