-- CreateTable
CREATE TABLE "OnboardingData" (
    "id" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "hobbies" TEXT[],
    "sleepingHours" INTEGER NOT NULL,
    "sleepingStart" TIMESTAMP(3) NOT NULL,
    "sleepingEnd" TIMESTAMP(3) NOT NULL,
    "workingHours" INTEGER NOT NULL,
    "workingStart" TIMESTAMP(3) NOT NULL,
    "workingEnd" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OnboardingData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingData_userId_key" ON "OnboardingData"("userId");

-- AddForeignKey
ALTER TABLE "OnboardingData" ADD CONSTRAINT "OnboardingData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
