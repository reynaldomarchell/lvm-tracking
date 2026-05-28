"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

export function ResponsiveSheet({
  open,
  onOpenChange,
  children,
  title,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title: string;
  className?: string;
}) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Avoid hydration mismatch — render nothing until we know the viewport.
  if (!mounted) return null;

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          aria-describedby={undefined}
          className={cn(
            "overflow-y-auto gap-0 bg-slate-50 !w-full sm:!max-w-md md:!max-w-lg",
            className,
          )}
        >
          <SheetTitle className="sr-only">{title}</SheetTitle>
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  // Mobile: bottom drawer with swipe-to-dismiss + visible drag handle (built into vaul).
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        aria-describedby={undefined}
        className={cn("bg-slate-50 max-h-[92vh]", className)}
      >
        <DrawerTitle className="sr-only">{title}</DrawerTitle>
        <div className="overflow-y-auto overscroll-contain">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
