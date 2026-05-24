export const validate = (schema, target = "body") => (request, response, next) => {
  const parsed = schema.safeParse(request[target]);

  if (!parsed.success) {
    return response.status(400).json({
      message: "Invalid request payload",
      errors: parsed.error.flatten(),
    });
  }

  request[target] = parsed.data;
  return next();
};
