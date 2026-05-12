import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
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
  authClient,
  useSignInSocialMutationOptions,
  useSignOutMutationOptions,
} from "~/lib/convex/auth-client";

export function TopNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const session = authClient.useSession();
  const [anonymousSignOutOpen, setAnonymousSignOutOpen] = useState(false);

  const signOut = useMutation(useSignOutMutationOptions());
  const signInSocial = useMutation(useSignInSocialMutationOptions());

  const isAnonymous = session.data?.user?.isAnonymous === true;

  const userLabel =
    session.data?.user?.name?.trim() ||
    session.data?.user?.email?.trim() ||
    "Account";

  return (
    <>
      <header className="sticky top-0 z-50 border-border/40 border-b bg-background/10 backdrop-blur-md">
        <div className="mx-auto flex h-11 max-w-2xl items-center justify-between gap-4 px-4">
          <nav className="flex min-w-0 flex-1 items-center gap-1 text-sm">
            <Link
              className="mr-2 shrink-0 font-medium text-foreground/90 tracking-tight transition-opacity hover:opacity-80"
              to={isAuthenticated ? "/home" : "/"}
            >
              Dump
            </Link>
            {isAuthenticated && (
              <>
                <Button
                  asChild
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  size="sm"
                  variant="ghost"
                >
                  <Link to="/home">Home</Link>
                </Button>
                <Button
                  asChild
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  size="sm"
                  variant="ghost"
                >
                  <Link to="/notes">Notes</Link>
                </Button>
              </>
            )}
          </nav>
          <div className="flex shrink-0 items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="-mr-2 h-8 gap-1 px-2 text-muted-foreground hover:text-foreground"
                    size="sm"
                    variant="ghost"
                  >
                    <span className="max-w-36 truncate">{userLabel}</span>
                    <ChevronDownIcon className="size-4 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={signOut.isPending}
                    onSelect={(event) => {
                      if (isAnonymous) {
                        event.preventDefault();
                        setAnonymousSignOutOpen(true);
                        return;
                      }
                      signOut.mutateAsync().then(() => router.invalidate());
                    }}
                    variant="destructive"
                  >
                    Sign out
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
                Sign in with Google
              </Button>
            )}
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
            <AlertDialogTitle>Sign out and delete your notes?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re signed in as a guest. Signing out permanently deletes
              your account and everything you&apos;ve saved here—every note and
              attachment—with no way to recover it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={signOut.isPending}>
              Cancel
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
              Sign out
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
