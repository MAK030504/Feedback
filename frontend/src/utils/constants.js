export const FEEDBACK_TYPES = [
  { value: "complaint", label: "Complaint" },
  { value: "suggestion", label: "Suggestion" },
  { value: "feedback", label: "Event Feedback" },
];

export const FEEDBACK_CATEGORIES = [
  { value: "event_management", label: "Event Management" },
  { value: "team_coordination", label: "Team Coordination" },
  { value: "leadership_issue", label: "Leadership Issue" },
  { value: "technical_workshop", label: "Technical Workshop" },
  { value: "communication", label: "Communication" },
  { value: "other", label: "Other" },
];

export const FEEDBACK_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

export const FEEDBACK_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const formatEnum = (value) =>
  value
    ?.split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") ?? "-";
