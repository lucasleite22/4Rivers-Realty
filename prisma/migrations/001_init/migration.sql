-- 4Rivers Realty — Initial MySQL Migration
-- Charset: utf8mb4, Engine: InnoDB

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────────────
-- Table: users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`        VARCHAR(191) NOT NULL,
  `email`     VARCHAR(191) NOT NULL,
  `name`      VARCHAR(191) NOT NULL,
  `password`  VARCHAR(191) NOT NULL,
  `role`      ENUM('SUPER_ADMIN','AGENT') NOT NULL DEFAULT 'AGENT',
  `active`    TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  KEY `users_email_idx` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- Table: properties
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `properties` (
  `id`           VARCHAR(191) NOT NULL,
  `title`        VARCHAR(191) NOT NULL,
  `type`         ENUM('HORSE_FARM','RANCH','RESIDENTIAL','COMMERCIAL','LAND') NOT NULL,
  `priceUsd`     DECIMAL(15,2) NOT NULL,
  `acreage`      DECIMAL(10,2) NOT NULL,
  `county`       VARCHAR(191) NOT NULL,
  `city`         VARCHAR(191) NOT NULL,
  `address`      VARCHAR(191) NOT NULL,
  `description`  TEXT NOT NULL,
  `status`       ENUM('ACTIVE','SOLD','UNDER_CONTRACT') NOT NULL DEFAULT 'ACTIVE',
  `featured`     TINYINT(1) NOT NULL DEFAULT 1,
  `showOnPortal` TINYINT(1) NOT NULL DEFAULT 1,
  `stables`      INT NULL,
  `arenas`       INT NULL,
  `pastures`     INT NULL,
  `createdAt`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`    DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  KEY `properties_type_idx` (`type`),
  KEY `properties_status_idx` (`status`),
  KEY `properties_county_idx` (`county`),
  KEY `properties_featured_idx` (`featured`),
  KEY `properties_showOnPortal_idx` (`showOnPortal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- Table: property_images
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `property_images` (
  `id`         VARCHAR(191) NOT NULL,
  `propertyId` VARCHAR(191) NOT NULL,
  `url`        VARCHAR(191) NOT NULL,
  `isCover`    TINYINT(1) NOT NULL DEFAULT 0,
  `sortOrder`  INT NOT NULL DEFAULT 0,
  `createdAt`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  KEY `property_images_propertyId_idx` (`propertyId`),
  CONSTRAINT `property_images_propertyId_fkey`
    FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- Table: leads
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `leads` (
  `id`               VARCHAR(191) NOT NULL,
  `name`             VARCHAR(191) NOT NULL,
  `email`            VARCHAR(191) NULL,
  `phone`            VARCHAR(191) NULL,
  `type`             ENUM('BUYER','SELLER','INVESTOR') NOT NULL,
  `origin`           ENUM('WEBSITE','REFERRAL','ZILLOW','REALTOR_COM','INSTAGRAM','OTHER') NOT NULL,
  `propertyInterest` VARCHAR(191) NULL,
  `budgetUsd`        DECIMAL(15,2) NULL,
  `acreageDesired`   DECIMAL(10,2) NULL,
  `countyPreferred`  VARCHAR(191) NULL,
  `status`           ENUM('NEW_LEAD','CONTACTED','SHOWING','OFFER_MADE','UNDER_CONTRACT','CLOSED_WON','CLOSED_LOST') NOT NULL DEFAULT 'NEW_LEAD',
  `notes`            TEXT NULL,
  `assignedToId`     VARCHAR(191) NULL,
  `lastContactAt`    DATETIME(3) NULL,
  `createdAt`        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`        DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  KEY `leads_status_idx` (`status`),
  KEY `leads_type_idx` (`type`),
  KEY `leads_assignedToId_idx` (`assignedToId`),
  KEY `leads_lastContactAt_idx` (`lastContactAt`),
  CONSTRAINT `leads_assignedToId_fkey`
    FOREIGN KEY (`assignedToId`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- Table: lead_activities
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `lead_activities` (
  `id`           VARCHAR(191) NOT NULL,
  `leadId`       VARCHAR(191) NOT NULL,
  `userId`       VARCHAR(191) NULL,
  `type`         ENUM('CALL','EMAIL','SHOWING','OFFER','NOTE') NOT NULL,
  `notes`        TEXT NULL,
  `activityDate` DATETIME(3) NOT NULL,
  `createdAt`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  KEY `lead_activities_leadId_idx` (`leadId`),
  KEY `lead_activities_userId_idx` (`userId`),
  CONSTRAINT `lead_activities_leadId_fkey`
    FOREIGN KEY (`leadId`) REFERENCES `leads` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lead_activities_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- Table: dashboard_events
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `dashboard_events` (
  `id`         VARCHAR(191) NOT NULL,
  `type`       ENUM('PROPERTY_CREATED','PROPERTY_SOLD','LEAD_CREATED','LEAD_STAGE_CHANGED','SHOWING_SCHEDULED','OFFER_MADE','DEAL_CLOSED') NOT NULL,
  `entityId`   VARCHAR(191) NOT NULL,
  `entityType` VARCHAR(191) NOT NULL,
  `metadata`   JSON NULL,
  `userId`     VARCHAR(191) NULL,
  `createdAt`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  KEY `dashboard_events_type_idx` (`type`),
  KEY `dashboard_events_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Prisma migration tracking table
CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
  `id`                    VARCHAR(36) NOT NULL,
  `checksum`              VARCHAR(64) NOT NULL,
  `finished_at`           DATETIME(3) NULL,
  `migration_name`        VARCHAR(255) NOT NULL,
  `logs`                  TEXT NULL,
  `rolled_back_at`        DATETIME(3) NULL,
  `started_at`            DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count`   INT UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
