import catchAsyncError from "../middleware/catchAsyncErrors.js";
import ApiFeatures from "../utils/apiFeature.js";
import apiResponse from "../utils/apiResponse.js";
import prisma from "../utils/prisma.js";
import sendEmail from "../utils/sendMail.js";


export const uploadFile = catchAsyncError(async (req, res, next) => {
  const { name, size: fileSize, type, path, folderId } = req.body;

  const size = Number(fileSize);
  const userId = req.user;

  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: {
      files: true,
      folders: true,
    },
  });
  if (!user) {
    return apiResponse(false, "User not found", null, 404, res);
  }
  const totalFileSize = user.files.reduce(
    (total, file) => total + file.size,
    0
  );
  const totalStorageInBytes = user.totalStorage * 1000 * 1000 * 1000;
  const availableStorageInBytes = totalStorageInBytes - totalFileSize;
  if (size > availableStorageInBytes) {
    return apiResponse(false, "Not enough storage", null, 413, res);
  }

  const calculateDaysRemaining = (subscribedAt, validDays) => {
    const currentDate = new Date();
    const subscriptionDate = new Date(subscribedAt);
    subscriptionDate.setDate(subscriptionDate.getDate() + validDays);
    return subscriptionDate > new Date();
  };

  const daysRemaining = calculateDaysRemaining(
    user.subscribedAt,
    user.validDays
  );
  if (!daysRemaining) {
    return apiResponse(
      false,
      "Your subscription has expired. Please renew your subscription.",
      null,
      401,
      res
    );
  }

  let folder = null;
  if (folderId) {
    folder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      return apiResponse(
        false,
        "Folder not found or unauthorized",
        null,
        404,
        res
      );
    }
  }

  const file = await prisma.file.create({
    data: {
      name,
      size,
      type,
      path,
      userId,
      private: true,
      folderId: folder ? folder.id : null,
    },
  });

  console.log("fieleee", file);

  return apiResponse(true, "File uploaded successfully", file, 200, res);
});

export const getAllFiles = catchAsyncError(async (req, res, next) => {
  const { orderBy, orderDirection = "asc", keyword } = req.query;

  const validOrderByFields = {
    date: "createdAt",
    name: "name",
    size: "size",
  };

  const orderField = validOrderByFields[orderBy] || "createdAt";

  const userId = req.user;
  let query = {
    where: {
      userId,
    },
    orderBy: {
      [orderField]: orderDirection.toLowerCase() === "desc" ? "desc" : "asc",
    },
    include: {
      trash: true,
      fileShares: true,
    },
  };

  if (keyword) {
    query.where.OR = [{ name: { contains: keyword, mode: "insensitive" } }];
  }

  const files = await prisma.file.findMany(query);

  const withoutTrash = files.filter((file) => file.trash.length === 0);

  return apiResponse(
    true,
    "Files retrieved successfully",
    withoutTrash,
    200,
    res
  );
});

export const getVideoFiles = catchAsyncError(async (req, res, next) => {
  const { orderBy, orderDirection = "asc", keyword } = req.query;
  const userId = req.user;
  const videoMimeTypes = ["video/mp4", "video/mkv", "video/avi"];

  const validOrderByFields = {
    date: "createdAt",
    name: "name",
    size: "size",
  };

  const orderField = validOrderByFields[orderBy] || "createdAt";

  // Base query
  let query = {
    where: {
      userId,
      type: { in: videoMimeTypes },
    },
    orderBy: {
      [orderField]: orderDirection.toLowerCase() === "desc" ? "desc" : "asc",
    },
    include: {
      trash: true,
      fileShares: true,
    },
  };

  // Search functionality
  if (keyword) {
    query.where.OR = [{ name: { contains: keyword, mode: "insensitive" } }];
  }

  const videos = await prisma.file.findMany(query);

  const withoutTrash = videos.filter((video) => video.trash.length === 0);

  return apiResponse(
    true,
    "Video files retrieved successfully",
    withoutTrash,
    200,
    res
  );
});

export const getImageFiles = catchAsyncError(async (req, res, next) => {
  const { orderBy, orderDirection = "asc", keyword } = req.query;
  const userId = req.user;
  const imageMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  const validOrderByFields = {
    date: "createdAt",
    name: "name",
    size: "size",
  };

  const orderField = validOrderByFields[orderBy] || "createdAt";

  // Base query
  let query = {
    where: {
      userId,
      type: { in: imageMimeTypes },
    },
    orderBy: {
      [orderField]: orderDirection.toLowerCase() === "desc" ? "desc" : "asc",
    },
    include: {
      trash: true,
      fileShares: true,
    },
  };

  // Search functionality
  if (keyword) {
    query.where.OR = [{ name: { contains: keyword, mode: "insensitive" } }];
  }

  const images = await prisma.file.findMany(query);

  const withoutTrash = images.filter((image) => image.trash.length === 0);

  return apiResponse(
    true,
    "Image files retrieved successfully",
    withoutTrash,
    200,
    res
  );
});

