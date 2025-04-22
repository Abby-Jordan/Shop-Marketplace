// This file contains functions for authentication

import type { User } from "@/types/user"

// Mock user data for development - will be replaced with actual API calls
const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    isAdmin: true,
  },
  {
    id: "2",
    name: "Test User",
    email: "user@example.com",
    password: "user123",
    isAdmin: false,
  },
]

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Login user
export async function loginUser(email: string, password: string): Promise<User> {
  // Simulate API call
  await delay(800)

  const user = mockUsers.find((user) => user.email === email && user.password === password)

  if (!user) {
    throw new Error("Invalid email or password")
  }

  // Store user in localStorage (in a real app, this would be a JWT token)
  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    }),
  )

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  }
}

// Register user
export async function registerUser(name: string, email: string, password: string): Promise<User> {
  // Simulate API call
  await delay(1000)

  // Check if user already exists
  const existingUser = mockUsers.find((user) => user.email === email)
  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  // In a real app, this would create a new user in the database
  const newUser = {
    id: `${mockUsers.length + 1}`,
    name,
    email,
    password,
    isAdmin: false,
  }

  // Store user in localStorage (in a real app, this would be a JWT token)
  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    }),
  )

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    isAdmin: newUser.isAdmin,
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  // Simulate API call
  await delay(300)

  // Remove user from localStorage
  localStorage.removeItem("currentUser")
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  // Simulate API call
  await delay(300)

  const userJson = localStorage.getItem("currentUser")
  if (!userJson) {
    return null
  }

  try {
    return JSON.parse(userJson)
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error)
    return null
  }
}
