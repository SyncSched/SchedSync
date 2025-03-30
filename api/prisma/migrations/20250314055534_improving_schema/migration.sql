-- DropForeignKey
ALTER TABLE "TaskNotification" DROP CONSTRAINT "TaskNotification_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskNotification" DROP CONSTRAINT "TaskNotification_userId_fkey";

-- AddForeignKey
ALTER TABLE "TaskNotification" ADD CONSTRAINT "TaskNotification_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskNotification" ADD CONSTRAINT "TaskNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
