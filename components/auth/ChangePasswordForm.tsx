"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/validations"

type Props = {
  onSubmit: (
    data: ChangePasswordFormData,
    reset: () => void,
    setIsLoading: (loading: boolean) => void
  ) => void
}

export default function ChangePasswordForm({ onSubmit }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const togglePassword = (key: keyof typeof showPassword) =>
    setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleSubmit = (data: ChangePasswordFormData) =>
    onSubmit(data, form.reset, setIsLoading)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" noValidate>
        {[
          { name: "currentPassword", label: "Current Password", showKey: "current" },
          { name: "newPassword", label: "New Password", showKey: "new" },
          { name: "confirmPassword", label: "Confirm New Password", showKey: "confirm" },
        ].map(({ name, label, showKey }) => (
          <FormField
            key={name}
            control={form.control}
            name={name as keyof ChangePasswordFormData}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword[showKey as keyof typeof showPassword] ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => togglePassword(showKey as keyof typeof showPassword)}
                    >
                      {showPassword[showKey as keyof typeof showPassword] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
          {isLoading ? "Changing Password..." : "Change Password"}
        </Button>
      </form>
    </Form>
  )
}
