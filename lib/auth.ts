import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "sheguard-secret-key"

/**
 * Generate a JWT token for a user
 * @param userId User ID to include in the token
 * @returns JWT token string
 */
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

/**
 * Verify a JWT token and return the user ID
 * @param token JWT token to verify
 * @returns User ID if token is valid, null otherwise
 */
export function verifyToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded.userId
  } catch (error) {
    return null
  }
}
