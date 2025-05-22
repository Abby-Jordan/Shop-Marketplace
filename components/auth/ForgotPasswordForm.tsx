"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations"

export default function ForgotPasswordForm({ onSubmit, isLoading }: { 
  onSubmit: (data: ForgotPasswordFormData, reset: () => void) => void,
  isLoading: boolean 
}) {
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => onSubmit(data, () => form.reset()))} className="space-y-6" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
          {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
        </Button>
      </form>
    </Form>
  )
} 