import multer from "multer";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const storage = multer.memoryStorage();

const fileFilter = (_request, file, callback) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(new Error("Unsupported file type. Allowed: JPG, PNG, WEBP, PDF."));
    return;
  }

  callback(null, true);
};

export const uploadAttachment = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
