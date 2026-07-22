"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Shield } from "lucide-react";
import { useLogin } from "../hooks/useLogin";
import { LoginInputSchema } from "../contracts/auth.contract";
import { notify } from "@/shared/lib/notify";

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isSubmitting = loginMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const parsed = LoginInputSchema.safeParse({
      email: email.trim(),
      password,
    });

    if (!parsed.success) {
      notify.error(parsed.error.issues[0]?.message ?? "Invalid form data.");
      return;
    }

    loginMutation.mutate(parsed.data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-[440px]"
    >
      <div className="rounded-lg border border-[#e5e7eb] bg-white px-8 py-10 shadow-sm sm:px-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563eb]">
            <Shield className="h-6 w-6 text-white" strokeWidth={2.25} />
          </div>
          <h1 className="text-[1.65rem] font-bold tracking-tight text-[#111827]">
            Admin Central
          </h1>
          <p className="mt-1.5 text-sm text-[#6b7280]">
            Secure E-commerce Management Suite
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Work email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[#374151]"
            >
              Work Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-md border border-[#d1d5db] bg-white px-3.5 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
            />
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-[11px] font-bold uppercase tracking-wide text-[#374151]"
              >
                Password
              </label>
              <button
                type="button"
                className="text-xs font-medium text-[#2563eb] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-[#d1d5db] bg-white px-3.5 py-2.5 pr-11 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] transition hover:text-[#6b7280]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2563eb] px-4 py-3 text-[13px] font-bold uppercase tracking-wide text-white transition hover:bg-[#1d4ed8] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in to Dashboard"}
            {!isSubmitting && (
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            )}
          </button>
        </form>

        {/* Enterprise SSO */}
        <div className="mt-7">
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e7eb]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                All IN ONE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-[#6b7280]">
        New to the platform?{" "}
        <button
          type="button"
          onClick={() => router.push("/register")}
          className="font-semibold text-[#2563eb] hover:underline"
        >
          Create an account
        </button>
      </p>

      <nav className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
        <button type="button" className="hover:text-[#6b7280]">
          Privacy Policy
        </button>
        <span aria-hidden>•</span>
        <button type="button" className="hover:text-[#6b7280]">
          Terms of Service
        </button>
        <span aria-hidden>•</span>
        <button type="button" className="hover:text-[#6b7280]">
          Support
        </button>
      </nav>
    </motion.div>
  );
}
