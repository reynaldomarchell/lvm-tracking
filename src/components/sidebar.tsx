"use client";

import Link from "next/link";
import Image from "next/image";
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
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/daftar", label: "Daftar Merchant", icon: List },
  { href: "/peta", label: "Peta", icon: Map },
];

const ADMIN_ITEM: NavItem = {
  href: "/admin/users",
  label: "Manajemen User",
  icon: Shield,
};

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const items = isAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;
  const tambahHref = `/tambah?from=${encodeURIComponent(pathname)}`;

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r bg-white sticky top-0 h-svh">
      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Livin' Merchant"
          width={40}
          height={40}
          className="size-10 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-tight">
            Livin&apos; Merchant
          </p>
          <p className="text-[10px] text-slate-500 leading-tight">
            BranchX · KC Pulogadung
          </p>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="px-4 pb-4">
        <Link
          href={tambahHref}
          className="flex items-center justify-center gap-2 h-11 rounded-lg bg-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-600/25 hover:bg-blue-700 transition active:scale-[0.98]"
        >
          <Plus className="size-5" />
          Tambah Merchant
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 space-y-1 overflow-y-auto border-t pt-4">
        <p className="px-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Menu
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
