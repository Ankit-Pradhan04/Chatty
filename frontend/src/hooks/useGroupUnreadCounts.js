import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import useAuthUser from "./useAuthUser";

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

const useGroupUnreadCounts = (groups) => {
  const [unreadMap, setUnreadMap] = useState({});
  const [streamClient, setStreamClient] = useState(null);
  const { authUser } = useAuthUser();

  const { data: tokenData, isSuccess: tokenReady } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // Initialize Stream client
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

  // Set up watchers and real-time updates
  useEffect(() => {
    if (
      !streamClient ||
      !authUser ||
      !Array.isArray(groups) ||
      groups.length === 0
    )
      return;

    let isMounted = true;
    const listeners = [];

    const setupGroupUnreadCounts = async () => {
      const counts = {};

      for (const group of groups) {
        const channelId = group.streamChannelId;
        if (!channelId) continue;

        try {
          const channel = streamClient.channel("messaging", channelId);

          await channel.watch();

          // Initial unread count
          counts[group._id] = channel.countUnread();

          // Real-time update on message
          const updateUnread = () => {
            const newCount = channel.countUnread();
            setUnreadMap((prev) => ({ ...prev, [group._id]: newCount }));
          };

          channel.on("message.new", updateUnread);
          listeners.push({ channel, updateUnread });
        } catch (err) {
          console.error("Error setting up group unread for", group._id, err);
          counts[group._id] = 0;
        }
      }

      if (isMounted) {
        setUnreadMap(counts);
      }
    };

    setupGroupUnreadCounts();

    return () => {
      isMounted = false;
      listeners.forEach(({ channel, updateUnread }) => {
        channel.off("message.new", updateUnread);
      });
    };
  }, [streamClient, authUser, groups]);

  return unreadMap;
};

export default useGroupUnreadCounts;
