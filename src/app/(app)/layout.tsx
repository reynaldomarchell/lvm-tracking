import { BottomNav } from "@/components/bottom-nav";
import { Sidebar } from "@/components/sidebar";
import { getSession } from "@/lib/auth";

export default async function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const session = await getSession();
  const isAdmin = session?.role === "admin";
  return (
    <div className="flex flex-1 min-h-svh">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex flex-1 flex-col">{children}</div>
        {modal}
        <BottomNav isAdmin={isAdmin} />
      </div>
    </div>
  );
}
