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

const multerUpload = multer({ storage, fileFilter }).single("image");

// Wrap multer middleware to delete local file after request is finished
export const uploadSingleImage = (req, res, next) => {
  multerUpload(req, res, function (err) {
    if (err) return next(err);

    // Hook into response finishing to delete file after everything is done
    res.on("finish", () => {
      if (req.file?.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting temp file:", err.message);
        });
      }
    });

    next();
  });
};