export const getDocumentFiles = catchAsyncError(async (req, res, next) => {
  const { orderBy, orderDirection = "asc", keyword } = req.query;
  const userId = req.user;
  const documentMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const validOrderByFields = {
    date: "createdAt",
    name: "name",
    size: "size",
  };

  const orderField = validOrderByFields[orderBy] || "createdAt";

  let query = {
    where: {
      userId,
      type: { in: documentMimeTypes },
    },
    orderBy: {
      [orderField]: orderDirection.toLowerCase() === "desc" ? "desc" : "asc",
    },
    include: {
      trash: true,
      fileShares: true,
    },
  };

  if (keyword) {
    query.where.OR = [{ name: { contains: keyword, mode: "insensitive" } }];
  }

  const documents = await prisma.file.findMany(query);

  const withoutTrash = documents.filter(
    (document) => document.trash.length === 0
  );

  return apiResponse(
    true,
    "Document files retrieved successfully",
    withoutTrash,
    200,
    res
  );
});

export const getOtherFiles = catchAsyncError(async (req, res, next) => {
  const { orderBy, orderDirection = "asc", keyword } = req.query;
  const userId = req.user;
  const excludedMimeTypes = [
    "video/mp4",
    "video/mkv",
    "video/avi", // Video types
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp", // Image types
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Document types
  ];

  const validOrderByFields = {
    date: "createdAt",
    name: "name",
    size: "size",
  };

  const orderField = validOrderByFields[orderBy] || "createdAt";

  let query = {
    where: {
      userId,
      NOT: { type: { in: excludedMimeTypes } },
    },
    orderBy: {
      [orderField]: orderDirection.toLowerCase() === "desc" ? "desc" : "asc",
    },
    include: {
      trash: true,
      fileShares: true,
    },
  };

  if (keyword) {
    query.where.OR = [{ name: { contains: keyword, mode: "insensitive" } }];
  }

  const others = await prisma.file.findMany(query);

  const withoutTrash = others.filter((other) => other.trash.length === 0);

  return apiResponse(
    true,
    "Other files retrieved successfully",
    withoutTrash,
    200,
    res
  );
});

export const getLatestFiles = catchAsyncError(async (req, res, next) => {
  const userId = req.user;
  const latestFiles = await prisma.file.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    include: {
      trash: true,
      fileShares: true,
    },
  });

  const withoutTrash = latestFiles.filter((file) => file.trash.length === 0);

  return apiResponse(
    true,
    "Latest files retrieved successfully",
    withoutTrash,
    200,
    res
  );
});

export const editFileName = catchAsyncError(async (req, res, next) => {
  const { fileId, newName } = req.body;
  const userId = req.user;
  if (!fileId || !newName) {
    return apiResponse(
      false,
      "File ID and new name are required",
      null,
      400,
      res
    );
  }

  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
    },
  });

  if (!file) {
    return apiResponse(false, "File not found", null, 404, res);
  }

  const updatedFile = await prisma.file.update({
    where: {
      id: fileId,
    },
    data: {
      name: newName,
    },
  });

  return apiResponse(
    true,
    "File name updated successfully",
    updatedFile,
    200,
    res
  );
});

export const deleteFile = catchAsyncError(async (req, res, next) => {
  const { fileIds } = req.query;
  const userId = req.user;

  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    return apiResponse(false, "Invalid fileIds provided", null, 400, res);
  }

  const filesToDelete = await prisma.file.findMany({
    where: {
      id: {
        in: fileIds,
      },
      userId,
    },
  });

  if (!filesToDelete || filesToDelete.length === 0) {
    return apiResponse(false, "No files found to delete", null, 404, res);
  }

  const deletedFiles = await prisma.file.deleteMany({
    where: {
      id: {
        in: fileIds,
      },
    },
  });

  if (deletedFiles.count === 0) {
    return apiResponse(false, "No files were deleted", null, 400, res);
  }

  return apiResponse(true, "Files deleted successfully", null, 200, res);
});

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

  let existingFile = await prisma.file.findUnique({
    where: {
      random: randomString,
    },
  });

  while (existingFile) {
    length += 1;
    randomString = generateRandomString(length);
    existingFile = await prisma.guestFile.findUnique({
      where: {
        random: randomString,
      },
    });
  }

  return randomString;
}

