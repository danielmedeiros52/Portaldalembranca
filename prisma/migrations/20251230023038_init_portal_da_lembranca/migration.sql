-- Create Prisma enums
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE "Status" AS ENUM ('PENDING_FAMILY_DATA', 'ACTIVE', 'INACTIVE');
CREATE TYPE "PlanType" AS ENUM ('ANNUAL', 'LIFETIME');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- FuneralHome table
CREATE TABLE "FuneralHome" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- FamilyUser table
CREATE TABLE "FamilyUser" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Memorial table
CREATE TABLE "Memorial" (
    "id" SERIAL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "deathDate" TIMESTAMP(3),
    "birthplace" TEXT,
    "parents" TEXT,
    "biography" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "Status" NOT NULL DEFAULT 'PENDING_FAMILY_DATA',
    "funeralHomeId" INTEGER NOT NULL,
    "familyUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Descendant table
CREATE TABLE "Descendant" (
    "id" SERIAL PRIMARY KEY,
    "memorialId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Photo table
CREATE TABLE "Photo" (
    "id" SERIAL PRIMARY KEY,
    "memorialId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Dedication table
CREATE TABLE "Dedication" (
    "id" SERIAL PRIMARY KEY,
    "memorialId" INTEGER NOT NULL,
    "authorName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cemetery table (1:1 with Memorial)
CREATE TABLE "Cemetery" (
    "id" SERIAL PRIMARY KEY,
    "memorialId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "plot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- HistoricalGrave table (1:1 with Memorial)
CREATE TABLE "HistoricalGrave" (
    "id" SERIAL PRIMARY KEY,
    "memorialId" INTEGER NOT NULL,
    "graveNumber" TEXT,
    "description" TEXT,
    "registeredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AccessLog table
CREATE TABLE "AccessLog" (
    "id" SERIAL PRIMARY KEY,
    "memorialId" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Subscription table (1:1 with Memorial)
CREATE TABLE "Subscription" (
    "id" SERIAL PRIMARY KEY,
    "memorialId" INTEGER NOT NULL,
    "planType" "PlanType" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3)
);

-- Indexes and constraints
CREATE UNIQUE INDEX "FuneralHome_email_key" ON "FuneralHome"("email");
CREATE UNIQUE INDEX "FamilyUser_email_key" ON "FamilyUser"("email");
CREATE UNIQUE INDEX "Memorial_slug_key" ON "Memorial"("slug");
CREATE INDEX "Memorial_funeralHomeId_idx" ON "Memorial"("funeralHomeId");
CREATE INDEX "Memorial_familyUserId_idx" ON "Memorial"("familyUserId");
CREATE INDEX "Descendant_memorialId_idx" ON "Descendant"("memorialId");
CREATE INDEX "Photo_memorialId_idx" ON "Photo"("memorialId");
CREATE INDEX "Dedication_memorialId_idx" ON "Dedication"("memorialId");
CREATE UNIQUE INDEX "Cemetery_memorialId_key" ON "Cemetery"("memorialId");
CREATE UNIQUE INDEX "HistoricalGrave_memorialId_key" ON "HistoricalGrave"("memorialId");
CREATE INDEX "AccessLog_memorialId_idx" ON "AccessLog"("memorialId");
CREATE UNIQUE INDEX "Subscription_memorialId_key" ON "Subscription"("memorialId");

-- Foreign keys
ALTER TABLE "Memorial"
  ADD CONSTRAINT "Memorial_funeralHomeId_fkey" FOREIGN KEY ("funeralHomeId") REFERENCES "FuneralHome"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "Memorial_familyUserId_fkey" FOREIGN KEY ("familyUserId") REFERENCES "FamilyUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Descendant"
  ADD CONSTRAINT "Descendant_memorialId_fkey" FOREIGN KEY ("memorialId") REFERENCES "Memorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Photo"
  ADD CONSTRAINT "Photo_memorialId_fkey" FOREIGN KEY ("memorialId") REFERENCES "Memorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Dedication"
  ADD CONSTRAINT "Dedication_memorialId_fkey" FOREIGN KEY ("memorialId") REFERENCES "Memorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Cemetery"
  ADD CONSTRAINT "Cemetery_memorialId_fkey" FOREIGN KEY ("memorialId") REFERENCES "Memorial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HistoricalGrave"
  ADD CONSTRAINT "HistoricalGrave_memorialId_fkey" FOREIGN KEY ("memorialId") REFERENCES "Memorial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AccessLog"
  ADD CONSTRAINT "AccessLog_memorialId_fkey" FOREIGN KEY ("memorialId") REFERENCES "Memorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Subscription"
  ADD CONSTRAINT "Subscription_memorialId_fkey" FOREIGN KEY ("memorialId") REFERENCES "Memorial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
