import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Create a SQL client with the Neon connection
// Add fallback for DATABASE_URL to prevent errors when running locally
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/digischool"
export const sql = neon(DATABASE_URL)

// Create a Drizzle client to use with the Neon connection
export const db = drizzle(sql)

// Helper function to execute raw SQL queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    console.log("Executing query:", query, "with params:", params)
    // Use sql.query for conventional function call with placeholders
    const result = await sql.query(query, params)
    console.log("Query result:", result)
    return result
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}
