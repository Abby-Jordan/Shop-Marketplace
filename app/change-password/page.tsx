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
import { CHANGE_PASSWORD } from "@/graphql/mutation"
import ChangePasswordForm from "@/components/auth/ChangePasswordForm"
import { ChangePasswordFormData } from "@/lib/validations"

export default function ChangePasswordPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [changePassword] = useMutation(CHANGE_PASSWORD)
  const handleSubmit = async (data: ChangePasswordFormData, reset: () => void, setIsLoading: (isLoading: boolean) => void) => {

    setIsLoading(true)

    try {
      await changePassword({
        variables: { oldPassword: data.currentPassword, newPassword: data.newPassword },
      })

      toast({ title: "Password Updated Successfully" })
      reset()

      router.push("/")
    } catch (error: any) {
        toast({
            title: "Error",
            description:
              error instanceof Error
                ? error.message
                : error?.graphQLErrors?.[0]?.message || "Failed to reset password. Please try again.",
            variant: "destructive",
          })
          
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Enter your old and new password below to change your account.
            </CardDescription>
          </CardHeader>
            <CardContent className="space-y-4">
              <ChangePasswordForm onSubmit={handleSubmit} />
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
