import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";
import { TriangleAlertIcon } from "lucide-react";
import { TopNav } from "~/components/top-nav";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useUser } from "~/lib/convex/use-user";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_authed/settings")({
  component: Settings,
});

function Settings() {
  const { user } = useUser();
  const isAnonymous = user?.isAnonymous === true;

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pt-8 pb-16 md:pt-12">
        <h1 className="font-medium text-foreground/90 text-xl tracking-tight">
          <Trans>Settings</Trans>
        </h1>
        {isAnonymous && (
          <section aria-labelledby="settings-account-heading" className="mt-8">
            <h2
              className="mb-3 font-medium text-foreground/80 text-sm"
              id="settings-account-heading"
            >
              <Trans>Account</Trans>
            </h2>
            <Alert
              className={cn(
                "border-amber-500/35 bg-amber-500/5 text-amber-950 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-50/95",
                "*:data-[slot=alert-description]:text-amber-900/85 dark:*:data-[slot=alert-description]:text-amber-50/80"
              )}
            >
              <TriangleAlertIcon
                aria-hidden
                className="text-amber-600 dark:text-amber-400"
              />
              <AlertTitle>
                <Trans>Anonymous session</Trans>
              </AlertTitle>
              <AlertDescription>
                <Trans>
                  Sign out, clear this site&apos;s data, private browsing, or
                  another device can cut off access to your notes.
                </Trans>
              </AlertDescription>
            </Alert>
          </section>
        )}
      </main>
    </div>
  );
}
