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
      return apiResponse(false, "Folder not found or not updated", null, 404, res);
    }
  
    return apiResponse(true, "Folder updated successfully", folder, 200, res);
  });
  
  export const deleteFolder = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
  
    const folder = await prisma.folder.delete({
      where: { id },
    });
  
    if (!folder) {
      return apiResponse(false, "Folder not found or not deleted", null, 404, res);
    }
  
    return apiResponse(true, "Folder deleted successfully", folder, 200, res);
  });

  export const getAllFolders = catchAsyncError(async (req, res, next) => {
    const userId = req.user; 
  
    const folders = await prisma.folder.findMany({
      where: { userId },
      include: { children: true, files: true }, 
    });
  
    if (!folders.length) {
      return apiResponse(false, "No folders found", null, 404, res);
    }
  
    return apiResponse(true, "Folders retrieved successfully", folders, 200, res);
  });
  

  export const getFolder = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
  
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: { children: true, files: true }, 
    });
  
    if (!folder) {
      return apiResponse(false, "Folder not found", null, 404, res);
    }
  
    return apiResponse(true, "Folder retrieved successfully", folder, 200, res);
  });
  