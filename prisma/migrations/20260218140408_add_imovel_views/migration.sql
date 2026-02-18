-- CreateTable
CREATE TABLE "ImovelView" (
    "id" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImovelView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImovelView_imovelId_idx" ON "ImovelView"("imovelId");

-- CreateIndex
CREATE INDEX "ImovelView_createdAt_idx" ON "ImovelView"("createdAt");

-- AddForeignKey
ALTER TABLE "ImovelView" ADD CONSTRAINT "ImovelView_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
