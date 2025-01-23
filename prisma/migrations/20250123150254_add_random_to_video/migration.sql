/*
  Warnings:

  - A unique constraint covering the columns `[random]` on the table `Video` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "random" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Video_random_key" ON "Video"("random");
