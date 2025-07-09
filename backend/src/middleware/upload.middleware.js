import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the uploads directory exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Use disk storage in a temporary directory; Cloudinary will host final image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // temporary folder, ensure exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

export const uploadSingleImage = multer({ storage, fileFilter }).single("image");