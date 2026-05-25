"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteVisitAction } from "@/app/(app)/merchants/[id]/kunjungan/actions";

export function VisitDeleteButton({ visitId }: { visitId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Hapus kunjungan"
        className="text-slate-400 hover:text-red-600 hover:bg-red-50"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus kunjungan ini?</DialogTitle>
            <DialogDescription>
              Catatan kunjungan akan dihapus permanen. Insight yang sudah
              ter-merge ke profil merchant tidak ikut terhapus — kamu bisa
              edit manual lewat catatan baru kalau perlu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await deleteVisitAction(visitId);
                  if (res.error) {
                    toast.error(res.error);
                  } else {
                    toast.success("Kunjungan dihapus.");
                    setOpen(false);
                  }
                })
              }
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
