import { Request, Response } from 'express';
import { Patta, IPatta } from '../models/patta.model';
import mongoose from 'mongoose';
import { getRecommendedSchemes, createIndividualProfile } from '../utils/individualSchemeRecommender';

// Create a new patta
export const createPatta = async (req: Request, res: Response) => {
  try {
    // Add createdBy from authenticated user (you'll need to implement authentication)
    const pattaData = {
      ...req.body,
      createdBy: new mongoose.Types.ObjectId('000000000000000000000000') // Replace with actual user ID from auth
    };

    const patta = new Patta(pattaData);
    await patta.save();
    
    res.status(201).json({
      success: true,
      data: patta
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      // Handle validation errors
      const errors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate patta number',
        field: 'pattaNumber'
      });
    }
    
    console.error('Error creating patta:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all pattas with optional filtering
export const getPattas = async (req: Request, res: Response) => {
  try {
    const { state, district, status, search } = req.query;
    
    // Build query
    const query: any = {};
    
    if (state) query['location.state'] = state;
    if (district) query['location.district'] = district;
    if (status) query.status = status;
    
    // Text search
    if (search) {
      query.$text = { $search: search as string };
    }
    
    const pattas = await Patta.find(query)
      .sort({ 'holder.name': 1 })
      .lean();
    
    res.json({
      success: true,
      count: pattas.length,
      data: pattas
    });
  } catch (error) {
    console.error('Error fetching pattas:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get pattas by state
export const getPattasByState = async (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    
    if (!state) {
      return res.status(400).json({
        success: false,
        message: 'State parameter is required'
      });
    }
    
    const pattas = await Patta.find({ 'location.state': state })
      .sort({ 'holder.name': 1 })
      .select('pattaNumber holder.name holder.fatherName holder.tribe location.village location.district location.coordinates location.area status')
      .lean();
    
    res.json({
      success: true,
      count: pattas.length,
      data: pattas
    });
  } catch (error) {
    console.error('Error fetching pattas by state:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get pattas by state with scheme recommendations
export const getPattasByStateWithRecommendations = async (req: Request, res: Response) => {
  try {
    const { state } = req.params;
    const { includeRecommendations = 'true' } = req.query;
    
    if (!state) {
      return res.status(400).json({
        success: false,
        message: 'State parameter is required'
      });
    }
    
    // Fetch pattas for the state
    const pattas = await Patta.find({ 'location.state': state })
      .sort({ 'holder.name': 1 })
      .select('pattaNumber holder location area rights')
      .lean();
    
    // Only generate recommendations if explicitly requested
    let pattasWithRecommendations = [];
    
    if (includeRecommendations === 'true') {
      // Process each patta to get recommendations
      pattasWithRecommendations = pattas.map(patta => {
        // Create individual profile from patta data
        const profile = createIndividualProfile(patta, {});
        
        // Get recommended schemes for this patta
        const recommendedSchemes = getRecommendedSchemes(profile, 3); // Get top 3 recommendations
        
        return {
          ...patta,
          recommendedSchemes: recommendedSchemes.map(scheme => ({
            id: scheme.id,
            name: scheme.name,
            ministry: scheme.ministry,
            description: scheme.description,
            benefits: scheme.benefits,
            requiredDocuments: scheme.requiredDocuments
          }))
        };
      });
    } else {
      // If recommendations not requested, just return the pattas as-is
      pattasWithRecommendations = pattas;
    }
    
    res.json({
      success: true,
      count: pattasWithRecommendations.length,
      data: pattasWithRecommendations
    });
  } catch (error) {
    console.error('Error fetching pattas by state with recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// Get a single patta by ID
export const getPattaById = async (req: Request, res: Response) => {
  try {
    const patta = await Patta.findById(req.params.id).lean();
    
    if (!patta) {
      return res.status(404).json({
        success: false,
        message: 'Patta not found'
      });
    }
    
    res.json({
      success: true,
      data: patta
    });
  } catch (error) {
    console.error('Error fetching patta:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update a patta
export const updatePatta = async (req: Request, res: Response) => {
  try {
    // Add lastUpdatedBy from authenticated user
    const updateData = {
      ...req.body,
      lastUpdatedBy: new mongoose.Types.ObjectId('000000000000000000000000') // Replace with actual user ID from auth
    };
    
    const patta = await Patta.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!patta) {
      return res.status(404).json({
        success: false,
        message: 'Patta not found'
      });
    }
    
    res.json({
      success: true,
      data: patta
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      // Handle validation errors
      const errors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
    
    console.error('Error updating patta:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a patta
export const deletePatta = async (req: Request, res: Response) => {
  try {
    const patta = await Patta.findByIdAndDelete(req.params.id);
    
    if (!patta) {
      return res.status(404).json({
        success: false,
        message: 'Patta not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Patta deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting patta:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Search pattas by location (within a radius)
export const searchPattasByLocation = async (req: Request, res: Response) => {
  try {
    const { longitude, latitude, radius = 10000 } = req.query; // radius in meters
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }
    
    const pattas = await Patta.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [
              parseFloat(longitude as string),
              parseFloat(latitude as string)
            ]
          },
          $maxDistance: parseInt(radius as string, 10)
        }
      }
    }).lean();
    
    res.json({
      success: true,
      count: pattas.length,
      data: pattas
    });
  } catch (error) {
    console.error('Error searching pattas by location:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
