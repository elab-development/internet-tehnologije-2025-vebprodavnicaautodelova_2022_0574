/*
  Warnings:

  - You are about to drop the column `deliveryAddres` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `deliveryAddres`,
    ADD COLUMN `deliveryAddress` VARCHAR(191) NULL;
