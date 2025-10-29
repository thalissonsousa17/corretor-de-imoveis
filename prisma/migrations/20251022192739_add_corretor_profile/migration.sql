-- CreateTable
CREATE TABLE "CorretorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creci" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "biografia" TEXT,
    "avatar" TEXT,
    "banner" TEXT,
    "corPrimaria" TEXT,
    "corSecundaria" TEXT,
    "whatsapp" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "linkedin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorretorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CorretorProfile_userId_key" ON "CorretorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CorretorProfile_slug_key" ON "CorretorProfile"("slug");

-- AddForeignKey
ALTER TABLE "CorretorProfile" ADD CONSTRAINT "CorretorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
