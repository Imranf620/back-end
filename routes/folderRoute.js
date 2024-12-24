import { Router } from "express";
import { createFolder, deleteFolder, getAllFolders, getFolder, updateFolder } from "../controllers/folderController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router =  Router();


router.post('/create',isAuthenticated,  createFolder);
router.put('/:id', isAuthenticated,  updateFolder);
router.delete('/:id', isAuthenticated,  deleteFolder);
router.get('/', isAuthenticated,  getAllFolders);
router.get('/:id', isAuthenticated,  getFolder);
export default router;