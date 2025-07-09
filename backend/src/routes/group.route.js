import express from "express";
import {
  createGroup,
  getAllGroups,
  getSingleGroup,
  updateGroupMembers,
  updateGroupDetails,
  inviteGroupMember,
  respondGroupInvite,
  getMyGroupInvites,
} from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

router.post("/", createGroup);
router.get("/", getAllGroups);

// ✅ Move these ABOVE `/:id`
router.get("/invites", getMyGroupInvites);
router.patch("/invites/respond/:inviteId", respondGroupInvite);

router.get("/:id", getSingleGroup);
router.patch("/:groupId/members", updateGroupMembers);
router.patch("/updateGroup/:groupId", updateGroupDetails);
router.post("/:groupId/invite", inviteGroupMember);

export default router;
