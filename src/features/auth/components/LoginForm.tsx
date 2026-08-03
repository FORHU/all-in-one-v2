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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const loginMutation = useLogin({ onValidationError: setFieldErrors });

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

    setFieldErrors({});
    loginMutation.mutate(parsed.data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-[400px]"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--shop-ink)]">
          <Shield
            className="h-5 w-5 text-[var(--shop-bg)]"
            strokeWidth={2.25}
          />
        </div>
        <h1 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          Welcome Back
        </h1>
        <p className="mt-1.5 text-sm text-[var(--shop-text-muted)]">
          Sign in to Admin Central
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Work email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]"
          >
            Work Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email)
                setFieldErrors((prev) => ({ ...prev, email: [] }));
            }}
            placeholder="name@company.com"
            aria-invalid={Boolean(fieldErrors.email?.length)}
            className={`w-full rounded-md border bg-[var(--shop-surface)] px-3.5 py-2.5 text-sm text-[var(--shop-text)] outline-none transition placeholder:text-[var(--shop-text-muted)] focus:ring-2 focus:ring-[var(--shop-accent)]/20 ${
              fieldErrors.email?.length
                ? "border-[var(--shop-danger)]"
                : "border-[var(--shop-border)] focus:border-[var(--shop-accent)]"
            }`}
          />
          {fieldErrors.email?.[0] && (
            <p className="mt-1.5 text-xs font-medium text-[var(--shop-danger)]">
              {fieldErrors.email[0]}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password)
                  setFieldErrors((prev) => ({ ...prev, password: [] }));
              }}
              placeholder="••••••••"
              aria-invalid={Boolean(fieldErrors.password?.length)}
              className={`w-full rounded-md border bg-[var(--shop-surface)] px-3.5 py-2.5 pr-11 text-sm text-[var(--shop-text)] outline-none transition placeholder:text-[var(--shop-text-muted)] focus:ring-2 focus:ring-[var(--shop-accent)]/20 ${
                fieldErrors.password?.length
                  ? "border-[var(--shop-danger)]"
                  : "border-[var(--shop-border)] focus:border-[var(--shop-accent)]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-[var(--shop-text-muted)] transition hover:text-[var(--shop-text)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {fieldErrors.password?.[0] && (
            <p className="mt-1.5 text-xs font-medium text-[var(--shop-danger)]">
              {fieldErrors.password[0]}
            </p>
          )}
        </div>

        {/* Primary CTA */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--shop-accent-dark)] px-4 py-3 text-[13px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
          {!isSubmitting && (
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-[var(--shop-text-muted)]">
        New to the platform?{" "}
        <button
          type="button"
          onClick={() => router.push("/register")}
          className="font-semibold text-[var(--shop-accent-dark)] hover:underline"
        >
          Create an account
        </button>
      </p>
    </motion.div>
  );
}
