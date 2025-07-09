import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { getUserFriends, createGroup, sendGroupInvite, uploadImage } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast"; // ✅ import toast
import { CameraIcon } from "lucide-react";

const CreateGroupPage = () => {
  const { authUser } = useAuthUser();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: !!authUser,
  });

  const {
    mutate: createGroupMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: createGroup,
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });

      // ✅ Invite selected friends after group creation
      if (selectedIds.length) {
        try {
          await Promise.all(
            selectedIds.map((id) =>
              sendGroupInvite({ groupId: data._id, userId: id })
            )
          );
          toast.success("Invites sent successfully"); // ✅ toast on success
        } catch (err) {
          toast.error("Some invites failed", err); // ✅ toast on failure
        }
      }

      navigate(`/groups/${data._id}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createGroupMutation({
      name,
      image,
      memberIds: [], // creator only initially
      createdById: authUser._id,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const { url } = await uploadImage(formData);
      setImage(url);
      toast.success("Group image uploaded!");
    } catch (err) {
      toast.error("Failed to upload image");
    }
  };

  const toggleSelect = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Group</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input input-bordered w-full"
          type="text"
          placeholder="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="flex items-center gap-2">
          <input
            className="input input-bordered flex-1"
            type="text"
            placeholder="Image URL (optional)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
          <label className="btn btn-secondary" htmlFor="groupImageInput">
            <CameraIcon className="size-4" />
          </label>
          <input
            id="groupImageInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        <div>
          <label className="font-medium mb-2 block">Invite Friends</label>
          {isLoading ? (
            <p>Loading friends...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {friends
                .filter((u) => u._id !== authUser._id)
                .map((user) => (
                  <div
                    key={user._id}
                    className={`p-2 border rounded flex items-center gap-2 cursor-pointer ${
                      selectedIds.includes(user._id)
                        ? "bg-primary text-white"
                        : ""
                    }`}
                    onClick={() => toggleSelect(user._id)}
                  >
                    <img
                      src={user.profilePic}
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{user.fullName}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        <button className="btn btn-primary" type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Group"}
        </button>
        {error && <p className="text-red-500">{error.message}</p>}
      </form>
    </div>
  );
};

export default CreateGroupPage;
