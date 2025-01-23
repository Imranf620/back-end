import catchAsyncError from "../middleware/catchAsyncErrors.js";
import apiResponse from "../utils/apiResponse.js";
import prisma from "../utils/prisma.js";

export const uploadVideo = catchAsyncError(async (req, res, next) => {
  const {
    name,
    size,
    type,
    path,
    description,
    category,
    sharingOption,
    specificUsers,
  } = req.body;
  const userId = req.user;


  const video = await prisma.video.create({
    data: {
      name,
      size,
      type,
      url: path,
      description,
      category,
      visibility: sharingOption.toUpperCase(),
      uploadedBy: userId,
    },
  });

  if (sharingOption === "specific" && specificUsers.length > 0) {
    let inviteIds = [];
    for (const email of specificUsers) {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        const invite = await prisma.invite.create({
          data: {
            videoId: video.id,
            inviteeId: user.id,
          },
        });
        inviteIds.push(invite.id);
      }
    }
  }

  return apiResponse(true, "Video uploaded successfully", video, 200, res);
});

export const getAllVideos = catchAsyncError(async (req, res, next) => {
    try {
      const { search, category, page = 1, limit = 10 } = req.query;
  
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;
      const skip = (pageNumber - 1) * limitNumber;
  
      const videos = await prisma.video.findMany({
        where: {
          visibility: "PUBLIC",
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }),
          ...(category !== "all" && { category }), 
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limitNumber,
        skip,
      });
  
      return apiResponse(true, "Videos fetched successfully", videos, 200, res);
    } catch (error) {
      console.error(error);
      return apiResponse(false, "Failed to fetch videos", null, 500, res);
    }
  });
  