import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

export const submissionRateLimit = rateLimit({
  windowMs: env.SUBMISSION_RATE_LIMIT_WINDOW_MS,
  max: env.SUBMISSION_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many submissions from this source. Please try again later.",
  },
});

export const generalApiLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Rate limit exceeded.",
  },
});
