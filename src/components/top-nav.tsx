import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

export function TopNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const session = authClient.useSession();

  return (
    <header className="sticky top-0 z-50 border-border/40 border-b bg-background/40 backdrop-blur-md">
      <div className="mx-auto flex h-11 max-w-3xl items-center justify-between gap-4 px-4">
        <Link
          className="font-medium text-foreground/90 tracking-tight transition-opacity hover:opacity-80"
          to="/"
        >
          Dump
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {isAuthenticated ? (
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
              <Button
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                onClick={async () => {
                  await authClient.signOut();
                  await router.invalidate();
                }}
                size="sm"
                variant="ghost"
              >
                Sign out
              </Button>
            </>
          ) : (
            <Button
              className="h-8 px-2"
              onClick={async () => {
                await authClient.signIn.social({ provider: "google" });
              }}
              size="sm"
              variant="ghost"
            >
              Google
            </Button>
          )}
          {session.data?.user?.isAnonymous === true && (
            <span className="ml-2 hidden text-[11px] text-muted-foreground sm:inline">
              Anonymous
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
