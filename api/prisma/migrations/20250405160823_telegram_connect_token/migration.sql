-- CreateTable
CREATE TABLE "TelegramAuth" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramAuth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramAuth_token_key" ON "TelegramAuth"("token");

-- CreateIndex
CREATE INDEX "TelegramAuth_token_idx" ON "TelegramAuth"("token");

-- AddForeignKey
ALTER TABLE "TelegramAuth" ADD CONSTRAINT "TelegramAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
