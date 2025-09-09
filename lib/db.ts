import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export { sql }

export type UserRole = "citizen" | "publisher" | "admin" | "super_admin"

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  password?: string
  role: UserRole
  is_active: boolean
  email_verified: boolean
  ward_id?: string
  lga_id?: string
  created_at: string
  updated_at: string
}

export interface PublisherPasscode {
  id: number
  passcode: string
  lga_id: string
  ward_id?: string
  is_active: boolean
  max_uses: number
  current_uses: number
  expires_at?: string
}
