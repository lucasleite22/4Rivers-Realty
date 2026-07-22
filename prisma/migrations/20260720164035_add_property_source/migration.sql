-- AlterTable
ALTER TABLE `properties` ADD COLUMN `source` ENUM('AGENT', 'MLS', 'CLIENT') NOT NULL DEFAULT 'AGENT';
