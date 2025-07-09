import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeEditProfile, uploadImage } from "../lib/api";
import {
  LoaderIcon,
  MapPinIcon,
  ShipWheelIcon,
  ShuffleIcon,
  CameraIcon,
} from "lucide-react";
import { LANGUAGES } from "../constants";
import { useNavigate } from "react-router";

const EditProfile = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    email: authUser?.email || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const { mutate: updateProfileMutation, isPending } = useMutation({
    mutationFn: completeEditProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formState.newPassword &&
      formState.newPassword !== formState.confirmNewPassword
    ) {
      toast.error("New passwords do not match");
      return;
    }
    updateProfileMutation(formState);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const { url } = await uploadImage(formData);
      setFormState((prev) => ({ ...prev, profilePic: url }));
      toast.success("Profile picture uploaded!");
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRandomAvatar = async () => {
    setGenerating(true);
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://robohash.org/${idx}.png`;
    await new Promise((res) => setTimeout(res, 300)); // optional delay
    setFormState((prev) => ({ ...prev, profilePic: randomAvatar }));
    toast.success("Random profile picture generated!");
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-start justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl mt-10">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">
            Edit Profile
          </h1>
          <p className="text-center text-sm text-base-content opacity-70 mb-6">
            Edit the fields you want to change
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                {formState.profilePic ? (
                  <img
                    src={formState.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-center">
                <label
                  className={`btn btn-secondary ${uploading ? "btn-disabled" : ""}`}
                  htmlFor="profilePicInput"
                >
                  {uploading ? (
                    <>
                      <LoaderIcon className="animate-spin size-4 mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CameraIcon className="size-4 mr-2" />
                      Upload
                    </>
                  )}
                </label>
                <input
                  id="profilePicInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="btn btn-accent"
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <LoaderIcon className="animate-spin size-4 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ShuffleIcon className="size-4 mr-2" />
                      Generate Random Avatar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                value={formState.fullName}
                onChange={(e) =>
                  setFormState({ ...formState, fullName: e.target.value })
                }
                className="input input-bordered w-full"
              />
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                value={formState.email}
                onChange={(e) =>
                  setFormState({ ...formState, email: e.target.value })
                }
                className="input input-bordered w-full"
              />
            </div>

            {/* Bio */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                value={formState.bio}
                onChange={(e) =>
                  setFormState({ ...formState, bio: e.target.value })
                }
                className="textarea textarea-bordered h-24"
              />
            </div>

            {/* Language Selects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language</span>
                </label>
                <select
                  value={formState.nativeLanguage}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      nativeLanguage: e.target.value,
                    })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language</span>
                </label>
                <select
                  value={formState.learningLanguage}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      learningLanguage: e.target.value,
                    })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 opacity-70" />
                <input
                  type="text"
                  value={formState.location}
                  onChange={(e) =>
                    setFormState({ ...formState, location: e.target.value })
                  }
                  className="input input-bordered w-full pl-10"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* Password */}
            <h2 className="text-lg font-semibold mt-4">Edit Password</h2>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Old Password</span>
              </label>
              <input
                type="password"
                value={formState.oldPassword}
                onChange={(e) =>
                  setFormState({ ...formState, oldPassword: e.target.value })
                }
                className="input input-bordered"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">New Password</span>
              </label>
              <input
                type="password"
                value={formState.newPassword}
                onChange={(e) =>
                  setFormState({ ...formState, newPassword: e.target.value })
                }
                className="input input-bordered"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm New Password</span>
              </label>
              <input
                type="password"
                value={formState.confirmNewPassword}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    confirmNewPassword: e.target.value,
                  })
                }
                className="input input-bordered"
              />
            </div>

            {/* Submit Button */}
            <button
              className="btn btn-primary w-full"
              disabled={isPending}
              type="submit"
            >
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Saving...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
