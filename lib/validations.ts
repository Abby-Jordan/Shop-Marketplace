import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .email("Please enter a valid email address"),

  password: z
    .string()
    .nonempty("Password is required")
    .min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  name: z.string().nonempty("Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().nonempty("Email is required").email("Please enter a valid email address"),
  password: z.string().nonempty("Password is required").min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms and conditions" }),
  })
  ,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const profileSchema = z.object({
  name: z.string().nonempty("Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().nonempty("Email is required").email("Please enter a valid email address"),
  phoneNumber: z.string().nonempty("Number is required").min(10, "Please enter a valid phone number"),
  address: z.object({
    street: z.string().nonempty("Street is required").min(5, "Please enter a valid street address"),
    city: z.string().nonempty("City is required").min(2, "Please enter a valid city"),
    state: z.string().nonempty("State is required").min(2, "Please enter a valid state"),
    zipCode: z.string().nonempty("Zipcode is required").min(6, "Please enter a valid zip code"),
  }),
})

export const contactSchema = z.object({
  name: z.string().nonempty("Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().nonempty("Email is required").email("Please enter a valid email address"),
  subject: z.string().nonempty("Subject is required").min(5, "Subject must be at least 5 characters"),
  message: z.string().nonempty("Message is required").min(10, "Message must be at least 10 characters"),
})

export const forgotPasswordSchema = z.object({
  email: z.string().nonempty("Email is required").email("Please enter a valid email address"),
})

export const resetPasswordSchema = z.object({
  password: z.string().nonempty("Password is required").min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().nonempty("Current password is required"),
  newPassword: z.string().nonempty("New password is required").min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type ContactFormData = z.infer<typeof contactSchema> 
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>