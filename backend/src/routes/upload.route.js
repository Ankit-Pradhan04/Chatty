import express from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { uploadSingleImage } from "../middleware/upload.middleware.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Optional: protect route so only authenticated can upload
router.post("/", protectRoute, uploadSingleImage, uploadImage);

export default router;