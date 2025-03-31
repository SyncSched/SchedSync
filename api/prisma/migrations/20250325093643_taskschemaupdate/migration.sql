/*
  Warnings:

  - You are about to drop the column `isRecurring` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `recurrencePattern` on the `tasks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "isRecurring",
DROP COLUMN "recurrencePattern";
