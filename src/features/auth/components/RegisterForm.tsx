"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, UserPlus } from "lucide-react";
import { useRegister } from "../hooks/useRegister";
import { RegisterInputSchema } from "../contracts/auth.contract";
import { notify } from "@/shared/lib/notify";

type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
};

function getPasswordStrength(password: string): PasswordStrength {
  const criteria = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = criteria.filter(Boolean).length as PasswordStrength["score"];

  const byScore: Record<PasswordStrength["score"], [string, string]> = {
    0: ["Weak", "var(--shop-danger)"],
    1: ["Weak", "var(--shop-danger)"],
    2: ["Fair", "var(--shop-warning)"],
    3: ["Good", "var(--shop-neutral)"],
    4: ["Strong", "var(--shop-success)"],
  };
  const [label, color] = byScore[score];

  return { score, label, color };
}

export function RegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerMutation = useRegister();
  const isSubmitting = registerMutation.isPending;
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      notify.error("Passwords do not match.");
      return;
    }

    const parsed = RegisterInputSchema.safeParse({
      email: email.trim(),
      username: username.trim(),
      password,
    });

    if (!parsed.success) {
      notify.error(parsed.error.issues[0]?.message ?? "Invalid form data.");
      return;
    }

    registerMutation.mutate(parsed.data);
  };

  const inputClassName =
    "w-full rounded-md border border-[var(--shop-border)] bg-[var(--shop-surface)] px-3.5 py-2.5 text-sm text-[var(--shop-text)] outline-none transition placeholder:text-[var(--shop-text-muted)] focus:border-[var(--shop-accent)] focus:ring-2 focus:ring-[var(--shop-accent)]/20";

  const labelClassName =
    "mb-2 block text-[11px] font-bold uppercase tracking-wide text-[var(--shop-text-muted)]";

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
          <UserPlus
            className="h-5 w-5 text-[var(--shop-bg)]"
            strokeWidth={2.25}
          />
        </div>
        <h1 className="shop-display text-2xl font-bold uppercase tracking-tight text-[var(--shop-text)]">
          Create Account
        </h1>
        <p className="mt-1.5 text-sm text-[var(--shop-text-muted)]">
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
          {password.length > 0 && (
            <div className="mt-2.5" aria-live="polite">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{
                      backgroundColor:
                        i < strength.score
                          ? strength.color
                          : "var(--shop-border)",
                    }}
                  />
                ))}
              </div>
              <p
                className="mt-1.5 text-xs font-medium"
                style={{ color: strength.color }}
              >
                {strength.label} password
              </p>
            </div>
          )}
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
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-[var(--shop-text-muted)] transition hover:text-[var(--shop-text)]"
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

        {/* Primary CTA */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--shop-accent-dark)] px-4 py-3 text-[13px] font-bold uppercase tracking-wide text-white transition hover:brightness-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account…" : "Create Account"}
          {!isSubmitting && (
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-[var(--shop-text-muted)]">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="font-semibold text-[var(--shop-accent-dark)] hover:underline"
        >
          Sign in
        </button>
      </p>
    </motion.div>
  );
}
