"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { loginAction, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-svh w-full bg-gradient-to-br from-[#2644ea] via-[#4085f2] to-[#8fb8f8] flex items-center justify-center p-6">
      <form
        action={formAction}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl px-8 py-10 space-y-6"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="size-20 rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/logo.png"
              alt="Livin' Merchant"
              width={160}
              height={160}
              className="size-full object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Livin&apos; &amp; Merchant Tracker
            </h1>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="cth. johndoe"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="h-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="absolute right-1 top-1/2 -translate-y-1/2 size-9 rounded-md inline-flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {state.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-2 text-center">
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
        >
          <LogIn className="size-4" />
          {pending ? "Masuk…" : "Masuk"}
        </Button>
      </form>
    </div>
  );
}
