import mongoose from "mongoose";

const GroupInviteSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    for: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accept", "decline"], // ✅ Fixed
      default: "pending",
    },
  },
  { timestamps: true }
);

const GroupInvite = mongoose.model("GroupInvite", GroupInviteSchema);
export default GroupInvite;
