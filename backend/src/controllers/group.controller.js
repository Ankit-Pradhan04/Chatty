import Group from "../models/Group.js";
import GroupInvite from "../models/GroupInvite.js";
import mongoose from "mongoose";
import { StreamChat } from "stream-chat";

const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

export const createGroup = async (req, res) => {
  const { name, memberIds = [], image, createdById } = req.body;
  try {
    const allMembers = [createdById, ...memberIds];

    const channel = serverClient.channel("messaging", `group-${Date.now()}`, {
      name,
      image,
      members: allMembers,
      created_by_id: createdById,
    });
    await channel.create();

    const newGroup = await Group.create({
      name,
      image,
      members: allMembers,
      admins: [createdById], // new field
      streamChannelId: channel.id,
    });
    console.log(newGroup.admins);

    res.status(201).json(newGroup);
  } catch (err) {
    console.error("Error in createGroup:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllGroups = async (req, res) => {
  const userId = req.user._id;
  try {
    const groups = await Group.find({ members: userId });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSingleGroup = async (req, res) => {
  // console.log("helllo");
  const { id } = req.params;
  // console.log(id)

  try {
    const group = await Group.findById(id)
      .populate("members", "fullName profilePic _id")
      .populate("admins", "fullName profilePic _id");
      // console.log(group);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);
  } catch (err) {
    console.error("Error fetching group:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGroupMembers = async (req, res) => {
  const { groupId } = req.params;
  const { userId, action, makeAdmin } = req.body;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ message: "Invalid group ID" });
  }

  if (!userId || !action) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.map(String).includes(userId);
    const isAdmin = group.admins.map(String).includes(userId);

    switch (action) {
      case "remove":
        group.members = group.members.filter(id => id.toString() !== userId);
        group.admins = group.admins.filter(id => id.toString() !== userId);
        break;

      case "toggleAdmin":
        if (isAdmin) {
          group.admins = group.admins.filter(id => id.toString() !== userId);
        } else {
          if (!isMember) {
            return res.status(400).json({ message: "User must be a member to become admin" });
          }
          group.admins.push(userId);
        }
        break;

      // ⛔ No longer directly supporting "add" due to invite-based system
      case "add":
        return res.status(400).json({ message: "Use invite system to add members." });

      default:
        return res.status(400).json({ message: "Invalid action type" });
    }

    // Auto-promote sole remaining member to admin
    if (group.members.length === 1) {
      const onlyMember = group.members[0].toString();
      if (!group.admins.includes(onlyMember)) {
        group.admins = [onlyMember];
      }
    }

    // Delete group if empty
    if (group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      return res.json({ message: "Group deleted as no members remain." });
    }

    await group.save();

    const populatedGroup = await Group.findById(group._id)
      .populate("members admins", "fullName profilePic");

    res.json(populatedGroup);
  } catch (err) {
    console.error("❌ Error updating group members:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const updateGroupDetails = async (req, res) => {
  const { groupId } = req.params;
  const { name, image } = req.body;
  console.log("jello");

  // if (!name.trim()) return res.status(400).json({ message: "Name is required" });

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ message: "Group not found" });

  if(name) group.name = name;
  group.image = image || group.image;
  await group.save();

  const populated = await Group.findById(groupId).populate("members admins", "fullName profilePic");
  res.json(populated);
};

export const inviteGroupMember = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ message: "Group not found" });

  // Only admins can invite
  if (!group.admins.includes(req.user._id))
    return res.status(403).json({ message: "Only admins can invite" });

  // Already in group
  if (group.members.includes(userId)) {
    return res.status(400).json({ message: "User is already in the group" });
  }

  // Check if a pending invite exists
  const existingInvite = await GroupInvite.findOne({
    group: groupId,
    for: userId,
    status: "pending",
  });

  if (existingInvite) {
    return res.status(400).json({ message: "User already has a pending invite" });
  }

  // Optional: delete or archive old invites (accepted/declined)
  await GroupInvite.deleteMany({ group: groupId, for: userId, status: { $ne: "pending" } });

  const newInvite = await GroupInvite.create({
    group: groupId,
    for: userId,
    invitedBy: req.user._id,
    status: "pending",
  });

  res.status(201).json(newInvite);
};


export const getMyGroupInvites = async (req, res) => {
  const invites = await GroupInvite.find({
    for: req.user._id,
    status: "pending",
  })
    .populate("group", "name image")
    .populate("invitedBy", "fullName profilePic");

  res.json(invites);
};

export const respondGroupInvite = async (req, res) => {
  const { inviteId } = req.params;
  const { action } = req.body;

  if (!["accept", "decline", "pending"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  const invite = await GroupInvite.findById(inviteId);
  if (!invite || invite.for.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: "Invite not found" });
  }

  if (invite.status !== "pending") {
    return res.status(400).json({ message: "Invite already handled" });
  }

  invite.status = action;
  await invite.save();

  if (action === "accept") {
    const group = await Group.findById(invite.group);
    if (!group.members.includes(invite.for)) {
      group.members.push(invite.for);
      await group.save();
    }

    // ✅ Also add to Stream Chat channel
    try {
      const channel = serverClient.channel("messaging", group.streamChannelId);
      await channel.addMembers([req.user._id.toString()]);
    } catch (err) {
      console.error("Failed to add user to Stream channel:", err.message);
    }
  }

  res.json(invite);
};


