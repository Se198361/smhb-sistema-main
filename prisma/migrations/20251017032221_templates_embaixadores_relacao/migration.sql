-- AlterTable
ALTER TABLE "Cracha" ADD COLUMN     "embaixadorId" INTEGER,
ADD COLUMN     "origem" TEXT NOT NULL DEFAULT 'CRACHAS';

-- CreateTable
CREATE TABLE "BadgeTemplate" (
    "id" SERIAL NOT NULL,
    "page" TEXT NOT NULL,
    "lado" TEXT NOT NULL,
    "name" TEXT,
    "img" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BadgeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BadgeTemplate_page_lado_key" ON "BadgeTemplate"("page", "lado");

-- AddForeignKey
ALTER TABLE "Cracha" ADD CONSTRAINT "Cracha_embaixadorId_fkey" FOREIGN KEY ("embaixadorId") REFERENCES "Embaixador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
