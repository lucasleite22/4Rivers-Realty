/*
  bedrooms/bathrooms were declared in schema.prisma as part of the MLS sync
  fields but never actually added to the `properties` table in any
  environment — confirmed via SHOW COLUMNS against production on
  2026-09-30, after prisma.property.findUnique() started failing there
  with "column bedrooms does not exist". The 20260925140339_mls_sync_fields
  migration was (incorrectly) trimmed to skip them, based on a
  misread of an earlier production error. Adding them for real here.
*/
-- AlterTable
ALTER TABLE `properties` ADD COLUMN `bedrooms` INTEGER NULL,
    ADD COLUMN `bathrooms` INTEGER NULL;
