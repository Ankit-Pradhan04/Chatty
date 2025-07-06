import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controller.js";

const router = express.Router();

// this token is needed to establish video/audio calls and chat streams
router.get("/token", protectRoute, getStreamToken);

export default router;