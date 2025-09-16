import { Request, Response } from 'express';
import Resource, { IResource } from '../models/resource.model';

// Create a new resource
export const createResource = async (req: Request, res: Response) => {
  try {
    const resourceData: IResource = req.body;
    const newResource = new Resource(resourceData);
    const savedResource = await newResource.save();
    res.status(201).json({ success: true, data: savedResource });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Resource with this village, district, and state already exists'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

import { getRecommendedSchemes } from '../utils/schemeRecommender';

// Get all resources with optional filtering
export const getResources = async (req: Request, res: Response) => {
  try {
    const { state, district } = req.query;
    const filter: any = {};
    
    if (state) filter.state = state;
    if (district) filter.district = district;
    
    let resources = await Resource.find(filter).sort({ state: 1, district: 1, village: 1 });
    
    // Add recommended schemes to each resource
    const resourcesWithSchemes = resources.map(resource => ({
      ...resource.toObject(),
      recommendedSchemes: getRecommendedSchemes(resource.toObject())
    }));
    
    res.status(200).json({ 
      success: true, 
      count: resourcesWithSchemes.length, 
      data: resourcesWithSchemes 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single resource by ID
export const getResourceById = async (req: Request, res: Response) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    
    const resourceWithSchemes = {
      ...resource.toObject(),
      recommendedSchemes: getRecommendedSchemes(resource.toObject())
    };
    
    res.status(200).json({ success: true, data: resourceWithSchemes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a resource
export const updateResource = async (req: Request, res: Response) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['population', 'stPercentage', 'infrastructureStatus', 'waterAvailability', 
                          'foodAvailability', 'povertyRatio', 'literacyRate', 'employmentRatio'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ success: false, message: 'Invalid updates!' });
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    res.status(200).json({ success: true, data: resource });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a resource
export const deleteResource = async (req: Request, res: Response) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get statistics by state or district
export const getStatistics = async (req: Request, res: Response) => {
  try {
    const { state, district } = req.query;
    const match: any = {};
    
    if (state) match.state = state;
    if (district) match.district = district;
    
    const stats = await Resource.aggregate([
      { $match: match },
      {
        $group: {
          _id: district ? '$village' : state ? '$district' : '$state',
          totalPopulation: { $sum: '$population' },
          avgSTPercentage: { $avg: '$stPercentage' },
          avgInfrastructure: { $avg: '$infrastructureStatus' },
          avgPovertyRatio: { $avg: '$povertyRatio' },
          avgLiteracyRate: { $avg: '$literacyRate' },
          avgEmploymentRatio: { $avg: '$employmentRatio' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
