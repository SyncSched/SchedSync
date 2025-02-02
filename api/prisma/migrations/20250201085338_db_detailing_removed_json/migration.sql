/*
  Warnings:

  - You are about to drop the column `delta` on the `Adjustment` table. All the data in the column will be lost.
  - You are about to drop the column `originalData` on the `Schedule` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('time_adjustment', 'duration_adjustment', 'task_added', 'task_removed');

-- AlterTable
ALTER TABLE "Adjustment" DROP COLUMN "delta";

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "originalData";

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "scheduleId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransformationDelta" (
    "id" TEXT NOT NULL,
    "adjustmentId" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "change_type" "ChangeType" NOT NULL,
    "details" JSONB NOT NULL,

    CONSTRAINT "TransformationDelta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransformationDelta" ADD CONSTRAINT "TransformationDelta_adjustmentId_fkey" FOREIGN KEY ("adjustmentId") REFERENCES "Adjustment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
