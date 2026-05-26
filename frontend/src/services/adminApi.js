import { adminApi } from "./api";

export const loginAdmin = async (username, password) => {
  const { data } = await adminApi.post("/auth/login", { username, password });
  return data;
};

const cleanQueryParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null),
  );

export const fetchAdminFeedback = async (params) => {
  const { data } = await adminApi.get("/feedback", { params: cleanQueryParams(params) });
  return data.data;
};

export const fetchAdminFeedbackDetail = async (id) => {
  const { data } = await adminApi.get(`/feedback/${id}`);
  return data.data;
};

export const updateAdminFeedback = async (id, payload) => {
  const { data } = await adminApi.patch(`/feedback/${id}`, payload);
  return data.data;
};

export const replyAdminFeedback = async (id, message) => {
  const { data } = await adminApi.post(`/feedback/${id}/messages`, { message });
  return data.data;
};

export const fetchAnalytics = async () => {
  const { data } = await adminApi.get("/analytics");
  return data.data;
};

export const exportCsv = async () => {
  const response = await adminApi.get("/export/csv", {
    responseType: "blob",
  });

  return response.data;
};
