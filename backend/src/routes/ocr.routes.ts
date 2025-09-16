import { Router, Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import * as ocrController from '../controllers/ocr.controller';

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const error = new Error('Only image files are allowed');
      cb(error);
    }
  },
});

/**
 * @route   POST /api/ocr/process
 * @desc    Process an image with NVIDIA Nemo Retriever OCR
 * @access  Public (Consider adding authentication)
 */
router.post('/process', upload.single('image'), ocrController.processImageWithOCR);

export default router;
