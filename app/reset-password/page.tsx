"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useMutation } from "@apollo/client"
import { RESET_PASSWORD } from "@/graphql/mutation"
import ResetPasswordForm from "@/components/auth/ResetPasswordForm"
import { type ResetPasswordFormData } from "@/lib/validations"

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [resetPassword] = useMutation(RESET_PASSWORD)

  // const searchParams = useSearchParams();
  const token = params.token

  const handleSubmit = async (data: ResetPasswordFormData) => {

    setIsLoading(true)

    try {
      await resetPassword({ variables: { token, newPassword: data.password } })

      toast({
        title: "Password Reset Successful",
        description: "You can now log in with your new password.",
      })

      setPassword("")
      setConfirmPassword("")
      router.push("/auth")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
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
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
