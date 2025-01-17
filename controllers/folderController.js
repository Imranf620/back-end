import prisma from "../utils/prisma.js";
import apiResponse from "../utils/apiResponse.js";
import catchAsyncError from "../middleware/catchAsyncErrors.js";

export const createFolder = catchAsyncError(async (req, res, next) => {
  const userId = req.user;
  const { name, parentId } = req.body;

  const folder = await prisma.folder.create({
    data: {
      name,
      userId,
      parentId,
    },
  });

  if (!folder) {
    return apiResponse(false, "Folder not created", null, 400, res);
  }

  return apiResponse(true, "Folder created successfully", folder, 201, res);
});

export const updateFolder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name, parentId } = req.body;

  const folder = await prisma.folder.update({
    where: { id },
    data: {
      name,
      parentId,
    },
  });

  if (!folder) {
    return apiResponse(
      false,
      "Folder not found or not updated",
      null,
      404,
      res
    );
  }

  return apiResponse(true, "Folder updated successfully", folder, 200, res);
});

export const deleteFolder = catchAsyncError(async (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return apiResponse(false, "No folder IDs provided", null, 400, res);
  }

  try {
    const deleteFolderRecursively = async (folderId) => {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        include: { children: true, files: true },
      });

      if (!folder) {
        throw new Error(`Folder with ID ${folderId} not found`);
      }

      await prisma.file.deleteMany({
        where: { folderId },
      });

      for (const child of folder.children) {
        await deleteFolderRecursively(child.id);
      }

      await prisma.folder.delete({
        where: { id: folderId },
      });
    };

    for (const folderId of ids) {
      await deleteFolderRecursively(folderId);
    }

    return apiResponse(true, "Folders deleted successfully", null, 200, res);
  } catch (error) {
    console.error("Error deleting folders:", error.message);
    return apiResponse(
      false,
      "Error deleting folders",
      error.message,
      500,
      res
    );
  }
});

export const getAllFolders = catchAsyncError(async (req, res, next) => {
  const userId = req.user;

  const folders = await prisma.folder.findMany({
    where: { userId, parent: null },
    include: { children: true, files: true },
  });

  if (!folders.length) {
    return apiResponse(false, "No folders found", null, 404, res);
  }

  return apiResponse(true, "Folders retrieved successfully", folders, 200, res);
});

export const getFolder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  console.log("idis", id);

  // Fetch folder with files that are not in trash
  const folder = await prisma.folder.findUnique({
    where: { id },
    include: {
      files: {
        where: {
          trash: {
            none: {}, // Filters files where there are no related entries in the trash table
          },
        },
      },
      children: {
        include: {
          children: {
            include: {
              children: true,
            },
          },
        },
      },
    },
  });

  console.log("folderis", folder);

  if (!folder) {
    return apiResponse(false, "Folder not found", null, 404, res);
  }

  return apiResponse(true, "Folder retrieved successfully", folder, 200, res);
});
