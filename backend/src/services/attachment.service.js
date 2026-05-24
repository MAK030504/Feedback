import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";

const toDataUri = (mimetype, buffer) => `data:${mimetype};base64,${buffer.toString("base64")}`;

export const uploadAttachment = async (fileBuffer, mimetype) => {
  if (!isCloudinaryConfigured) {
    throw new Error("Attachment uploads are unavailable. Cloudinary is not configured.");
  }

  const dataUri = toDataUri(mimetype, fileBuffer);
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "mlsa-feedback",
    resource_type: "auto",
  });

  return result.secure_url;
};
