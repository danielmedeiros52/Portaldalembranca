import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("🔄 Starting database migrations...");

  try {
    const sql = neon(connectionString);
    const db = drizzle(sql);

    // Run drizzle migrations first
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });
    console.log("✅ Drizzle migrations completed!");

    // Ensure all required columns exist (idempotent operations)
    console.log("🔄 Ensuring all required columns exist...");

    // Check and add leads table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS "leads" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(320) NOT NULL,
        "phone" VARCHAR(20),
        "accept_emails" BOOLEAN DEFAULT false NOT NULL,
        "status" VARCHAR(50) DEFAULT 'pending' NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log("✅ Leads table ensured");

    // Check and add indexes for leads
    await sql`CREATE INDEX IF NOT EXISTS "leads_email_idx" ON "leads" ("email")`;
    await sql`CREATE INDEX IF NOT EXISTS "leads_status_idx" ON "leads" ("status")`;
    console.log("✅ Leads indexes ensured");

    // Add missing columns to memorials table (IF NOT EXISTS is PostgreSQL 9.6+)
    // Using DO block for conditional column addition
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memorials' AND column_name = 'main_photo') THEN
          ALTER TABLE memorials ADD COLUMN main_photo VARCHAR(500);
        END IF;
      END $$;
    `;
    console.log("✅ main_photo column ensured");

    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memorials' AND column_name = 'is_historical') THEN
          ALTER TABLE memorials ADD COLUMN is_historical BOOLEAN DEFAULT false NOT NULL;
        END IF;
      END $$;
    `;
    console.log("✅ is_historical column ensured");

    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memorials' AND column_name = 'category') THEN
          ALTER TABLE memorials ADD COLUMN category VARCHAR(100);
        END IF;
      END $$;
    `;
    console.log("✅ category column ensured");

    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memorials' AND column_name = 'grave_location') THEN
          ALTER TABLE memorials ADD COLUMN grave_location VARCHAR(255);
        END IF;
      END $$;
    `;
    console.log("✅ grave_location column ensured");

    // Make funeral_home_id nullable if it's not already
    await sql`
      DO $$ 
      BEGIN
        ALTER TABLE memorials ALTER COLUMN funeral_home_id DROP NOT NULL;
      EXCEPTION
        WHEN others THEN NULL;
      END $$;
    `;
    console.log("✅ funeral_home_id nullable ensured");

    // Ensure required enums exist for orders table
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'production_status') THEN
          CREATE TYPE production_status AS ENUM ('new', 'in_production', 'waiting_data', 'ready', 'delivered', 'cancelled');
        END IF;
      END $$;
    `;

    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority') THEN
          CREATE TYPE priority AS ENUM ('low', 'normal', 'high', 'urgent');
        END IF;
      END $$;
    `;

    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
          CREATE TYPE lead_status AS ENUM ('pending', 'contacted', 'converted', 'rejected');
        END IF;
      END $$;
    `;
    console.log("✅ Required enums ensured");

    // Ensure orders table exists
    await sql`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" SERIAL PRIMARY KEY,
        "memorial_id" INTEGER NOT NULL,
        "funeral_home_id" INTEGER NOT NULL,
        "family_user_id" INTEGER,
        "production_status" production_status DEFAULT 'new' NOT NULL,
        "priority" priority DEFAULT 'normal' NOT NULL,
        "notes" TEXT,
        "internal_notes" TEXT,
        "estimated_delivery" TIMESTAMP,
        "delivered_at" TIMESTAMP,
        "assigned_to" VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log("✅ Orders table ensured");

    // Ensure order_history table exists
    await sql`
      CREATE TABLE IF NOT EXISTS "order_history" (
        "id" SERIAL PRIMARY KEY,
        "order_id" INTEGER NOT NULL,
        "previous_status" production_status,
        "new_status" production_status NOT NULL,
        "changed_by" VARCHAR(255),
        "notes" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log("✅ Order history table ensured");

    // Ensure admin_users table exists
    await sql`
      CREATE TABLE IF NOT EXISTS "admin_users" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(320) NOT NULL UNIQUE,
        "password_hash" VARCHAR(255) NOT NULL,
        "is_active" BOOLEAN DEFAULT true NOT NULL,
        "last_login" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log("✅ Admin users table ensured");

    // Ensure dashboard_settings table exists
    await sql`
      CREATE TABLE IF NOT EXISTS "dashboard_settings" (
        "id" SERIAL PRIMARY KEY,
        "admin_user_id" INTEGER NOT NULL,
        "setting_key" VARCHAR(100) NOT NULL,
        "setting_value" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log("✅ Dashboard settings table ensured");

    console.log("✅ All migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
