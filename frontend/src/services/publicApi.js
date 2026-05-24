import { publicApi } from "./api";

export const submitFeedback = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      formData.append(key, value);
    }
  });

  const { data } = await publicApi.post("/feedback", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.data;
};

export const trackTicket = async (ticketId, token) => {
  const { data } = await publicApi.get(`/track/${ticketId}`, {
    params: { token },
  });

  return data.data;
};

export const addTicketMessage = async (ticketId, token, message) => {
  const { data } = await publicApi.post(`/track/${ticketId}/messages`, { token, message });
  return data.data;
};

export const fetchPublicSuggestions = async () => {
  const { data } = await publicApi.get("/suggestions");
  return data.data;
};

export const upvoteSuggestion = async (id) => {
  const { data } = await publicApi.post(`/suggestions/${id}/upvote`);
  return data;
};

export const commentOnSuggestion = async (id, message) => {
  const { data } = await publicApi.post(`/suggestions/${id}/comments`, { message });
  return data.data;
};
