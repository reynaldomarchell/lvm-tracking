"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ResponsiveSheet } from "@/components/responsive-sheet";

export function MerchantDetailSheet({
  title,
  exitTo = "/daftar",
  backHref,
  children,
}: {
  title: string;
  /** Where the X (close) button should navigate to — exits the entire modal stack. */
  exitTo?: string;
  /** If provided, renders a back arrow that goes one step back. */
  backHref?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <ResponsiveSheet
      open
      title={title}
      onOpenChange={(open) => {
        if (!open) router.push(exitTo);
      }}
    >
      <div className="relative px-4 pt-12 pb-10">
        {backHref && (
          <Link
            href={backHref}
            className="absolute top-3 left-3 z-10 inline-flex items-center gap-0.5 h-8 pl-1 pr-2.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <ChevronLeft className="size-4" />
            Kembali
          </Link>
        )}
        {children}
      </div>
    </ResponsiveSheet>
  );
}