export const shareFile = catchAsyncError(async (req, res, next) => {
  const { visibility, emails, fileId } = req.body;
  let random = await generateUniqueRandomString(prisma);
  const generateRandomLetter = () => {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return letters[Math.floor(Math.random() * letters.length)];
  };


  const userId = req.user;

  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });
  if (file.folderId) {
    const randomLetter = generateRandomLetter();
    random = `${randomLetter}/${random}`;
  }
  console.log("random file", random);


  if (!file) {
    return apiResponse(false, "File not found", null, 404, res);
  }

  if (file.userId !== userId) {
    return apiResponse(
      false,
      "You are not authorized to share this file",
      null,
      403,
      res
    );
  }

  let updatedFileData = { visibility: visibility.toUpperCase() };

  const accessUrl = `${process.env.BASE_URL}/dashboard/shared/${fileId}`;

  if (visibility.toUpperCase() === "PUBLIC") {
    updatedFileData = {
      ...updatedFileData,
      visibility: "PUBLIC",
      random: random,
    };
  }

  const updatedFile = await prisma.file.update({
    where: { id: fileId },
    data: updatedFileData,
  });

  if (visibility.toUpperCase() === "SHARED" && emails) {
    const existingShares = await prisma.fileShare.findMany({
      where: {
        fileId: fileId,
      },
    });

    const existingEmails = existingShares.map((share) => share.email);

    const emailsToRemove = existingEmails.filter(
      (email) => !emails.includes(email)
    );
    const emailsToAdd = emails.filter(
      (email) => !existingEmails.includes(email)
    );

    await prisma.fileShare.deleteMany({
      where: {
        fileId: fileId,
        email: { in: emailsToRemove },
      },
    });

    const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f7f6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #0073e6;
            font-size: 24px;
            text-align: center;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 15px;
          }
          .highlight {
            font-weight: bold;
            color: #0073e6;
          }
          .button {
            display: inline-block;
            background-color: #0073e6;
            color: #ffffff;
            padding: 12px 20px;
            text-align: center;
            text-decoration: none;
            border-radius: 4px;
            font-size: 16px;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            margin-top: 30px;
          }
          .footer a {
            color: #0073e6;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Access Granted</h1>
          <p>You have been granted access to the file <span class="highlight">${file.name}</span>.</p>
          <p>You can view or download the file from the following link:</p>
          <p><a href="${accessUrl}" class="button">Access File</a></p>
          <p>Thank you for using our service!</p>
          <div class="footer">
            <p>If you have any questions, feel free to <a href="mailto:sadibwrites@gmail.com">contact us</a>.</p>
          </div>
        </div>
      </body>
    </html>
  `;
    console.log("accessUrl", accessUrl);

    const emailPromises = emailsToAdd.map(async (email) => {
      await prisma.fileShare.create({
        data: {
          fileId: fileId,
          userId: userId,
          email: email,
        },
      });

      await sendEmail(
        email,
        {
          subject: "Access Granted to File",
          html,
          message: `Access granted to ${file.name}`,
        },
        res
      );
    });

    await Promise.all(emailPromises);
  }

  return apiResponse(
    true,
    "File shared successfully",
    { file: updatedFile, accessUrl },
    200,
    res
  );
});

export const getSingleFile = catchAsyncError(async (req, res, next) => {
  const { fileId } = req.params;
  const userId = req.user;

  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      user: true,
      fileShares: true,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true },
  });
  if (file.visibility === "PUBLIC") {
    return apiResponse(true, "File fetched successfully", file, 200, res);
  }

  const isAllowedToThisUser = file.fileShares.find((file) => {
    return file.email === user.email;
  });

  if (!file) {
    return apiResponse(false, "File not found", null, 404, res);
  }
  if (!isAllowedToThisUser) {
    return apiResponse(
      false,
      "You are not authorized to view this file",
      null,
      403,
      res
    );
  }

  return apiResponse(true, "File fetched successfully", file, 200, res);
});

export const getAllAcceessibleFiles = catchAsyncError(
  async (req, res, next) => {
    const userId = req.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true },
    });

    if (!user) {
      return apiResponse(false, "User not found", null, 404, res);
    }

    const files = await prisma.file.findMany({
      where: {
        visibility: {
          not: "PRIVATE",
        },
      },
      include: {
        user: true,
        fileShares: true,
      },
    });
    if (!files) {
      return apiResponse(false, "No accessible files found", null, 404, res);
    }

    const accessibleFiles = files
      .map((file) => {
        const sharedFiles = file.fileShares.filter(
          (share) => share.email === user.email
        );
        if (sharedFiles.length > 0) {
          return { ...file, fileShares: sharedFiles };
        }
        return null;
      })
      .filter(Boolean);

    if (!accessibleFiles) {
      return apiResponse(false, "No accessible files found", null, 404, res);
    }
    return apiResponse(
      true,
      "Accessible files fetched successfully",
      accessibleFiles,
      200,
      res
    );
  }
);

export const getAllFilesSharedByMe = catchAsyncError(async (req, res, next) => {
  const userId = req.user;

  if (!userId) {
    return apiResponse(false, "User not found", null, 404, res);
  }

  // Fetch files that are not private and include folder information
  const files = await prisma.file.findMany({
    where: {
      userId,
      visibility: {
        not: "PRIVATE",
      },
    },
    include: {
      folder: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!files || files.length === 0) {
    return apiResponse(false, "No files shared by you found", null, 404, res);
  }

  const formattedFiles = files.map((file) => ({
    id: file.id,
    fileId: file.id,
    userId: file.userId,
    sharedAt: file.createdAt,
    email: req.user.email, // Assuming the user's email is available
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
    file: {
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type,
      path: file.path,
      userId: file.userId,
      visibility: file.visibility,
      private: file.private,
      totalDownloads: file.totalDownloads,
      totalViews: file.totalViews,
      downloadsByUsers: file.downloadsByUsers,
      viewsByUsers: file.viewsByUsers,
      folderId: file.folderId,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      folder: file.folder
        ? {
            id: file.folder.id,
            name: file.folder.name,
            userId: file.folder.userId,
          }
        : null, 
    },
  }));

  // Return the formatted response
  return apiResponse(
    true,
    "Files Shared by you found",
    formattedFiles,
    200,
    res
  );
});

export const downloadFile = catchAsyncError(async (req, res, next) => {
  const { fileId } = req.params;
  const userId = req.user;

  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      user: true,
      fileShares: true,
    },
  });

  if (!file) {
    return apiResponse(false, "File not found", null, 404, res);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true },
  });

  if (!user) {
    return apiResponse(false, "User not found", null, 404, res);
  }

  if (user.role === "ADMIN") {
    return;
  }

  const downloadsByUsers = file.downloadsByUsers || {};

  if (!downloadsByUsers[user.id]) {
    downloadsByUsers[user.id] = {
      name: user.name,
      count: 1,
    };

    await prisma.file.update({
      where: { id: fileId },
      data: {
        totalDownloads: { increment: 1 },
        downloadsByUsers: downloadsByUsers,
      },
    });
  } else {
    downloadsByUsers[user.id].count += 1;

    await prisma.file.update({
      where: { id: fileId },
      data: {
        downloadsByUsers: downloadsByUsers,
      },
    });
  }

  return apiResponse(
    true,
    "Download record updated successfully",
    null,
    200,
    res
  );
});

export const viewFile = catchAsyncError(async (req, res, next) => {
  const { fileId } = req.params;
  const userId = req.user;

  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    return apiResponse(false, "File not found", null, 404, res);
  }

  const user = await prisma.user.findFirst({
    where: { id: userId },
    select: { role: true },
  });
  if (user.role === "ADMIN") {
    return;
  }

  const viewsByUsers = file.viewsByUsers || {};

  if (!viewsByUsers[userId]) {
    viewsByUsers[userId] = true;

    await prisma.file.update({
      where: { id: fileId },
      data: {
        totalViews: { increment: 1 },
        viewsByUsers: viewsByUsers,
      },
    });
  }

  return apiResponse(true, "View recorded successfully", null, 200, res);
});

async function generateUniqueRandomString(prisma, length = 3) {
  let randomString = generateRandomString(length);

  let existingFile = await prisma.guestFile.findUnique({
    where: {
      random: randomString,
    },
  });

  while (existingFile) {
    length += 1;
    randomString = generateRandomString(length);
    existingFile = await prisma.guestFile.findUnique({
      where: {
        random: randomString,
      },
    });
  }

  return randomString;
}

export const guestUpload = catchAsyncError(async (req, res, next) => {
  const { name, size, type, path } = req.body;

  const random = await generateUniqueRandomString(prisma);

  const file = await prisma.guestFile.create({
    data: {
      name,
      size,
      type,
      path,
      fileUrl: path,
      random,
    },
  });

  return apiResponse(true, "File uploaded successfully", file, 201, res);
});

export const getGuestFile = catchAsyncError(async (req, res, next) => {
  const { fileId } = req.body;
  console.log("newFIle", fileId);

  let file = await prisma.guestFile.findUnique({
    where: { random: fileId },
  });

  if (!file) {
   file = await prisma.file.findUnique({
    where:{
      random: fileId
    }
   })
  }
  if (!file) {
    return apiResponse(false, "File not found", null, 404, res);
  }

  return apiResponse(true, "File fetched successfully", file, 200, res);
});



