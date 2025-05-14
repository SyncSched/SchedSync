-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "rescheduledAt" TIMESTAMP(3),
ADD COLUMN     "rescheduledFromTaskId" TEXT,
ADD COLUMN     "rescheduledReason" TEXT,
ADD COLUMN     "rescheduledToTaskId" TEXT;
