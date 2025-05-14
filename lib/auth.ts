import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "sheguard-secret-key"

/**
 * Generate a JWT token for a user
 * @param userId User ID to include in the token
 * @param role User role to include in the token
 * @returns JWT token string
 */
export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" })
}

/**
 * Verify a JWT token and return the user ID and role
 * @param token JWT token to verify
 * @returns Object with userId and role if token is valid, null otherwise
 */
export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
    return decoded
  } catch (error) {
    return null
  }
}
