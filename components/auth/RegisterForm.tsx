"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/"

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await register(registerData.name, registerData.email, registerData.password)
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Welcome to Shree Mahakali Dairy!",
      })
      router.push(redirectUrl)
    } catch (error: any) {
      // Check for specific error message from the server
      const errorMessage = error?.message || error?.graphQLErrors?.[0]?.message
      toast({
        title: "Registration Failed",
        description: errorMessage?.includes("already exists")
          ? "An account with this email already exists. Please try logging in or use a different email."
          : "There was an error creating your account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleRegister}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            required
            value={registerData.name}
            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            required
            value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="terms" className="rounded border-gray-300" required />
          <Label htmlFor="terms" className="text-sm font-normal">
            I agree to the{" "}
            <Link href="/terms" className="text-red-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-red-600 hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>
      </CardContent>

      <CardFooter>
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Register"}
        </Button>
      </CardFooter>
    </form>
  )
} 