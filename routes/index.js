import { Router } from "express";
import userRoute from "./userRoute.js"
import filesRoute from "./filesRoute.js"
import trashRoute from "./trashRoute.js"
import paymentRoute from "./paymentRoute.js"
import { getPresignedUrl } from "../controllers/s3Service.js";
import { reqUserId } from "../middleware/auth.js";
import adminRoute from "./adminRoute.js"
import sendEmailToAddedUsers from "../utils/sendEmailToAddedUsers.js";
import folderRoute from "./folderRoute.js"


const router = Router()

router.use("/api/v1/user",userRoute )
router.use("/api/v1/files",filesRoute )
router.use("/api/v1/trash",trashRoute )
router.use("/api/v1/payment",paymentRoute )
router.use("/api/v1/admin",adminRoute )
router.use("/api/v1/folders",folderRoute )


router.post("/api/v1/pre-ass-url",reqUserId, getPresignedUrl)
router.post("/api/v1/mail", sendEmailToAddedUsers)



export default router