import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function sanitizeUser(user: {
  id: string;
  email: string;
  username: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  profilePhotoUrl: string | null;
  additionalInfo: string | null;
  language: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    city: user.city,
    country: user.country,
    profilePhotoUrl: user.profilePhotoUrl,
    additionalInfo: user.additionalInfo,
    language: user.language,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export type TripStatus = 'upcoming' | 'ongoing' | 'completed';

export function deriveTripStatus(startDate: Date, endDate: Date): TripStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (today < start) return 'upcoming';
  if (today > end) return 'completed';
  return 'ongoing';
}

export function parseResetExpiryHours(): number {
  const match = env.RESET_TOKEN_EXPIRES_IN.match(/^(\d+)h$/);
  return match ? parseInt(match[1], 10) : 1;
}
