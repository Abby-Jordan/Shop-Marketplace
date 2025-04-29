"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from "lucide-react"
import { useMutation } from "@apollo/client"
import { CHANGE_PASSWORD } from "@/graphql/mutation"

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    showOldPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [changePassword] = useMutation(CHANGE_PASSWORD)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setForm((prev) => ({ ...prev, [id]: value }))
  }

  const toggleVisibility = (field: keyof typeof form) => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { oldPassword, newPassword, confirmPassword } = form

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your new password and confirm password are the same.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await changePassword({
        variables: { oldPassword, newPassword },
      })

      toast({ title: "Password Updated Successfully" })

      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        showOldPassword: false,
        showNewPassword: false,
        showConfirmPassword: false,
      })

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

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {[
                { label: "Old Password", id: "oldPassword", showField: "showOldPassword" },
                { label: "New Password", id: "newPassword", showField: "showNewPassword" },
                { label: "Confirm Password", id: "confirmPassword", showField: "showConfirmPassword" },
              ].map(({ label, id, showField }) => (
                <div key={id} className="space-y-2">
                  <Label htmlFor={id}>{label}</Label>
                  <div className="relative">
                    <Input
                      id={id}
                      type={form[showField as keyof typeof form] ? "text" : "password"}
                      placeholder="********"
                      required
                      value={form[id as keyof typeof form] as string}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility(showField as keyof typeof form)}
                      className="absolute right-3 top-2/4 -translate-y-1/2 text-muted-foreground"
                    >
                      {form[showField as keyof typeof form] ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
