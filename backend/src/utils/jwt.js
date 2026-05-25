import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const verifyAdminToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("Missing admin token");
  }

  return jwt.verify(token.trim(), env.JWT_SECRET);
};
