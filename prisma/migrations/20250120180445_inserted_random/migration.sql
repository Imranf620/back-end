/*
  Warnings:

  - A unique constraint covering the columns `[random]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "random" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "File_random_key" ON "File"("random");
