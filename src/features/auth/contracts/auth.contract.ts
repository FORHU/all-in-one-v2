import { z } from "zod";

/** Body for POST /api/v1/auth/register */
export const RegisterInputSchema = z.object({
  email: z.string().email("Enter a valid email"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

/** Nested payload inside API `response` */
export const RegisterUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
});

export const RegisterResultSchema = z.object({
  user: RegisterUserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  message: z.string().optional(),
});

/** Full HTTP body from all-in-one-api */
export const RegisterResponseSchema = z.object({
  message: z.string(),
  response: RegisterResultSchema,
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type RegisterResult = z.infer<typeof RegisterResultSchema>;

/** Body for POST /api/v1/auth/login */
export const LoginInputSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

export const LoginUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  name: z.string().nullable().optional(),
  role: z.enum(["USER", "ADMIN"]),
  avatar: z.string().nullable().optional(),
  onboardingStatus: z.boolean().optional(),
});

export const LoginResultSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: LoginUserSchema,
});

export type LoginResult = z.infer<typeof LoginResultSchema>;
