import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { fetchGroups } from "../lib/api.js";
import useAuthUser from "../hooks/useAuthUser.js";
import useGroupUnreadCounts from "../hooks/useGroupUnreadCounts.js";
import NoGroupsFound from "../components/NoGroupsFound.jsx";

export default function GroupsPage() {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();

  const {
    data: groups = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["groups", authUser?._id],
    queryFn: fetchGroups,
    enabled: !!authUser,
    select: (data) => (Array.isArray(data) ? data : []),
  });

  const unreadGroupCounts = useGroupUnreadCounts(groups);

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold">Your Groups</h1>
          <p className="text-gray-600 mt-1">
            Join groups to grow together and stay connected with your people.
          </p>
        </div>
        <Link to="/groups/new" className="btn btn-primary btn-sm mt-1 md:mt-0">
          + New Group
        </Link>
      </div>

      {isLoading && <p>Loading groups...</p>}
      {isError && <p className="text-red-500">Failed to load groups.</p>}

      {groups.length === 0 ? (
        <NoGroupsFound />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => {
            const unread = unreadGroupCounts[g._id] || 0;

            return (
              <div
                key={g._id}
                className="relative rounded-xl shadow-md border p-4 flex justify-between items-center hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3">
                  {g.image && (
                    <img
                      src={g.image}
                      alt={g.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-lg">{g.name}</div>
                    <div className="text-sm text-gray-500">
                      {g.members?.length || 0} members
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/groups/${g._id}`}
                    className="btn btn-sm btn-outline"
                  >
                    Open
                  </Link>
                  <button
                    onClick={() => navigate(`/groups/${g._id}/info`)}
                    className="btn btn-sm btn-outline"
                  >
                    Info
                  </button>
                </div>

                {/* Badge for unread messages */}
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
