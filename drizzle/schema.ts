import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * FuneralHome table for funeral home partners
 */
export const funeralHomes = mysqlTable("funeral_homes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FuneralHome = typeof funeralHomes.$inferSelect;
export type InsertFuneralHome = typeof funeralHomes.$inferInsert;

/**
 * FamilyUser table for family members managing memorials
 */
export const familyUsers = mysqlTable("family_users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  invitationToken: varchar("invitation_token", { length: 255 }),
  invitationExpiry: timestamp("invitation_expiry"),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FamilyUser = typeof familyUsers.$inferSelect;
export type InsertFamilyUser = typeof familyUsers.$inferInsert;

/**
 * Memorial table for deceased individuals
 */
export const memorials = mysqlTable("memorials", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  birthDate: varchar("birth_date", { length: 10 }),
  deathDate: varchar("death_date", { length: 10 }),
  birthplace: varchar("birthplace", { length: 255 }),
  filiation: text("filiation"),
  biography: text("biography"),
  visibility: mysqlEnum("visibility", ["public", "private"]).default("public").notNull(),
  status: mysqlEnum("status", ["active", "pending_data", "inactive"]).default("pending_data").notNull(),
  funeralHomeId: int("funeral_home_id").notNull(),
  familyUserId: int("family_user_id"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Memorial = typeof memorials.$inferSelect;
export type InsertMemorial = typeof memorials.$inferInsert;

/**
 * Descendant table for children, grandchildren, etc.
 */
export const descendants = mysqlTable("descendants", {
  id: int("id").autoincrement().primaryKey(),
  memorialId: int("memorial_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  relationship: varchar("relationship", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Descendant = typeof descendants.$inferSelect;
export type InsertDescendant = typeof descendants.$inferInsert;

/**
 * Photo table for memorial gallery
 */
export const photos = mysqlTable("photos", {
  id: int("id").autoincrement().primaryKey(),
  memorialId: int("memorial_id").notNull(),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  caption: text("caption"),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;

/**
 * Dedication table for messages/tributes
 */
export const dedications = mysqlTable("dedications", {
  id: int("id").autoincrement().primaryKey(),
  memorialId: int("memorial_id").notNull(),
  authorName: varchar("author_name", { length: 255 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Dedication = typeof dedications.$inferSelect;
export type InsertDedication = typeof dedications.$inferInsert;