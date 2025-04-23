"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, gql } from "@apollo/client"
import { setCookie, deleteCookie } from "cookies-next"
import { useToast } from "@/hooks/use-toast"

// GraphQL queries and mutations
const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
    }
  }
`

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`

const SIGNUP_MUTATION = gql`
  mutation Signup($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`

interface User {
  id: string
  name: string
  email: string
  role: "USER" | "ADMIN"
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
  const { data, loading, refetch } = useQuery(ME_QUERY, {
    fetchPolicy: "network-only",
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
