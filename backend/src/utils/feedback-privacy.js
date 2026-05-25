export const stripSensitiveFeedbackFields = (feedback) => {
  const { id: _id, secretToken: _secretToken, ...publicFeedback } = feedback;
  return publicFeedback;
};

export const isVisibleOnTicketThread = (message) =>
  message.sender === "admin" || (message.sender === "user" && !message.isPublicComment);
