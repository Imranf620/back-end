import { Router } from "express";
import { uploadFile ,getAllFiles, getVideoFiles, getImageFiles, getDocumentFiles, getOtherFiles, getLatestFiles,editFileName,deleteFile,shareFile,getSingleFile,getAllAcceessibleFiles, getAllFilesSharedByMe, viewFile, downloadFile, guestUpload, getGuestFile} from "../controllers/filesController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = Router();

router.post("/upload", isAuthenticated, uploadFile)
router.get("/get/files", isAuthenticated,getAllFiles)
router.get("/get/media", isAuthenticated,getVideoFiles)
router.get("/get/images", isAuthenticated,getImageFiles)
router.get("/get/documents", isAuthenticated,getDocumentFiles)
router.get("/get/other", isAuthenticated,getOtherFiles)
router.get("/get/latest", isAuthenticated,getLatestFiles)
router.put("/edit/name", isAuthenticated,editFileName)
router.delete("/delete", isAuthenticated,deleteFile)
router.post("/share", isAuthenticated,shareFile)
router.get("/get/file/:fileId", isAuthenticated,getSingleFile)
router.get("/get/shared", isAuthenticated,getAllAcceessibleFiles)
router.get("/get/sharedByMe", isAuthenticated,getAllFilesSharedByMe)
router.get("/view/:fileId", isAuthenticated,viewFile)
router.get("/download/:fileId", isAuthenticated,downloadFile)
router.post('/guest/upload', guestUpload)
router.get('/guest/:fileId',getGuestFile )





export default router;
