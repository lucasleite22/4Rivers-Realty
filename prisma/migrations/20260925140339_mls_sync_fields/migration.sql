/*
  Warnings:

  - A unique constraint covering the columns `[mlsId]` on the table `properties` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `properties` ADD COLUMN `bathrooms` INTEGER NULL,
    ADD COLUMN `bedrooms` INTEGER NULL,
    ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL,
    ADD COLUMN `mlsId` VARCHAR(191) NULL,
    ADD COLUMN `mlsStatus` VARCHAR(191) NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX `properties_mlsId_key` ON `properties`(`mlsId`);
