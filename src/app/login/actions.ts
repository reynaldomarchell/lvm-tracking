"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { createSession, setSessionCookie } from "@/lib/auth";
import { verifyPassword } from "@/lib/passwords";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!username) return { error: "Username tidak boleh kosong." };
  if (!password) return { error: "Password tidak boleh kosong." };

  const found = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  const user = found[0];

  if (!user || !user.isActive) {
    return { error: "Username atau password salah." };
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { error: "Username atau password salah." };
  }

  const token = await createSession({
    sub: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  });
  await setSessionCookie(token);
  redirect("/dashboard");
}
