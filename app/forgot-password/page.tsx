"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useMutation } from "@apollo/client"
import { FORGOT_PASSWORD } from "@/graphql/mutation"
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm"
import type { ForgotPasswordFormData } from "@/lib/validations"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [forgotPassword] = useMutation(FORGOT_PASSWORD)

  const handleSubmit = async (data: ForgotPasswordFormData, reset: () => void) => {
    setIsLoading(true)

    try {
      await forgotPassword({ variables: { email: data.email } })

      toast({
        title: "Reset Link Sent",
        description: "Check your email to reset your password.",
      })
      reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />
          <div className="mt-4 text-center text-sm">
            Remember your password?{" "}
            <Link href="/login" className="text-red-600 hover:underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
