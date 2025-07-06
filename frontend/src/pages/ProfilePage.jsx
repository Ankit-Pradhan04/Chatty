import { Link } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { capitialize } from "../lib/utils";

const ProfilePage = () => {
  const { authUser } = useAuthUser();

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto">
      <div className="bg-base-200 rounded-xl shadow-md p-6 sm:p-10 space-y-8">
        {/* Top Section: Avatar + Name + Button */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          {/* Avatar and Name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 flex-1">
            <div className="avatar">
              <div className="w-24 sm:w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={authUser?.profilePic} alt="User Avatar" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold">
                {authUser?.fullName}
              </h2>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="flex-shrink-0">
            <Link
              to="/editProfile"
              className="btn btn-primary w-full sm:w-auto"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-base font-medium break-all">
              {authUser?.email || "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="text-base font-medium">
              {authUser?.username || authUser?.fullName}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Bio</p>
            <p className="text-base font-medium">{authUser?.bio || "—"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="text-base font-medium">{authUser?.location || "—"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Native Language</p>
            <p className="text-base font-medium">
              {capitialize(authUser?.nativeLanguage || "—")}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Learning Language</p>
            <p className="text-base font-medium">
              {capitialize(authUser?.learningLanguage || "—")}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="text-base font-medium">
              {authUser?.createdAt
                ? new Date(authUser.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
