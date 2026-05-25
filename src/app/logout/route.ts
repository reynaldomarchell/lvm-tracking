import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

// 303 See Other forces the browser to redirect with GET, regardless of the
// original method. Without it, NextResponse.redirect defaults to 307 which
// preserves POST, causing /login to 405 in production.
export async function POST(request: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", request.url), 303);
}

export async function GET(request: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
