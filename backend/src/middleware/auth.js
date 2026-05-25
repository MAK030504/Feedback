import { verifyAdminToken } from "../utils/jwt.js";

export const authenticateAdmin = (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Missing admin token" });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    request.admin = verifyAdminToken(token);
    return next();
  } catch {
    return response.status(401).json({ message: "Invalid or expired token" });
  }
};
