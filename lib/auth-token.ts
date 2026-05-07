import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

export type AuthPayload = {
  userId: string;
  role: UserRole;
};

const JWT_ISSUER = "immortal-study";
const JWT_AUDIENCE = "vantaapi.com";
const DEFAULT_SESSION_SECONDS = 60 * 60 * 24;
const MAX_SESSION_SECONDS = 60 * 60 * 24 * 7;

export const AUTH_SESSION_SECONDS = Math.min(
  Number(process.env.AUTH_SESSION_SECONDS || DEFAULT_SESSION_SECONDS),
  MAX_SESSION_SECONDS
);

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is required in production");
    }
    return "dev-secret-change-me";
  }

  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }

  return secret;
}

export function signAuthToken(payload: AuthPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: "HS256",
    audience: JWT_AUDIENCE,
    expiresIn: AUTH_SESSION_SECONDS,
    issuer: JWT_ISSUER,
  });
}

export function verifyAuthToken(token: string): AuthPayload | null {
  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
    }) as Partial<AuthPayload>;

    if (!payload.userId || !payload.role) return null;
    if (!Object.values(UserRole).includes(payload.role)) return null;

    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}
