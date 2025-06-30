import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, fetchGroupById } from "../lib/api";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import "stream-chat-react/dist/css/v2/index.css";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const GroupChatPage = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => fetchGroupById(groupId),
    enabled: !!groupId,
  });

  const isMember = group?.members?.some((m) => m._id === authUser._id);

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !group?.streamChannelId) return;
      if (!isMember) {
        toast.error("You are not a member of this group.");
        navigate("/groups");
        return;
      }

      setLoading(true);
      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const currChannel = client.channel("messaging", group.streamChannelId);
        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (err) {
        console.error("Chat load error:", err);
        toast.error("Chat loading failed");
      } finally {
        setLoading(false);
      }
    };

    if (group && tokenData?.token) {
      initChat();
    }
  }, [group, tokenData, authUser, isMember, navigate]);

  const handleVideoCall = () => {
    if (channel) {
      channel.sendMessage({
        text: `I've started a video call — join: ${window.location.origin}/call/${channel.id}`,
      });
      toast.success("Call link sent");
    }
  };

  if (loading || !chatClient || !channel || groupLoading) return <ChatLoader />;

  return (
    <div>
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader title={group.name} />
              <MessageList />
              <MessageInput focus keepOpenAfterSend />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default GroupChatPage;
