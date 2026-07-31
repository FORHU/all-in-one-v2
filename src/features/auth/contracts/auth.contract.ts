import { z } from "zod";

/** Body for POST /api/v2/auth/register */
export const RegisterInputSchema = z.object({
  email: z.string().email("Enter a valid email"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

/** Nested payload inside API `data` */
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
  data: RegisterResultSchema,
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type RegisterResult = z.infer<typeof RegisterResultSchema>;

/** Body for POST /api/v2/auth/login */
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
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
  avatar: z.string().nullable().optional(),
  onboardingStatus: z.boolean().optional(),
  onboardingCompleted: z.boolean().optional(),
});

export const LoginResultSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: LoginUserSchema,
});

/** Full HTTP body from all-in-one-api */
export const LoginResponseSchema = z.object({
  message: z.string(),
  data: LoginResultSchema,
});

export type LoginResult = z.infer<typeof LoginResultSchema>;

/**
 * Body for POST /api/v2/auth/refresh-token.
 * Unlike login/register, this endpoint responds with the result directly —
 * no `{ message, data }` envelope — but the inner shape is identical to
 * LoginResultSchema, so we reuse it rather than duplicate the fields.
 */
export const RefreshTokenResultSchema = LoginResultSchema;

export type RefreshTokenResult = LoginResult;

/**
 * Body for GET /api/v2/users/me.
 * Response is `{ status, statusCode, data }` — no `message` key, unlike
 * login/register/refresh-token, since the backend only adds `message` when
 * one is explicitly passed to its response helper.
 */
export const AuthMeSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  name: z.string().nullable(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN", "DEVELOPER"]),
  onboardingCompleted: z.boolean().optional(),
  avatar: z
    .object({ fileUrl: z.string().nullable().optional() })
    .nullable()
    .optional(),
});

export const AuthMeResponseSchema = z.object({
  data: AuthMeSchema,
});

export type AuthMe = z.infer<typeof AuthMeSchema>;
