import { compare, hash } from "bcryptjs"
import { executeQuery } from "./db"
import { cookies } from "next/headers"
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
  try {
    const result = await executeQuery("SELECT id, username, password, name, role FROM users WHERE username = $1", [
      username,
    ])

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    const passwordMatch = await verifyPassword(password, user.password)

    if (!passwordMatch) {
      return null
    }

    // Remove password from user object
    delete user.password
    return user
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
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
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  return await verifyToken(token)
}

export async function getCurrentUser() {
  const session = await getSession()

  if (!session?.id) return null

  try {
    const result = await executeQuery("SELECT id, username, name, role FROM users WHERE id = $1", [session.id])

    if (result.length === 0) return null

    return result[0]
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export function getAuthorizationToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  return authHeader.substring(7)
}
