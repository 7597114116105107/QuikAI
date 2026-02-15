import multer from "multer";
import path from "path";
import fs from "fs";

// Vercel serverless has read-only/ephemeral filesystem - must use memory storage
const isVercel = typeof process.env.VERCEL !== "undefined";

const storage = isVercel
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix =
          Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    });

export const upload = multer({ storage });
