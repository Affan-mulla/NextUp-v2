import z from "zod";

// Zod schema for password form with conditional validation
export const createPasswordSchema = (hasCredentials: boolean) =>
  z
    .object({
      currentPassword: hasCredentials
        ? z.string().min(1, "Current password is required")
        : z.string().optional(),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password is too long"),
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
    .refine(
      (data) => {
        // New password must be different from current (if exists)
        if (hasCredentials && data.currentPassword) {
          return data.newPassword !== data.currentPassword;
        }
        return true;
      },
      {
        message: "New password must be different from current password",
        path: ["newPassword"],
      }
    );

export type PasswordFormValues = z.infer<
  ReturnType<typeof createPasswordSchema>
>;
