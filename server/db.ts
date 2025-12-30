import type {
  Dedication,
  Descendant,
  FamilyUser,
  FuneralHome,
  Memorial,
  Photo,
  Prisma,
  Role,
  User,
} from "@prisma/client";
import { ENV } from "./_core/env";
import { getPrismaClient } from "./_core/prisma";

export type UpsertUserInput = {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role?: Role;
  lastSignedIn?: Date;
};

export async function getDb() {
  return getPrismaClient();
}

export async function upsertUser(user: UpsertUserInput): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getPrismaClient();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const now = user.lastSignedIn ?? new Date();
  const fallbackRole = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");

  try {
    await db.user.upsert({
      where: { openId: user.openId },
      update: {
        name: user.name ?? undefined,
        email: user.email ?? undefined,
        loginMethod: user.loginMethod ?? undefined,
        lastSignedIn: now,
        role: user.role ?? undefined,
      },
      create: {
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        lastSignedIn: now,
        role: fallbackRole,
      },
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getPrismaClient();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.user.findUnique({ where: { openId } });
  return result ?? undefined;
}

// Funeral Home queries
export async function getFuneralHomeByEmail(email: string): Promise<FuneralHome | undefined> {
  const db = await getPrismaClient();
  if (!db) return undefined;
  const result = await db.funeralHome.findUnique({ where: { email } });
  return result ?? undefined;
}

export async function getFuneralHomeById(id: number): Promise<FuneralHome | undefined> {
  const db = await getPrismaClient();
  if (!db) return undefined;
  const result = await db.funeralHome.findUnique({ where: { id } });
  return result ?? undefined;
}

// Family User queries
export async function getFamilyUserByEmail(email: string): Promise<FamilyUser | undefined> {
  const db = await getPrismaClient();
  if (!db) return undefined;
  const result = await db.familyUser.findUnique({ where: { email } });
  return result ?? undefined;
}

export async function getFamilyUserById(id: number): Promise<FamilyUser | undefined> {
  const db = await getPrismaClient();
  if (!db) return undefined;
  const result = await db.familyUser.findUnique({ where: { id } });
  return result ?? undefined;
}

export async function getFamilyUserByInvitationToken(token: string): Promise<FamilyUser | undefined> {
  const db = await getPrismaClient();
  if (!db) return undefined;
  const result = await db.familyUser.findFirst({ where: { invitationToken: token } });
  return result ?? undefined;
}

// Memorial queries
export async function getMemorialsByFuneralHomeId(funeralHomeId: number): Promise<Memorial[]> {
  const db = await getPrismaClient();
  if (!db) return [];
  return db.memorial.findMany({ where: { funeralHomeId }, orderBy: { createdAt: "desc" } });
}

export async function getMemorialsByFamilyUserId(familyUserId: number): Promise<Memorial[]> {
  const db = await getPrismaClient();
  if (!db) return [];
  return db.memorial.findMany({ where: { familyUserId }, orderBy: { createdAt: "desc" } });
}

export async function getMemorialBySlug(slug: string): Promise<Memorial | undefined> {
  const db = await getPrismaClient();
  if (!db) return undefined;
  const result = await db.memorial.findUnique({ where: { slug } });
  return result ?? undefined;
}

export async function getMemorialById(id: number): Promise<Memorial | undefined> {
  const db = await getPrismaClient();
  if (!db) return undefined;
  const result = await db.memorial.findUnique({ where: { id } });
  return result ?? undefined;
}

// Descendant queries
export async function getDescendantsByMemorialId(memorialId: number): Promise<Descendant[]> {
  const db = await getPrismaClient();
  if (!db) return [];
  return db.descendant.findMany({ where: { memorialId } });
}

// Photo queries
export async function getPhotosByMemorialId(memorialId: number): Promise<Photo[]> {
  const db = await getPrismaClient();
  if (!db) return [];
  return db.photo.findMany({ where: { memorialId }, orderBy: { order: "asc" } });
}

// Dedication queries
export async function getDedicationsByMemorialId(memorialId: number): Promise<Dedication[]> {
  const db = await getPrismaClient();
  if (!db) return [];
  return db.dedication.findMany({ where: { memorialId }, orderBy: { createdAt: "desc" } });
}

export function buildMemorialUpdateData(updateData: Partial<Memorial>): Prisma.MemorialUpdateInput {
  const data: Prisma.MemorialUpdateInput = {};

  if (updateData.fullName !== undefined) data.fullName = updateData.fullName;
  if (updateData.birthDate !== undefined) data.birthDate = updateData.birthDate;
  if (updateData.deathDate !== undefined) data.deathDate = updateData.deathDate;
  if (updateData.birthplace !== undefined) data.birthplace = updateData.birthplace;
  if (updateData.filiation !== undefined) data.filiation = updateData.filiation;
  if (updateData.biography !== undefined) data.biography = updateData.biography;
  if (updateData.visibility !== undefined) data.visibility = updateData.visibility;
  if (updateData.status !== undefined) data.status = updateData.status;

  return data;
}
