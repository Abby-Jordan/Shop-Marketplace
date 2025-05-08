import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import type { NextRequest, NextResponse } from "next/server"
import type { User } from "@prisma/client"
import { Role } from "../graphql/graphql-types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

if (!process.env.JWT_SECRET) {
  console.warn("Warning: JWT_SECRET is not set in environment variables. Using default secret key.")
}

export async function signJwtToken(payload: any): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
}

export async function verifyJwtToken(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  const payload = await verifyJwtToken(token)
  return payload
}

export type SessionUser = Pick<User, "id" | "name" | "email" | "role">

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession()

  if (!session) {
    return null
  }

  return session as SessionUser
}

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.ENVIRONMENT === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  return res
}

export function removeAuthCookie(res: NextResponse) {
  res.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.ENVIRONMENT === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })

  return res
}

export async function isAuthenticated(req: NextRequest) {
  const token = req.cookies.get("token")?.value

  if (!token) {
    return false
  }

  const payload = await verifyJwtToken(token)
  return !!payload
}

export async function isAdmin(req: NextRequest) {
  const token = req.cookies.get("token")?.value

  if (!token) {
    return false
  }

  const payload = await verifyJwtToken(token)
  return typeof payload?.role === 'string' && payload.role === Role.Admin
}
