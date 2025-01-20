/*
  Warnings:

  - A unique constraint covering the columns `[random]` on the table `GuestFile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GuestFile_random_key" ON "GuestFile"("random");
