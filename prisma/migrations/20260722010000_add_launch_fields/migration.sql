-- AlterTable
ALTER TABLE `properties` ADD COLUMN `isLaunch` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `launchBadge` VARCHAR(191) NULL,
    ADD COLUMN `launchDate` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `properties_isLaunch_idx` ON `properties`(`isLaunch`);
