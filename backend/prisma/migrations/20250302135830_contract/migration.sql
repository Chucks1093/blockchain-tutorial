-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CHECK_EXECUTE', 'FUND', 'REGISTER', 'CANCEL', 'WITHDRAW');

-- CreateEnum
CREATE TYPE "ExecStatus" AS ENUM ('PENDING', 'SUCCESS', 'REVERTED', 'ERROR', 'SKIPPED');

-- CreateTable
CREATE TABLE "upkeep_history" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upkeepId" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "automatorAddress" TEXT,
    "txHash" TEXT,
    "blockNumber" INTEGER,
    "gasUsed" TEXT,
    "linkAmount" TEXT,
    "activityType" "ActivityType" NOT NULL,
    "status" "ExecStatus" NOT NULL,
    "upkeepPerformed" BOOLEAN NOT NULL,
    "errorMessage" TEXT,

    CONSTRAINT "upkeep_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "upkeep_history_automatorAddress_key" ON "upkeep_history"("automatorAddress");

-- CreateIndex
CREATE INDEX "upkeep_history_upkeepId_idx" ON "upkeep_history"("upkeepId");

-- CreateIndex
CREATE INDEX "upkeep_history_txHash_idx" ON "upkeep_history"("txHash");

-- CreateIndex
CREATE INDEX "upkeep_history_createdAt_idx" ON "upkeep_history"("createdAt");

-- AddForeignKey
ALTER TABLE "upkeep_history" ADD CONSTRAINT "upkeep_history_upkeepId_fkey" FOREIGN KEY ("upkeepId") REFERENCES "upkeep_contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
