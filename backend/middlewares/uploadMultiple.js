import multer from 'multer';
import { uploadMultipleToCloudinary } from '../utils/cloudinary.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ok = file.mimetype?.startsWith('image/');
  cb(ok ? null : new Error('Only image files are allowed'), ok);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 6 * 1024 * 1024 },
});

export const uploadMultipleImages = async (req, res, next) => {
  try {
    const files = req.files || [];
    const uploaded = await uploadMultipleToCloudinary(files);
    req.uploadedImages = uploaded;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Image upload failed' });
  }
};
