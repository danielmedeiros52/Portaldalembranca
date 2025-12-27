import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, funeralHomes, familyUsers, memorials, descendants, photos, dedications, FuneralHome, FamilyUser, Memorial, Descendant, Photo, Dedication, InsertMemorial, InsertDescendant, InsertPhoto, InsertDedication } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Funeral Home queries
export async function getFuneralHomeByEmail(email: string): Promise<FuneralHome | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(funeralHomes).where(eq(funeralHomes.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getFuneralHomeById(id: number): Promise<FuneralHome | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(funeralHomes).where(eq(funeralHomes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Family User queries
export async function getFamilyUserByEmail(email: string): Promise<FamilyUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(familyUsers).where(eq(familyUsers.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getFamilyUserById(id: number): Promise<FamilyUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(familyUsers).where(eq(familyUsers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getFamilyUserByInvitationToken(token: string): Promise<FamilyUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(familyUsers).where(eq(familyUsers.invitationToken, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Memorial queries
export async function getMemorialsByFuneralHomeId(funeralHomeId: number): Promise<Memorial[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memorials).where(eq(memorials.funeralHomeId, funeralHomeId)).orderBy(desc(memorials.createdAt));
}

export async function getMemorialsByFamilyUserId(familyUserId: number): Promise<Memorial[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(memorials).where(eq(memorials.familyUserId, familyUserId)).orderBy(desc(memorials.createdAt));
}

export async function getMemorialBySlug(slug: string): Promise<Memorial | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(memorials).where(eq(memorials.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMemorialById(id: number): Promise<Memorial | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(memorials).where(eq(memorials.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Descendant queries
export async function getDescendantsByMemorialId(memorialId: number): Promise<Descendant[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(descendants).where(eq(descendants.memorialId, memorialId));
}

// Photo queries
export async function getPhotosByMemorialId(memorialId: number): Promise<Photo[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(photos).where(eq(photos.memorialId, memorialId)).orderBy(photos.order);
}

// Dedication queries
export async function getDedicationsByMemorialId(memorialId: number): Promise<Dedication[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dedications).where(eq(dedications.memorialId, memorialId)).orderBy(desc(dedications.createdAt));
}
