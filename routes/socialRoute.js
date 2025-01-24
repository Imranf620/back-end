import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { deleteMyVideo, getAllVideos, getSingleVideo, uploadVideo } from "../controllers/socialController.js";

const router = Router();
router.post('/upload',isAuthenticated,  uploadVideo)
router.get('/all',isAuthenticated,  getAllVideos)
router.get('/',isAuthenticated,getSingleVideo)
router.delete('/', isAuthenticated, deleteMyVideo)



export default router;
