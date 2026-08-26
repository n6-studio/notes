import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "~/components/language-switcher";
import { LogoMark } from "~/components/logo-mark";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  useSignInSocialMutationOptions,
  useSignOutMutationOptions,
} from "~/lib/convex/auth-client";
import { useUser } from "~/lib/convex/use-user";

export function TopNav() {
  const router = useRouter();
  const { t } = useLingui();
  const { user, isAuthenticated } = useUser();
  const [anonymousSignOutOpen, setAnonymousSignOutOpen] = useState(false);

  const signOut = useMutation(useSignOutMutationOptions());
  const signInSocial = useMutation(useSignInSocialMutationOptions());

  const isAnonymous = user?.isAnonymous === true;

  const userLabel = user?.name?.trim() || user?.email?.trim() || t`Account`;

  return (
    <>
      <header className="sticky top-0 z-50 border-border/40 border-b bg-background/10 backdrop-blur-md">
        <div className="mx-auto flex h-11 max-w-4xl items-center justify-between gap-4 px-4">
          <nav className="flex min-w-0 flex-1 items-center gap-1 text-sm">
            <div className="mr-2 flex shrink-0 items-baseline gap-2">
              <Link
                className="flex items-center gap-2 font-medium text-foreground/90 tracking-tight transition-opacity hover:opacity-80"
                to={isAuthenticated ? "/home" : "/"}
              >
                <LogoMark className="size-5 shrink-0 text-foreground/90" />
                <span className="font-bold text-foreground text-sm">NOTES</span>
              </Link>
              <a
                className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                href="https://n6.studio"
                rel="noreferrer"
                target="_blank"
              >
                by N6 Studio
              </a>
            </div>
            <span className="font-semibold text-lg text-muted-foreground/30">
              /
            </span>
            {isAuthenticated && (
              <>
                <Button
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  nativeButton={false}
                  render={<Link to="/home" />}
                  size="sm"
                  variant="ghost"
                >
                  <Trans>Home</Trans>
                </Button>
                <Button
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  nativeButton={false}
                  render={<Link to="/notes" />}
                  size="sm"
                  variant="ghost"
                >
                  <Trans>Notes</Trans>
                </Button>
              </>
            )}
          </nav>
          <div className="flex shrink-0 items-center gap-1">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      className="h-8 gap-1 px-2 text-muted-foreground hover:text-foreground"
                      size="sm"
                      variant="ghost"
                    />
                  }
                >
                  <span className="max-w-36 truncate">{userLabel}</span>
                  <ChevronDownIcon className="size-4 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                  <DropdownMenuItem render={<Link to="/settings" />}>
                    <Trans>Settings</Trans>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    closeOnClick={!isAnonymous}
                    disabled={signOut.isPending}
                    onClick={() => {
                      if (isAnonymous) {
                        setAnonymousSignOutOpen(true);
                        return;
                      }
                      signOut.mutateAsync().then(() => router.invalidate());
                    }}
                    variant="destructive"
                  >
                    <Trans>Sign out</Trans>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                className="h-8 px-2"
                disabled={signInSocial.isPending}
                onClick={async () => {
                  await signInSocial.mutateAsync({ provider: "google" });
                }}
                size="sm"
                variant="ghost"
              >
                <Trans>Sign in with Google</Trans>
              </Button>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <AlertDialog
        onOpenChange={(open) => {
          if (!open && signOut.isPending) {
            return;
          }
          setAnonymousSignOutOpen(open);
        }}
        open={anonymousSignOutOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans>Sign out and delete your notes?</Trans>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans>
                You&apos;re signed in as a guest. Signing out permanently
                deletes your account and everything you&apos;ve saved here—every
                note and attachment—with no way to recover it.
              </Trans>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={signOut.isPending}>
              <Trans>Cancel</Trans>
            </AlertDialogCancel>
            <Button
              disabled={signOut.isPending}
              onClick={async () => {
                try {
                  await signOut.mutateAsync();
                  setAnonymousSignOutOpen(false);
                  router.invalidate();
                } catch {
                  /* sign-out failed; leave dialog open */
                }
              }}
              variant="destructive"
            >
              <Trans>Sign out</Trans>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
