import multer from "multer";
import path from "path";

// Faqat RAMda saqlash, keyin controller-da siqib diskga yozish uchun
const memoryStorage = multer.memoryStorage();

function checkFile(file, cb) {
  const allowedTypes = /jpeg|jpg|png|gif|svg|avif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Error: You can only upload image files"));
  }
}

export const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    checkFile(file, cb);
  },
});
