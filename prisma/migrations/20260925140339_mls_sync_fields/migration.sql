/*
  This migration originally also declared `latitude`, `longitude`, `mlsId`
  (plus its unique index) and re-ran into `bathrooms`/`bedrooms` after a
  partial-failure retry. All of those already exist in every environment
  this runs against now — confirmed directly against production's TiDB
  database on 2026-09-29 (TiDB applies a multi-column ALTER TABLE as
  independent per-column jobs, so a statement that fails partway can still
  leave earlier columns in it applied — unlike a single atomic MySQL ALTER).
  Only the columns still verified missing are added below.
*/
-- AlterTable
ALTER TABLE `properties` ADD COLUMN `mlsStatus` VARCHAR(191) NULL,
    ADD COLUMN `sqft` INTEGER NULL,
    ADD COLUMN `yearBuilt` INTEGER NULL;

-- CreateTable
CREATE TABLE `mls_sync_state` (
    `id` VARCHAR(191) NOT NULL,
    `originatingSystemName` VARCHAR(191) NOT NULL,
    `lastModificationTimestamp` DATETIME(3) NOT NULL,
    `lastRunAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastRunStatus` VARCHAR(191) NULL,
    `lastRunError` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mls_sync_state_originatingSystemName_key`(`originatingSystemName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
