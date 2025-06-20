// src/hooks/useNotificationCount.js
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";

const useNotificationCount = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const incoming = data?.incomingReqs?.length || 0;
  const accepted = data?.acceptedReqs?.length || 0;

  return {
    totalNotifications: incoming + accepted,
    isLoading,
  };
};

export default useNotificationCount;
