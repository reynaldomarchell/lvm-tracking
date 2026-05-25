import { BottomNav } from "@/components/bottom-nav";
import { getSession } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col">{children}</div>
      <BottomNav isAdmin={session?.role === "admin"} />
    </div>
  );
}
