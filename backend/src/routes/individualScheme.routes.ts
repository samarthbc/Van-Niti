import express from 'express';
import { 
  getSchemeRecommendations, 
  getAllSchemes, 
  getSchemeDetails 
} from '../controllers/individualScheme.controller';

const router = express.Router();

// Get scheme recommendations based on user profile
router.post('/recommend', getSchemeRecommendations);

// Get all available schemes
router.get('/schemes', getAllSchemes);

// Get details of a specific scheme
router.get('/schemes/:schemeId', getSchemeDetails);

export default router;
