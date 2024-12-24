import catchAsyncError from "../middleware/catchAsyncErrors.js";
import ApiFeatures from "../utils/apiFeature.js";
import apiResponse from "../utils/apiResponse.js";
import prisma from "../utils/prisma.js";

export const getAllUsers = catchAsyncError(async (req, res, next) => {
    let query = {};
    const apiFeatures = new ApiFeatures(query, req.query)
      .search()
      .filter()
      .pagination(10);
  
    const users = await prisma.user.findMany({
        ...apiFeatures.query,
        include: {
            files: true,
        },
    });
    const totalUsers = await prisma.user.count();

    apiResponse(true, "All Users", { users, totalUsers }, 200, res);
});

  
  
  export const toggleUserStatus = catchAsyncError(async (req, res, next) => {
    const { userId } = req.params;
    
  
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return apiResponse(false, "User not found", null, 404, res);
    }

  const updatedUser =   await prisma.user.update({
        where: { id: userId },
        data: { active: !user.active },
    })

    const statusMessage = updatedUser.active ? "Activated" : "Suspended";
  
    apiResponse(
      true,
      `User ${statusMessage} Successfully`,
      null,
      200,
      res
    );
  });
  
  

  export const getUserDetails = catchAsyncError(async (req, res, next) => {
    const { userId } = req.params;
  
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { files: true, payments: true, sharedFiles: true },
    });

    const currentDate = new Date();
  const subscribedAt = new Date(user.subscribedAt);
  const validTillFromSubsAt = user.validDays;

  subscribedAt.setDate(subscribedAt.getDate() + validTillFromSubsAt);

  const remainingDays = Math.max(
    Math.ceil((subscribedAt - currentDate) / (1000 * 60 * 60 * 24)),
    0
  );
  
    if (!user) {
      return apiResponse(false, "User not found", null, 404, res);
    }
  
    apiResponse(true, "User Details", {...user, remainingDays}, 200, res);
  });

  export const updateUser = catchAsyncError(async (req, res, next) => {
    const { userId } = req.params;
    const { name, email, role, active } = req.body;
  
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email, role, active },
    });
  
    apiResponse(true, "User Updated Successfully", updatedUser, 200, res);
  });
  export const deleteUser = catchAsyncError(async (req, res, next) => {
    const { userId } = req.params;
  
    await prisma.user.delete({ where: { id: userId } });
  
    apiResponse(true, "User Deleted Successfully", null, 200, res);
  });
    

  export const getAllFiles = catchAsyncError(async (req, res, next) => {
    let query = {};
    const apiFeatures = new ApiFeatures(query, req.query)
      .search()
      .filter()
      .pagination(10);
  
    const files = await prisma.file.findMany(apiFeatures.query);
    const totalFiles = await prisma.file.count();
  
    apiResponse(true, "All Files", { files, totalFiles }, 200, res);
  });



  export const getUserFiles = catchAsyncError(async (req, res, next) => {
    const { orderBy = "date", orderDirection = "asc" } = req.query;
    const { userId } = req.query; 
   
    console.log("req.query , " , req.query)
    
  
    const validOrderByFields = {
      date: "createdAt",
      name: "name",
      size: "size",
    };
  
    const orderField = validOrderByFields[orderBy] || "createdAt"; 
    const sortOrder = orderDirection.toLowerCase() === "desc" ? "desc" : "asc";
  
    let files;
    try {
        if(userId){

             files = await prisma.file.findMany({
                where: {
                    userId, 
                },
                orderBy: {
                    [orderField]: sortOrder, 
                },
                include: {
                    trash: true, 
                    fileShares: true, 
                },
            });
        }else{
             files = await prisma.file.findMany({
                orderBy: {
                    [orderField]: sortOrder, 
                },
                include: {
                    trash: true, 
                    fileShares: true, 
                    user:true
                },
            });
        }

        
  
      const withoutTrash = files.filter((file) => file.trash.length === 0); 
  
      return apiResponse(
        true,
        " files retrieved successfully",
        withoutTrash,
        200,
        res
      );
    } catch (error) {
      console.error("Error fetching user files:", error); // Log the error for debugging
      return  apiResponse(false, "error fetching user files:", null, 400, res); 
    }
  });
  

  // export const deleteFile = catchAsyncError(async(req,res,next)=>{
  //   const { fileId } = req.params;

  //   const file = await prisma.file.findFirst({
  //       where: { id: fileId },
  //   })
  //   if (!file) {
  //     return apiResponse(false, "File not found", null, 404, res);
  //   }
  //   await prisma.file.delete({ where: { id: fileId } });
  //   return apiResponse(true, "File deleted successfully", null, 200, res);
  // })

  export const deleteFile = catchAsyncError(async(req,res,next)=>{
    const {fileIds} = req.query

    
    if(!fileIds|| !Array.isArray(fileIds) || fileIds.length===0){
      return apiResponse(false, "Invalid fileIds provided", null, 400, res);
    }

    const filesToDelete = await prisma.file.findMany({
      where:{
        id: {
          in: fileIds
        }
      }
    })

    if(!filesToDelete || filesToDelete.length===0){
      return apiResponse(false, "No files found to delete", null, 404, res);
    }

    const deletedFiles = await prisma.file.deleteMany({
      where:{
        id: {
          in: fileIds
        }
      }
    })

    if (deletedFiles.count === 0 || !deletedFiles) {
      return apiResponse(false, "No files were deleted", null, 400, res);
    }
    
    
  return apiResponse(true, "Files deleted successfully", null, 200, res);

  })


  export const getTotalStorageOccupied = catchAsyncError(async (req,res,next)=>{
    const totalSize = await prisma.file.aggregate({
      _sum:{
        size:true
      }
    });
    console.log(totalSize)
    return apiResponse(true, "Total storage occupied", totalSize, 200, res);
  })