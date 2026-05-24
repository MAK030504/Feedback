const aliasPrefixes = ["Anonymous Member", "MLSA User", "Anonymous Voice", "Feedback Ally"];

export const buildTicketId = (id, date = new Date()) => {
  const year = date.getUTCFullYear();
  return `MLSA-${year}-${String(id).padStart(4, "0")}`;
};

export const buildAnonymousAlias = (id) => {
  const prefix = aliasPrefixes[id % aliasPrefixes.length];
  const suffix = String((id * 37) % 997).padStart(3, "0");
  return `${prefix} ${suffix}`;
};
