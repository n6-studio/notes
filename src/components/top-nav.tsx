import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import {
  CircleUserRoundIcon,
  HouseIcon,
  MenuIcon,
  SettingsIcon,
  StickyNoteIcon,
} from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  useSignInSocialMutationOptions,
  useSignOutMutationOptions,
} from "~/lib/convex/auth-client";
import { useUser } from "~/lib/convex/use-user";
import { cn } from "~/lib/utils";

const navLinkClassName =
  "h-8 px-2 text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground";

const sheetLinkClassName =
  "h-11 w-full justify-start px-3 text-base text-muted-foreground hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground";

export function TopNav() {
  const router = useRouter();
  const { t } = useLingui();
  const { user, isAuthenticated } = useUser();
  const [anonymousSignOutOpen, setAnonymousSignOutOpen] = useState(false);

  const signOut = useMutation(useSignOutMutationOptions());
  const signInSocial = useMutation(useSignInSocialMutationOptions());

  const isAnonymous = user?.isAnonymous === true;

  const userLabel = user?.name?.trim() || user?.email?.trim() || t`Account`;

  const onSignOutClick = useCallback(() => {
    if (isAnonymous) {
      setAnonymousSignOutOpen(true);
      return;
    }
    signOut.mutateAsync().then(() => router.invalidate());
  }, [isAnonymous, router, signOut]);

  const onGoogleSignIn = useCallback(async () => {
    await signInSocial.mutateAsync({ provider: "google" });
  }, [signInSocial]);

  const onAnonymousSignOutOpenChange = useCallback(
    (open: boolean) => {
      if (!open && signOut.isPending) {
        return;
      }
      setAnonymousSignOutOpen(open);
    },
    [signOut.isPending]
  );

  const onConfirmAnonymousSignOut = useCallback(async () => {
    try {
      await signOut.mutateAsync();
      setAnonymousSignOutOpen(false);
      router.invalidate();
    } catch {
      /* sign-out failed; leave dialog open */
    }
  }, [router, signOut]);

  return (
    <>
      <header className="sticky top-0 z-50 shrink-0 border-border/40 border-b bg-background/10 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-4xl items-center justify-between gap-4 px-4">
          <nav className="flex min-w-0 flex-1 items-center gap-3 text-sm">
            <BrandMark isAuthenticated={isAuthenticated} />
            {isAuthenticated ? (
              <div className="hidden items-center gap-1 md:flex">
                <NavPageLink to="/home">
                  <Trans>Home</Trans>
                </NavPageLink>
                <NavPageLink to="/notes">
                  <Trans>Notes</Trans>
                </NavPageLink>
              </div>
            ) : null}
          </nav>
          <div className="flex shrink-0 items-center gap-1">
            <MobileNavSheet
              isAuthenticated={isAuthenticated}
              onGoogleSignIn={onGoogleSignIn}
              signInPending={signInSocial.isPending}
            />
            <div className="hidden md:contents">
              <LanguageSwitcher />
            </div>
            {isAuthenticated ? (
              <UserMenu
                image={user?.image}
                isAnonymous={isAnonymous}
                onSignOutClick={onSignOutClick}
                signOutPending={signOut.isPending}
                userLabel={userLabel}
              />
            ) : (
              <Button
                className="hidden h-8 px-2 md:inline-flex"
                disabled={signInSocial.isPending}
                onClick={onGoogleSignIn}
                size="sm"
                variant="ghost"
              >
                <Trans>Sign in with Google</Trans>
              </Button>
            )}
          </div>
        </div>
      </header>
      <AlertDialog
        onOpenChange={onAnonymousSignOutOpenChange}
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
              onClick={onConfirmAnonymousSignOut}
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

function BrandMark({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className="grid shrink-0 grid-cols-[auto_auto] items-center gap-x-2 gap-y-[3px]">
      <Link
        aria-hidden="true"
        className="col-start-1 row-span-2 row-start-1 flex items-center transition-opacity hover:opacity-80"
        tabIndex={-1}
        to={isAuthenticated ? "/home" : "/"}
      >
        <LogoMark className="size-6 shrink-0 text-foreground/90" />
      </Link>
      <Link
        className="col-start-2 row-start-1 font-bold text-foreground text-sm leading-none tracking-tight transition-opacity hover:opacity-80"
        to={isAuthenticated ? "/home" : "/"}
      >
        NOTES
      </Link>
      <a
        className="col-start-2 row-start-2 w-fit text-[10px] text-muted-foreground leading-none transition-colors hover:text-foreground"
        href="https://n6.studio"
        rel="noreferrer"
        target="_blank"
      >
        <Trans>by N6 Studio</Trans>
      </a>
    </div>
  );
}

function NavPageLink({
  children,
  className,
  to,
}: {
  children: ReactNode;
  className?: string;
  to: "/home" | "/notes" | "/settings";
}) {
  return (
    <Button
      className={cn(navLinkClassName, className)}
      nativeButton={false}
      render={<Link activeProps={{ "aria-current": "page" }} to={to} />}
      size="sm"
      variant="ghost"
    >
      {children}
    </Button>
  );
}

function MobileNavSheet({
  isAuthenticated,
  onGoogleSignIn,
  signInPending,
}: {
  isAuthenticated: boolean;
  onGoogleSignIn: () => Promise<void>;
  signInPending: boolean;
}) {
  const { t } = useLingui();
  const [open, setOpen] = useState(false);
  const openMenu = useCallback(() => {
    setOpen(true);
  }, []);
  const onSignIn = useCallback(() => {
    setOpen(false);
    return onGoogleSignIn();
  }, [onGoogleSignIn]);

  return (
    <>
      <Button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t`Open menu`}
        className="text-muted-foreground hover:text-foreground md:hidden"
        id="mobile-nav-menu"
        onClick={openMenu}
        size="icon-sm"
        variant="ghost"
      >
        <MenuIcon />
      </Button>
      <Sheet onOpenChange={setOpen} open={open} triggerId="mobile-nav-menu">
        <SheetContent className="w-72 max-w-[85vw] gap-0 p-0" side="right">
          <SheetHeader className="border-border/50 border-b pr-14">
            <SheetTitle>
              <Trans>Menu</Trans>
            </SheetTitle>
            <SheetDescription className="sr-only">
              <Trans>Pages and language</Trans>
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-1 px-3 py-3">
            {isAuthenticated ? (
              <nav className="flex flex-col gap-1">
                <NavPageLink className={sheetLinkClassName} to="/home">
                  <HouseIcon data-icon="inline-start" strokeWidth={2} />
                  <Trans>Home</Trans>
                </NavPageLink>
                <NavPageLink className={sheetLinkClassName} to="/notes">
                  <StickyNoteIcon data-icon="inline-start" strokeWidth={2} />
                  <Trans>Notes</Trans>
                </NavPageLink>
                <NavPageLink className={sheetLinkClassName} to="/settings">
                  <SettingsIcon data-icon="inline-start" strokeWidth={2} />
                  <Trans>Settings</Trans>
                </NavPageLink>
              </nav>
            ) : (
              <Button
                className="h-11 w-full"
                disabled={signInPending}
                onClick={onSignIn}
              >
                <Trans>Sign in with Google</Trans>
              </Button>
            )}
          </div>
          <SheetFooter className="border-border/50 border-t">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-sm">
                <Trans>Language</Trans>
              </span>
              <LanguageSwitcher />
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

function UserMenu({
  image,
  isAnonymous,
  onSignOutClick,
  signOutPending,
  userLabel,
}: {
  image: string | null | undefined;
  isAnonymous: boolean;
  onSignOutClick: () => void;
  signOutPending: boolean;
  userLabel: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={userLabel}
            className="text-muted-foreground hover:text-foreground"
            size="icon-sm"
            variant="ghost"
          />
        }
      >
        {image ? (
          <Avatar size="sm">
            <AvatarImage alt="" referrerPolicy="no-referrer" src={image} />
            <AvatarFallback>{userLabel.slice(0, 1)}</AvatarFallback>
          </Avatar>
        ) : (
          <CircleUserRoundIcon />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">
            {userLabel}
          </DropdownMenuLabel>
          <DropdownMenuItem render={<Link to="/settings" />}>
            <Trans>Settings</Trans>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            closeOnClick={!isAnonymous}
            disabled={signOutPending}
            onClick={onSignOutClick}
            variant="destructive"
          >
            <Trans>Sign out</Trans>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
