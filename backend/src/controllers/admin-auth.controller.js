import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client.js";
import { env } from "../config/env.js";

export const adminLogin = async (request, response, next) => {
  try {
    const { username, password } = request.body;

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return response.status(401).json({ message: "Invalid username or password" });
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isValid) {
      return response.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ adminId: admin.id, username: admin.username }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    return response.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    return next(error);
  }
};
