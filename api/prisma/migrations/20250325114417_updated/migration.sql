/*
  Warnings:

  - You are about to drop the column `completedAt` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_taskId_fkey";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "completedAt",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "location",
DROP COLUMN "notes",
DROP COLUMN "priority",
DROP COLUMN "status",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "Attachment";

-- DropEnum
DROP TYPE "Priority";

-- DropEnum
DROP TYPE "TaskStatus";
