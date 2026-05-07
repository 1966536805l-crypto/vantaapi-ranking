ALTER TABLE `User`
  ADD COLUMN `twoFactorSecret` VARCHAR(191) NULL,
  ADD COLUMN `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `twoFactorConfirmedAt` DATETIME(3) NULL;

CREATE INDEX `User_twoFactorEnabled_idx` ON `User`(`twoFactorEnabled`);

DROP TABLE IF EXISTS `Admin`;
