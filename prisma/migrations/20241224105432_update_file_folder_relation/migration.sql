/*
  Warnings:

  - You are about to drop the `_FileToFolder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_FileToFolder" DROP CONSTRAINT "_FileToFolder_A_fkey";

-- DropForeignKey
ALTER TABLE "_FileToFolder" DROP CONSTRAINT "_FileToFolder_B_fkey";

-- DropTable
DROP TABLE "_FileToFolder";

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
