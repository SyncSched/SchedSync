/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Adjustment` table. All the data in the column will be lost.
  - You are about to drop the `TransformationDelta` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `change_type` to the `Adjustment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `details` to the `Adjustment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `task_id` to the `Adjustment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Adjustment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TransformationDelta" DROP CONSTRAINT "TransformationDelta_adjustmentId_fkey";

-- AlterTable
ALTER TABLE "Adjustment" DROP COLUMN "createdAt",
ADD COLUMN     "adjustedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "change_type" "ChangeType" NOT NULL,
ADD COLUMN     "details" JSONB NOT NULL,
ADD COLUMN     "task_id" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "TransformationDelta";
