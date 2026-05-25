import Link from "next/link";
import { LogOut, Shield } from "lucide-react";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function AppHeader({ title }: { title: string }) {
  const session = await getSession();
  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto max-w-2xl px-4 h-14 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-base font-semibold text-slate-900 leading-tight">
            {title}
          </h1>
          <p className="text-[11px] text-slate-500 leading-tight">
            BranchX · KC Pulogadung
          </p>
        </div>
        <div className="flex items-center gap-2">
          {session && (
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              Hai, {session.name}
            </span>
          )}
          {session?.role === "admin" && (
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              aria-label="Manajemen user"
            >
              <Link href="/admin/users">
                <Shield className="size-4 text-blue-600" />
              </Link>
            </Button>
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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <AppHeader title={title} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-4 pb-24">
        {children}
      </main>
    </div>
  );
}

export { Link };
