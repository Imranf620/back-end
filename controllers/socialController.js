import catchAsyncError from "../middleware/catchAsyncErrors.js";
import apiResponse from "../utils/apiResponse.js";
import prisma from "../utils/prisma.js";

function generateRandomString(length = 3) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

async function generateUniqueRandomStringForFile(prisma, length = 3) {
  let randomString = generateRandomString(length);

  let existingFile = await prisma.video.findUnique({
    where: {
      random: randomString,
    },
  });

  while (existingFile) {
    length += 1;
    randomString = generateRandomString(length);
    existingFile = await prisma.video.findUnique({
      where: {
        random: randomString,
      },
    });
  }

  return randomString;
}

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
  console.log("sharingOption: " , sharingOption)
  console.log("specificUsers: " , specificUsers)

  const random = await generateUniqueRandomStringForFile(prisma);

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
      random,
    },
  });
  console.log("video: ", video);

  if (sharingOption === "SHARED" && specificUsers.length > 0) {
    let inviteIds = [];
    for (const email of specificUsers) {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      console.log("user", user);

      if (user) {
        const invite = await prisma.invite.create({
          data: {
            videoId: video.id,
            inviteeId: user.id,
          },
        });
        console.log("invite", invite);
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

export const getSingleVideo = catchAsyncError(async (req,res,next)=>{
  const {random} = req.query
  console.log("random video", random);
  const video = await prisma.video.findUnique({
    where:{random:random|| ""},
    include:{
      user:true,
      invites:true,
    }
  })

  if(!video){
    return apiResponse(false,"Video not found",null,404,res)
  }

  return apiResponse(true,"Video fetched successfully",video,200,res)
})


export const deleteMyVideo = catchAsyncError(async(req,res,next)=>{
  const user = req.user
  const {id} = req.query
  const video = await prisma.video.findUnique({
    where:{id:id, uploadedBy:user.id},
  })

  if(!video){
    return apiResponse(false,"Video not found",null,404,res)
  }

  const allVideos = await prisma.video.delete({where:{id:video.id}})
  return apiResponse(true,"Video deleted successfully",allVideos,200,res)
})