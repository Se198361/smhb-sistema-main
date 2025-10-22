-- CreateTable
CREATE TABLE "Cracha" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cracha_pkey" PRIMARY KEY ("id")
);
