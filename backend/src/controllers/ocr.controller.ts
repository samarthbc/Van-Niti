import { Request, Response } from 'express';
import axios from 'axios';

export const processImageWithOCR = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageBuffer = req.file.buffer;
    const imageB64 = imageBuffer.toString('base64');

    if (imageB64.length > 180_000) {
      return res.status(400).json({ error: 'Image size too large. Maximum size is approximately 180KB when base64 encoded.' });
    }

    const invokeUrl = "https://ai.api.nvidia.com/v1/cv/nvidia/nemoretriever-ocr-v1";
    const headers = {
      "Authorization": "Bearer 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",
      "Accept": "application/json",
      "Content-Type": "application/json"
    };

    const payload = {
      "input": [
        {
          "type": "image_url",
          "url": `data:${req.file.mimetype};base64,${imageB64}`
        }
      ]
    };

    const response = await axios.post(invokeUrl, payload, { headers });
    res.json(response.data);
  } catch (error: any) {
    console.error('OCR Processing Error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to process image with OCR';
    res.status(500).json({ 
      error: 'OCR processing failed',
      details: errorMessage 
    });
  }
};
