import cloudinary from "../lib/cloudinary.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload file to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "langlink", // change folder as desired
    });

    return res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ message: "Image upload failed" });
  }
};