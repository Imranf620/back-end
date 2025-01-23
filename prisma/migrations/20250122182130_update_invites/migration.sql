/*
  Warnings:

  - Added the required column `description` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Video_url_key";

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;
