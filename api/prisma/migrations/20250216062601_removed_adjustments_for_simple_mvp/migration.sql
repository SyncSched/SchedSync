/*
  Warnings:

  - You are about to drop the `Adjustment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Adjustment" DROP CONSTRAINT "Adjustment_scheduleId_fkey";

-- DropTable
DROP TABLE "Adjustment";

-- DropEnum
DROP TYPE "ChangeType";
