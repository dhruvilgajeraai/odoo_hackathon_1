import { prisma } from '../lib/prisma';
import { AppError } from '../utils/apiResponse';
import { sanitizeUser } from '../utils/helpers';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);
  return sanitizeUser(user);
}

export async function updateProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    city?: string | null;
    country?: string | null;
    additionalInfo?: string | null;
    username?: string | null;
  }
) {
  if (data.username) {
    const existing = await prisma.user.findFirst({
      where: { username: data.username, NOT: { id: userId } },
    });
    if (existing) throw new AppError('Username already taken', 409);
  }

  const user = await prisma.user.update({ where: { id: userId }, data });
  return sanitizeUser(user);
}

export async function updateProfilePhoto(userId: string, photoUrl: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { profilePhotoUrl: photoUrl },
  });
  return sanitizeUser(user);
}

export async function getPreferences(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);
  return {
    language: user.language,
    travelStyle: user.travelStyle,
    preferredCategories: user.preferredCategories,
  };
}

export async function updatePreferences(
  userId: string,
  data: { language?: string; travelStyle?: 'budget' | 'standard' | 'luxury'; preferredCategories?: string[] }
) {
  const user = await prisma.user.update({ where: { id: userId }, data });
  return {
    language: user.language,
    travelStyle: user.travelStyle,
    preferredCategories: user.preferredCategories,
  };
}

export async function getSavedDestinations(userId: string) {
  const saved = await prisma.savedDestination.findMany({
    where: { userId },
    include: { destination: true },
    orderBy: { createdAt: 'desc' },
  });
  return saved.map((s) => ({
    id: s.id,
    savedAt: s.createdAt.toISOString(),
    destination: s.destination,
  }));
}

export async function saveDestination(userId: string, destinationId: string) {
  const destination = await prisma.destination.findUnique({ where: { id: destinationId } });
  if (!destination) throw new AppError('Destination not found', 404);

  const saved = await prisma.savedDestination.upsert({
    where: { userId_destinationId: { userId, destinationId } },
    create: { userId, destinationId },
    update: {},
    include: { destination: true },
  });

  return {
    id: saved.id,
    savedAt: saved.createdAt.toISOString(),
    destination: saved.destination,
  };
}

export async function removeSavedDestination(userId: string, destinationId: string) {
  await prisma.savedDestination.deleteMany({ where: { userId, destinationId } });
  return { message: 'Destination removed from saved list' };
}

export async function deleteAccount(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
  return { message: 'Account deleted successfully' };
}
