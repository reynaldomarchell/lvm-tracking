"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  List,
  Map,
  Plus,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
};

const BASE_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/daftar", label: "Daftar", icon: List },
  { href: "/tambah", label: "Tambah", icon: Plus, primary: true },
  { href: "/peta", label: "Peta", icon: Map },
];

const ADMIN_ITEM: NavItem = {
  href: "/admin/users",
  label: "Admin",
  icon: Shield,
};

export function BottomNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const items = isAdmin ? [...BASE_ITEMS, ADMIN_ITEM] : BASE_ITEMS;

  return (
    <nav className="sticky bottom-0 z-[1000] border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex max-w-2xl items-stretch justify-around px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="-mt-6 flex flex-col items-center gap-1"
              >
                <span className="size-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center transition active:scale-95">
                  <Icon className="size-6" />
                </span>
                <span className="text-[11px] font-medium text-slate-600">
                  {item.label}
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium",
                active ? "text-blue-700" : "text-slate-500",
              )}
            >
              <Icon className={cn("size-5", active && "text-blue-600")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
