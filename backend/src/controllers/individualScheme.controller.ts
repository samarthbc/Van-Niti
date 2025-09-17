import { Request, Response } from 'express';
import { getRecommendedSchemes, schemes, createIndividualProfile } from '../utils/individualSchemeRecommender';

export const getSchemeRecommendations = async (req: Request, res: Response) => {
  try {
    // Get form data from request body
    const formData = req.body;
    
    // Create profile from form data
    const profile = createIndividualProfile(formData, {});
    
    // Get recommended schemes
    const recommendedSchemes = getRecommendedSchemes(profile);
    
    res.status(200).json({
      success: true,
      data: {
        profile,
        recommendedSchemes
      }
    });
  } catch (error) {
    console.error('Error getting scheme recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scheme recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAllSchemes = async (req: Request, res: Response) => {
  try {
    // Import schemes directly from the recommender
    const { schemes } = await import('../utils/individualSchemeRecommender');
    
    res.status(200).json({
      success: true,
      data: schemes
    });
  } catch (error) {
    console.error('Error getting all schemes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get all schemes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getSchemeDetails = async (req: Request, res: Response) => {
  try {
    const { schemeId } = req.params;
    // Import schemes directly from the recommender
    const { schemes } = await import('../utils/individualSchemeRecommender');
    
    const scheme = schemes.find(s => s.id === schemeId);
    
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: scheme
    });
  } catch (error) {
    console.error('Error getting scheme details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scheme details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
