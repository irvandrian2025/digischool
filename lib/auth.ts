import { compare, hash } from "bcryptjs"
import { executeQuery } from "./db"
import { SignJWT, jwtVerify } from "jose"
import type { NextRequest } from "next/server"

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_this_in_production")

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword)
}

export async function authenticateUser(username: string, password: string) {
  const result = await executeQuery("SELECT id, username, password, name, role FROM users WHERE username = $1", [username])
  if (result.length === 0) return null

  const user = result[0]
  const match = await verifyPassword(password, user.password)
  if (!match) return null

  delete user.password
  return user
}

export async function createToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

// lib/auth.ts
export function getClientToken(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/auth-token=([^;]+)/)
  return match?.[1] ?? null
}



// ✅ Untuk MIDDLEWARE atau API route (dapat req)
export async function getSessionFromRequest(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value
    if (!token) return null
    return await verifyToken(token)
  } catch {
    return null
  }
}

// ✅ Untuk LAYOUT SERVER COMPONENT (tanpa req)
export async function getSessionFromHeader() {
  try {
    const token = cookies().get("auth-token")?.value
    if (!token) return null
    return await verifyToken(token)
  } catch {
    return null
  }
}

