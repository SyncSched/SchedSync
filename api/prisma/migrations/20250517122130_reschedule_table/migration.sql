/*
  Warnings:

  - You are about to drop the column `rescheduledAt` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `rescheduledFromTaskId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `rescheduledReason` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `rescheduledToTaskId` on the `tasks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "rescheduledAt",
DROP COLUMN "rescheduledFromTaskId",
DROP COLUMN "rescheduledReason",
DROP COLUMN "rescheduledToTaskId";

-- CreateTable
CREATE TABLE "RescheduledTask" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "originalTaskTime" TIMESTAMP(3) NOT NULL,
    "rescheduledDate" TIMESTAMP(3) NOT NULL,
    "rescheduledTime" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RescheduledTask_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RescheduledTask" ADD CONSTRAINT "RescheduledTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
