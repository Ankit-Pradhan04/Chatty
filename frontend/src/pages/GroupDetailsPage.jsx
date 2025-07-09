import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchGroupById,
  getUserFriends,
  updateGroupMembers,
  updateGroupDetails,
  sendGroupInvite,
  uploadImage
} from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { useState } from "react";
import toast from "react-hot-toast";
import { CameraIcon, LoaderIcon } from "lucide-react";

export default function GroupDetailsPage() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [nameEdit, setNameEdit] = useState("");
  const [imgEdit, setImgEdit] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const { data: group = {}, isLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => fetchGroupById(groupId),
    enabled: !!groupId,
    onSuccess: (g) => {
      setNameEdit(g.name);
      setImgEdit(g.image || "");
    },
  });

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: !!authUser,
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const { url } = await uploadImage(formData);
      setImgEdit(url + `?t=${Date.now()}`);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const membersMutation = useMutation({
    mutationFn: updateGroupMembers,
    onSuccess: (data, { action, userId }) => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      if (!data) return navigate("/groups");
      const isSelfRemoved = action === "remove" && userId === authUser._id;
      toast.success(
        isSelfRemoved
          ? "You left the group"
          : action === "add"
          ? "Member added"
          : action === "remove"
          ? "Member removed"
          : "Admin status updated"
      );
      if (isSelfRemoved) navigate("/groups");
    },
  });

  const detailsMutation = useMutation({
    mutationFn: updateGroupDetails,
    onSuccess: () => {
      toast.success("Group details updated");
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      setIsEditing(false);
    },
    onError: () => toast.error("Failed to save details"),
  });

  const confirmEdit = () => {
    const trimmedName = nameEdit.trim();
    const trimmedImg = imgEdit.trim();
    if (!trimmedName && !trimmedImg) return;
    detailsMutation.mutate({ groupId, name: trimmedName, image: trimmedImg });
  };

  if (isLoading || loadingFriends) return <p className="p-4">Loading...</p>;

  const isAdmin = group.admins?.some((a) => a._id === authUser._id);
  const addableFriends = friends.filter(
    (f) => !group.members.some((m) => m._id === f._id)
  );

  return (
    <div className="container mx-auto p-6 max-w-xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1 space-y-2">
          {isEditing ? (
            <>
              <input
                value={nameEdit}
                onChange={(e) => setNameEdit(e.target.value)}
                placeholder="Group Name"
                className="input input-bordered w-full"
              />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-base-200 border">
                  {imgEdit ? (
                    <img
                      src={imgEdit}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CameraIcon className="w-full h-full p-2 text-gray-400" />
                  )}
                </div>
                <label
                  className={`btn btn-sm btn-secondary ${uploading ? "btn-disabled" : ""}`}
                  htmlFor="editGroupImageInput"
                >
                  {uploading ? (
                    <>
                      <LoaderIcon className="animate-spin size-4 mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CameraIcon className="size-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </label>
                <input
                  id="editGroupImageInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{group.name}</h2>
              {group.image && (
                <img
                  src={group.image}
                  alt="Group"
                  className="w-12 h-12 rounded-full object-cover mt-1"
                />
              )}
            </>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  className="btn btn-sm btn-success"
                  onClick={confirmEdit}
                  disabled={!nameEdit.trim() && !imgEdit.trim()}
                >
                  Save
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setNameEdit(group.name);
                    setImgEdit(group.image || "");
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      <section className="mb-4">
        <p className="italic text-sm text-gray-500">
          {isAdmin
            ? "As admin, you can add/remove members and change group details."
            : "Only admins can manage members and change group details."}
        </p>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Members</h3>
        <ul className="space-y-2">
          {group.members.map((user) => {
            const isMemberAdmin = group.admins.some((a) => a._id === user._id);
            return (
              <li
                key={user._id}
                className="flex justify-between items-center border p-3 rounded"
              >
                <span>
                  {user.fullName}{" "}
                  {isMemberAdmin && (
                    <span className="ml-2 text-sm text-blue-500">(Admin)</span>
                  )}
                </span>
                {user._id === authUser._id ? (
                  <button
                    onClick={() =>
                      membersMutation.mutate({
                        groupId,
                        userId: user._id,
                        action: "remove",
                      })
                    }
                    className="btn btn-xs btn-warning"
                  >
                    Leave
                  </button>
                ) : (
                  isAdmin && (
                    <div className="flex gap-2">
                      {!isMemberAdmin && (
                        <button
                          onClick={() =>
                            membersMutation.mutate({
                              groupId,
                              userId: user._id,
                              action: "toggleAdmin",
                            })
                          }
                          className="btn btn-xs btn-outline"
                        >
                          Make Admin
                        </button>
                      )}
                      <button
                        onClick={() =>
                          membersMutation.mutate({
                            groupId,
                            userId: user._id,
                            action: "remove",
                          })
                        }
                        className="btn btn-xs btn-error"
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {isAdmin && (
        <section className="mb-6">
          <h3 className="font-semibold mb-2">Invite New Member</h3>
          {addableFriends.length === 0 ? (
            <p className="italic text-gray-500">No friends left to invite.</p>
          ) : (
            <div className="flex gap-2">
              <select
                className="select select-bordered flex-1"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">Select Friend</option>
                {addableFriends.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.fullName}
                  </option>
                ))}
              </select>
              <button
                onClick={async () => {
                  try {
                    await sendGroupInvite({ groupId, userId: selectedId });
                    toast.success("Invite sent!");
                    setSelectedId("");
                  } catch (err) {
                    toast.error(
                      err?.response?.data?.message || "Failed to send invite"
                    );
                  }
                }}
                disabled={!selectedId}
                className="btn btn-primary"
              >
                Send Invite
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
