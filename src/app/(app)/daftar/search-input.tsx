"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 250;

export function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQ = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlQ);
  const [pending, startTransition] = useTransition();

  // Sync local state if the URL `q` changes externally (e.g. back navigation).
  useEffect(() => {
    setValue(urlQ);
  }, [urlQ]);

  // Debounce: push value to URL once the user stops typing.
  useEffect(() => {
    if (value === urlQ) return;
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("q", value);
      else params.delete("q");
      startTransition(() => {
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [value, urlQ, pathname, router, searchParams]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari nama, pemilik, alamat…"
        className="pl-9 pr-9 h-11"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
        {pending ? (
          <Loader2 className="size-4 text-slate-400 animate-spin" />
        ) : value ? (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Bersihkan"
            className="size-7 rounded-md inline-flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
