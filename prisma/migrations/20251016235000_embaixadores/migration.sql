-- CreateTable
CREATE TABLE "Embaixador" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "idade" INTEGER,
    "telefone" TEXT,
    "foto" TEXT,
    "pai" TEXT,
    "mae" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Embaixador_pkey" PRIMARY KEY ("id")
);
