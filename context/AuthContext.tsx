"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, gql } from "@apollo/client"
import { setCookie, deleteCookie } from "cookies-next"
import { useToast } from "@/hooks/use-toast"
import { Role, UserStatus } from "../graphql/graphql-types"
import { LOGIN_MUTATION, SIGNUP_MUTATION } from "../graphql/mutation"
import { GET_PROFILE } from "../graphql/queries"

interface User {
  id: string
  name: string
  email: string
  role: Role
  status?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  phoneNumber?: string
  profileImage?: string
  bio?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Login mutation
  const [loginMutation] = useMutation(LOGIN_MUTATION)

  // Signup mutation
  const [signupMutation] = useMutation(SIGNUP_MUTATION)

  // Get current user
  const { data, loading, refetch } = useQuery(GET_PROFILE, {
    fetchPolicy: "network-only",
    pollInterval: 10000,
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    },
    onError: () => {
      setUser(null)
      setIsLoading(false)
    },
  })

  useEffect(() => {
    if (!loading) {
      if (data?.me) {
        if (data.me.status === UserStatus.Deactivated) {
          logout()
          toast({
            title: "Account Deactivated",
            description: "Your account has been deactivated. Please contact admin.",
            variant: "destructive",
          })
          router.replace("/auth")
        } else {
          setUser(data.me)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }
  }, [data, loading])

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data } = await loginMutation({
        variables: { email, password },
      })

      if (data?.login) {
        // Set the token in cookies
        setCookie("token", data.login.token, {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        })

        // Set the user in state
        setUser(data.login.user)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data } = await signupMutation({
        variables: { name, email, password },
      })

      if (data?.signup) {
        // Set the token in cookies
        setCookie("token", data.signup.token, {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        })

        // Set the user in state
        setUser(data.signup.user)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)
    try {
      // Remove the token from cookies
      deleteCookie("token", { path: "/" })

      // Clear the user from state
      setUser(null)

      // Show logout success toast
      toast({
        title: "Logged Out Successfully",
        description: "You have been logged out successfully.",
      })

      // Always redirect to home page
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
