import Link from "next/link";
import { ChevronLeft, LogOut } from "lucide-react";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function AppHeader({
  title,
  backHref,
}: {
  title: string;
  backHref?: string;
}) {
  const session = await getSession();
  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto max-w-2xl px-4 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0">
          {backHref && (
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              aria-label="Kembali"
              className="-ml-2"
            >
              <Link href={backHref}>
                <ChevronLeft className="size-5" />
              </Link>
            </Button>
          )}
          <h1 className="text-base font-semibold text-slate-900 leading-tight truncate">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {session && (
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              Hai, {session.name}
            </span>
          )}
          <form action="/logout" method="POST">
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              aria-label="Keluar"
            >
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

export function PageContainer({
  title,
  backHref,
  children,
}: {
  title: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <AppHeader title={title} backHref={backHref} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-4 pb-24">
        {children}
      </main>
    </div>
  );
}

export { Link };
