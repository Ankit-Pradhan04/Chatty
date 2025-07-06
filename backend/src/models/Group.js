import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    streamChannelId: { type: String, required: true },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", GroupSchema);
export default Group;
