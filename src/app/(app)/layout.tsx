import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col">{children}</div>
      <BottomNav />
    </div>
  );
}
