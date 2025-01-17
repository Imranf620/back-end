import { Router } from "express";
import { authorizedAdmin, isAuthenticated } from "../middleware/auth.js";
import {
  getAllUsers,
  getUserDetails,
  toggleUserStatus,
  updateUser,
  deleteUser,
  getAllFiles,
  getUserFiles,
  deleteFile,
  getTotalStorageOccupied,

} from "../controllers/adminController.js";

const router = Router();

router.get("/users", getAllUsers);
router.get("/user/:userId", isAuthenticated, authorizedAdmin, getUserDetails);
router.put("/user/:userId", isAuthenticated, authorizedAdmin, updateUser);
router.post("/user/:userId/status", isAuthenticated, authorizedAdmin, toggleUserStatus);
router.delete("/user/:userId", isAuthenticated, authorizedAdmin, deleteUser);

// router.get("/files", isAuthenticated, authorizedAdmin, getAllFiles);
router.get("/files", isAuthenticated, authorizedAdmin,getUserFiles)
router.delete("/file", isAuthenticated, authorizedAdmin,deleteFile)
router.get("/files/total/storage", isAuthenticated, authorizedAdmin,getTotalStorageOccupied)



export default router;
