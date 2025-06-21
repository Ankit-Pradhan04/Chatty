import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import useAuthUser from "./useAuthUser";

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

const useUnreadCounts = (friends) => {
  const [unreadMap, setUnreadMap] = useState({});
  const [streamClient, setStreamClient] = useState(null);

  const { authUser } = useAuthUser();

  const { data: tokenData, isSuccess: tokenReady } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // ✅ Initialize client only after token + user available
  useEffect(() => {
    const initClient = async () => {
      if (!authUser || !tokenData?.token) return;

      const client = StreamChat.getInstance(apiKey);

      if (!client.userID) {
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );
      }

      setStreamClient(client);
    };

    initClient();
  }, [authUser, tokenReady]);

  // ✅ Watch unread counts only when streamClient + friends are ready
  useEffect(() => {
    if (
      !streamClient ||
      !authUser ||
      !Array.isArray(friends) ||
      friends.length === 0
    )
      return;

    let isMounted = true;
    const listeners = [];

    const setupUnreadCounts = async () => {
      const counts = {};

      for (const friend of friends) {
        try {
          const channelId = [authUser._id, friend._id].sort().join("-");
          const channel = streamClient.channel("messaging", channelId, {
            members: [authUser._id, friend._id],
          });

          await channel.watch();

          // Initial unread count
          counts[friend._id] = channel.countUnread();

          // Real-time updates
          const updateUnread = () => {
            const newCount = channel.countUnread();
            setUnreadMap((prev) => ({ ...prev, [friend._id]: newCount }));
          };

          channel.on("message.new", updateUnread);
          listeners.push({ channel, updateUnread });
        } catch (err) {
          console.error("Error setting up unread for", friend._id, err);
          counts[friend._id] = 0;
        }
      }

      if (isMounted) {
        setUnreadMap(counts);
      }
    };

    setupUnreadCounts();

    return () => {
      isMounted = false;
      listeners.forEach(({ channel, updateUnread }) => {
        channel.off("message.new", updateUnread);
      });
    };
  }, [streamClient, authUser, friends]);

  return unreadMap;
};

export default useUnreadCounts;
