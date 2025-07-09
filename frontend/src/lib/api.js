import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export const completeEditProfile = async (userData) => {
  const response = await axiosInstance.post("/auth/editProfile", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(
    `/users/friend-request/${requestId}/accept`
  );
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

export const fetchGroups = async () => {
  const response = await axiosInstance.get("/groups");
  // console.log("Fetched groups data:", response.data);
  return response.data;
}

export const fetchGroupById = async (id) => {
  const response = await axiosInstance.get(`/groups/${id}`);
  return response.data;
}

export const createGroup = async (payload) => {
  const response = await axiosInstance.post("/groups", payload);
  return response.data;
}

export const updateGroupMembers = async ({ groupId, userId, action, makeAdmin }) => {
  const response = await axiosInstance.patch(`/groups/${groupId}/members`, {
    userId,
    action,
    makeAdmin,
  });
  return response.data;
}

export const updateGroupDetails = async ({ groupId, name, image }) => {
  const response = await axiosInstance.patch(`/groups/${groupId}`, { name, image });
  return response.data;
}

export const sendGroupInvite = async ({ groupId, userId }) => {
  const res = await axiosInstance.post(`/groups/${groupId}/invite`, { userId });
  return res.data;
}

export const getGroupInvites = async () => {
  const res = await axiosInstance.get("/groups/invites");
  return res.data;
};

export const respondGroupInvite = async ({ inviteId, action }) => {
  // console.log("jello")
  const res = await axiosInstance.patch(`/groups/invites/respond/${inviteId}`, { action });
  return res.data;
};



