-- Idempotent adjustments for Embaixador template selectors and BadgeTemplate index

-- Drop index if exists (created in previous migration)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'BadgeTemplate_page_lado_key'
  ) THEN
    EXECUTE 'DROP INDEX "public"."BadgeTemplate_page_lado_key"';
  END IF;
END $$;

-- Add columns if not exists
ALTER TABLE "Embaixador" ADD COLUMN IF NOT EXISTS "templateBackId" INTEGER;
ALTER TABLE "Embaixador" ADD COLUMN IF NOT EXISTS "templateFrontId" INTEGER;

-- Add foreign keys if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Embaixador_templateFrontId_fkey'
  ) THEN
    ALTER TABLE "Embaixador"
      ADD CONSTRAINT "Embaixador_templateFrontId_fkey"
      FOREIGN KEY ("templateFrontId") REFERENCES "BadgeTemplate"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Embaixador_templateBackId_fkey'
  ) THEN
    ALTER TABLE "Embaixador"
      ADD CONSTRAINT "Embaixador_templateBackId_fkey"
      FOREIGN KEY ("templateBackId") REFERENCES "BadgeTemplate"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
