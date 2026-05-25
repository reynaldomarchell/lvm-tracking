"use client";

import { useState, useTransition } from "react";
import {
  KeyRound,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteUserAction,
  resetPasswordAction,
  updateUserAction,
} from "./actions";
import { USER_ROLES, type User } from "@/lib/db/schema";

export function UserRowActions({
  user,
  isSelf,
}: {
  user: User;
  isSelf: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Aksi">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="size-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setResetOpen(true)}>
            <KeyRound className="size-3.5" />
            Reset password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isSelf}
            onClick={() => setDeleteOpen(true)}
            className="text-red-600 focus:text-red-700"
          >
            <Trash2 className="size-3.5" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={user}
        isSelf={isSelf}
      />
      <ResetPasswordDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        user={user}
      />
      <DeleteUserDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        user={user}
      />
    </>
  );
}

function EditUserDialog({
  open,
  onOpenChange,
  user,
  isSelf,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: User;
  isSelf: boolean;
}) {
  const [pending, start] = useTransition();
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(user.isActive);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>
            Ubah nama, role, atau status aktif untuk {user.username}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input value={user.username} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Nama lengkap</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as typeof role)}
              disabled={isSelf}
            >
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
            {isSelf && (
              <p className="text-xs text-slate-400">
                Kamu tidak bisa mengubah role akunmu sendiri.
              </p>
            )}
          </div>
          <label className="flex items-center justify-between gap-2 py-2">
            <span className="text-sm font-medium">Akun aktif</span>
            <input
              type="checkbox"
              checked={isActive}
              disabled={isSelf}
              onChange={(e) => setIsActive(e.target.checked)}
              className="size-4 accent-blue-600"
            />
          </label>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Batal
          </Button>
          <Button
            disabled={pending}
            onClick={() =>
              start(async () => {
                const fd = new FormData();
                fd.set("id", user.id);
                fd.set("name", name);
                fd.set("role", role);
                fd.set("isActive", isActive ? "true" : "");
                const res = await updateUserAction({}, fd);
                if (res.error) {
                  toast.error(res.error);
                } else {
                  toast.success("User diperbarui.");
                  onOpenChange(false);
                }
              })
            }
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: User;
}) {
  const [pending, start] = useTransition();
  const [pw, setPw] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Set password baru untuk <strong>{user.username}</strong>. Berikan
            password ini ke user yang bersangkutan.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="new-pw">Password baru</Label>
          <Input
            id="new-pw"
            type="text"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Minimal 6 karakter"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Batal
          </Button>
          <Button
            disabled={pending || !pw}
            onClick={() =>
              start(async () => {
                const res = await resetPasswordAction(user.id, pw);
                if (res.error) {
                  toast.error(res.error);
                } else {
                  toast.success("Password berhasil di-reset.");
                  setPw("");
                  onOpenChange(false);
                }
              })
            }
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteUserDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: User;
}) {
  const [pending, start] = useTransition();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus user?</DialogTitle>
          <DialogDescription>
            User <strong>{user.username}</strong> ({user.name}) akan dihapus
            permanen. Aksi ini tidak bisa dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await deleteUserAction(user.id);
                if (res.error) {
                  toast.error(res.error);
                } else {
                  toast.success("User dihapus.");
                  onOpenChange(false);
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
  );
}
