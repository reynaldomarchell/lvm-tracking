"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserAction, type FormState } from "./actions";
import { USER_ROLES } from "@/lib/db/schema";

const initial: FormState = {};

export function AddUserForm() {
  const [open, setOpen] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (prev: FormState, fd: FormData): Promise<FormState> => {
      const res = await createUserAction(prev, fd);
      if (res.ok) {
        toast.success("User baru dibuat.");
        setOpen(false);
      } else if (res.error) {
        toast.error(res.error);
      }
      return res;
    },
    initial,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="size-4" />
          Tambah user
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah user baru</DialogTitle>
          <DialogDescription>
            Buat akun untuk anggota tim. Berikan username + password ke user.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="add-username">Username</Label>
            <Input
              id="add-username"
              name="username"
              required
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="cth. johndoe"
            />
            <p className="text-[11px] text-slate-400">
              Huruf kecil, angka, titik, underscore. Min 3 karakter.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-name">Nama lengkap</Label>
            <Input
              id="add-name"
              name="name"
              required
              placeholder="cth. John Doe"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-password">Password</Label>
            <div className="relative">
              <Input
                id="add-password"
                name="password"
                type={showPw ? "text" : "password"}
                required
                placeholder="Min 6 karakter"
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Sembunyikan" : "Tampilkan"}
                className="absolute right-1 top-1/2 -translate-y-1/2 size-9 rounded-md inline-flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                tabIndex={-1}
              >
                {showPw ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-role">Role</Label>
            <Select name="role" defaultValue="staff">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r === "admin" ? "Admin" : "Staff"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-400">
              Admin bisa mengelola user lain.
            </p>
          </div>
          {state.error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md p-2">
              {state.error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
