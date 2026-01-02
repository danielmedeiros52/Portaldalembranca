-- Add new fields to memorials table for historical memorials support
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS main_photo VARCHAR(500);
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS is_historical BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE memorials ADD COLUMN IF NOT EXISTS grave_location VARCHAR(255);

-- Make funeral_home_id nullable for historical memorials
ALTER TABLE memorials ALTER COLUMN funeral_home_id DROP NOT NULL;
