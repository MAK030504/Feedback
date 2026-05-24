import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const authenticateAdmin = (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Missing admin token" });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    request.admin = payload;
    return next();
  } catch {
    return response.status(401).json({ message: "Invalid or expired token" });
  }
};
