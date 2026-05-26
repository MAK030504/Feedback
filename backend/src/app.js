import cors from "cors";
import express from "express";
import helmet from "helmet";
import publicRoutes from "./routes/public.routes.js";
import adminAuthRoutes from "./routes/admin-auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { env } from "./config/env.js";
import { generalApiLimit } from "./middleware/rate-limit.js";
import { notFound } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";

export const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(generalApiLimit);

app.get("/", (_request, response) => {
  response.json({
    service: "MLSA Anonymous Feedback API",
    status: "ok",
    health: "/health",
    publicApi: "/api/public",
    note: "Use the Vercel frontend for the web UI — this host is API-only.",
  });
});

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/public", publicRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);
