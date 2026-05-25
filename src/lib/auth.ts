import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@/lib/db/schema";

const COOKIE_NAME = "lvm_session";
const ALG = "HS256";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string;
  username: string;
  name: string;
  role: UserRole;
  iat?: number;
  exp?: number;
};

export async function createSession(
  payload: Omit<SessionPayload, "iat" | "exp">,
): Promise<string> {
  return await new SignJWT({
    sub: payload.sub,
    username: payload.username,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== "admin") throw new Error("FORBIDDEN");
  return session;
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
