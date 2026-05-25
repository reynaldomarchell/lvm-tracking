"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { users, USER_ROLES } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { generateUserId, hashPassword } from "@/lib/passwords";

const UsernameSchema = z
  .string()
  .min(3, "Username minimal 3 karakter")
  .max(32, "Username maksimal 32 karakter")
  .regex(/^[a-z0-9_.]+$/, "Hanya huruf kecil, angka, titik, underscore");

const PasswordSchema = z
  .string()
  .min(6, "Password minimal 6 karakter")
  .max(72, "Password maksimal 72 karakter");

const CreateSchema = z.object({
  username: UsernameSchema,
  name: z.string().min(1, "Nama lengkap wajib diisi").max(100),
  password: PasswordSchema,
  role: z.enum(USER_ROLES),
});

const UpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  role: z.enum(USER_ROLES),
  isActive: z.boolean(),
});

export type FormState = {
  error?: string;
  ok?: boolean;
};

export async function createUserAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = CreateSchema.safeParse({
    username: String(formData.get("username") ?? "")
      .trim()
      .toLowerCase(),
    name: String(formData.get("name") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "staff"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Form tidak valid." };
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, parsed.data.username))
    .limit(1);
  if (existing[0]) {
    return { error: "Username sudah dipakai." };
  }

  await db.insert(users).values({
    id: generateUserId(),
    username: parsed.data.username,
    name: parsed.data.name,
    passwordHash: await hashPassword(parsed.data.password),
    role: parsed.data.role,
    isActive: true,
    createdBy: admin.username,
  });

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function updateUserAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = UpdateSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    role: String(formData.get("role") ?? "staff"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Form tidak valid." };
  }

  // Safety: don't let an admin demote / deactivate themselves
  if (parsed.data.id === admin.sub) {
    if (parsed.data.role !== "admin") {
      return { error: "Tidak bisa mengubah role akunmu sendiri." };
    }
    if (!parsed.data.isActive) {
      return { error: "Tidak bisa menonaktifkan akunmu sendiri." };
    }
  }

  // Safety: keep at least one active admin
  if (parsed.data.role !== "admin" || !parsed.data.isActive) {
    const otherAdmins = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.role, "admin"),
          eq(users.isActive, true),
          ne(users.id, parsed.data.id),
        ),
      )
      .limit(1);
    if (!otherAdmins[0]) {
      return { error: "Harus ada minimal 1 admin aktif." };
    }
  }

  await db
    .update(users)
    .set({
      name: parsed.data.name,
      role: parsed.data.role,
      isActive: parsed.data.isActive,
      updatedAt: new Date(),
    })
    .where(eq(users.id, parsed.data.id));

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function resetPasswordAction(
  userId: string,
  newPassword: string,
): Promise<FormState> {
  await requireAdmin();
  const parsed = PasswordSchema.safeParse(newPassword);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Password tidak valid." };
  }
  await db
    .update(users)
    .set({
      passwordHash: await hashPassword(parsed.data),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUserAction(userId: string): Promise<FormState> {
  const admin = await requireAdmin();
  if (userId === admin.sub) {
    return { error: "Tidak bisa menghapus akunmu sendiri." };
  }
  const target = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!target[0]) return { error: "User tidak ditemukan." };

  if (target[0].role === "admin") {
    const otherAdmins = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.role, "admin"),
          eq(users.isActive, true),
          ne(users.id, userId),
        ),
      )
      .limit(1);
    if (!otherAdmins[0]) {
      return { error: "Harus ada minimal 1 admin aktif." };
    }
  }

  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/admin/users");
  return { ok: true };
}
