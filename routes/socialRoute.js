import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { getAllVideos, uploadVideo } from "../controllers/socialController.js";

const router = Router();
router.post('/upload',isAuthenticated,  uploadVideo)
router.get('/all',isAuthenticated,  getAllVideos)



export default router;
