"use client";

import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f4f6] px-4 py-12">
      <RegisterForm />
    </div>
  );
}
