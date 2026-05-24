import { createServer } from "node:http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./prisma/client.js";
import { ensureAdminSeeded } from "./services/admin-bootstrap.service.js";
import { setIo } from "./services/socket.service.js";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN,
  },
});

io.on("connection", (socket) => {
  socket.on("admin:subscribe", () => {
    socket.join("admins");
  });
});

setIo(io);

const start = async () => {
  try {
    await prisma.$connect();
    await ensureAdminSeeded();

    httpServer.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`MLSA backend running on port ${env.PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start backend", error);
    process.exit(1);
  }
};

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();
