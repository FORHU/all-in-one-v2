"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, UserPlus } from "lucide-react";

/**
 * UI-only registration form. Fields match all-in-one-api POST /api/v1/auth/register:
 * email, username, password (min 6). No backend call yet.
 */
export function RegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !username.trim() || !password.trim()) return;

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    // Demo only — replace with real register API later
    router.push("/");
  };

  const inputClassName =
    "w-full rounded-md border border-[#d1d5db] bg-white px-3.5 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20";

  const labelClassName =
    "mb-2 block text-[11px] font-bold uppercase tracking-wide text-[#374151]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-[440px]"
    >
      <div className="rounded-lg border border-[#e5e7eb] bg-white px-8 py-10 shadow-sm sm:px-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563eb]">
            <UserPlus className="h-6 w-6 text-white" strokeWidth={2.25} />
          </div>
          <h1 className="text-[1.65rem] font-bold tracking-tight text-[#111827]">
            Create Account
          </h1>
          <p className="mt-1.5 text-sm text-[#6b7280]">
            Join Admin Central to manage your store
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className={labelClassName}>
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
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="username" className={labelClassName}>
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jdoe"
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClassName}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className={`${inputClassName} pr-11`}
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

          <div>
            <label htmlFor="confirmPassword" className={labelClassName}>
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={`${inputClassName} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] transition hover:text-[#6b7280]"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2563eb] px-4 py-3 text-[13px] font-bold uppercase tracking-wide text-white transition hover:bg-[#1d4ed8] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account…" : "Create Account"}
            {!isSubmitting && (
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            )}
          </button>
        </form>

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

      <p className="mt-6 text-center text-sm text-[#6b7280]">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="font-semibold text-[#2563eb] hover:underline"
        >
          Sign in
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
