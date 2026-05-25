export const errorHandler = (error, _request, response, _next) => {
  if (error?.name === "ZodError") {
    return response.status(400).json({
      message: "Invalid request payload",
      errors: error.flatten?.() ?? undefined,
    });
  }

  if (error?.code === "LIMIT_FILE_SIZE" || error?.message?.startsWith("Unsupported file type")) {
    return response.status(400).json({
      message: error.message,
    });
  }

  const status = error.statusCode ?? 500;
  const message = error.message ?? "Internal server error";

  return response.status(status).json({
    message,
    ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {}),
  });
};
