-- AlterTable
ALTER TABLE "File" ADD COLUMN     "downloadsByUsers" JSONB,
ADD COLUMN     "totalDownloads" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalViews" INTEGER NOT NULL DEFAULT 0;
