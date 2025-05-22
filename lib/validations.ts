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
    country: z.string().nonempty("Country is required").min(2, "Please enter a valid country"),
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

export const CategorySchema = z.object({
  name: z.string().nonempty("Name is required").min(2, "Name must be at least 2 characters"),
  description: z.string().nonempty("Description is required").min(10, "Description must be at least 10 characters"),
  image: z.any().refine((val) => val !== null && val !== undefined, {
    message: "Image is required",
  })
})

export const ProductSchema = z.object({
  name: z.string().nonempty("Name is required").min(2, "Name must be at least 2 characters"),
  description: z.string().nonempty("Description is required").min(10, "Description must be at least 10 characters"),
  longDescription: z.string().optional(),
  price: z.string().nonempty("Price is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number"
  }),
  discountedPrice: z.string().optional().refine((val) => {
    if (!val) return true
    const num = Number(val)
    return !isNaN(num) && num >= 0
  }, {
    message: "Discounted price must be a non-negative number"
  }),
  image: z.any().refine((val) => val !== null && val !== undefined, {
    message: "Image is required",
  }),
  categoryId: z.string().nonempty("Category is required"),
  inStock: z.boolean(),
  sizes: z.array(z.object({
    value: z.string().nonempty("Size value is required"),
    label: z.string().nonempty("Size label is required"),
    price: z.string().nonempty("Size price is required").refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Size price must be a non-negative number"
    })
  })).optional(),
  nutritionFacts: z.array(z.object({
    name: z.string().nonempty("Nutrition fact name is required"),
    value: z.string().nonempty("Nutrition fact value is required")
  })).optional(),
  features: z.array(z.object({
    text: z.string().nonempty("Feature text is required")
  })).optional()
}).refine((data) => {
  if (data.discountedPrice) {
    return Number(data.discountedPrice) < Number(data.price)
  }
  return true
}, {
  message: "Discounted price must be less than regular price",
  path: ["discountedPrice"]
})

export const UserSchema = z.object({
  name: z.string().nonempty("Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().nonempty("Email is required").email("Please enter a valid email address"),
  isAdmin: z.boolean(),
  status: z.enum(["ACTIVE", "INACTIVE", "DEACTIVATED"]).optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type ContactFormData = z.infer<typeof contactSchema> 
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type CategoryFormData = z.infer<typeof CategorySchema>
export type ProductFormData = z.infer<typeof ProductSchema>
export type UserFormData = z.infer<typeof UserSchema>
