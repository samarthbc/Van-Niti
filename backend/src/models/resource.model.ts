import mongoose, { Document, Schema } from 'mongoose';

// GeoJSON Point coordinates
export type Coordinates = [number, number]; // [longitude, latitude]

export interface IResource extends Document {
  // Basic Information
  village: string;
  district: string;
  state: string;
  population: number;
  location: {
    type: string;
    coordinates: Coordinates;
  };
  
  // Demographics
  stPercentage: number;
  children0to6?: number;  // For ICDS/Poshan Abhiyaan
  womenPopulation?: number; // For NRLM
  
  // Infrastructure & Services
  infrastructureStatus: number; // 0-10 scale
  roadConnectivity?: 'None' | 'Kaccha' | 'Pacca' | 'Highway';
  distanceToPHC?: number; // In km
  distanceToSchool?: number; // In km
  electrificationStatus?: 'Not Electrified' | 'Partial' | 'Fully Electrified';
  
  // Resources
  waterAvailability: 'Low' | 'Medium' | 'High';
  foodAvailability: 'Low' | 'Medium' | 'High';
  forestCoverPercentage?: number; // For Van Dhan Yojana
  bambooCoverage?: 'None' | 'Low' | 'Medium' | 'High';
  
  // Socio-economic Indicators
  povertyRatio: number; // Percentage
  literacyRate: number; // Percentage
  employmentRatio: number; // Percentage
  housingType?: { kutcha: number; semiPacca: number; pacca: number }; // For PMAY-G
  
  // Education
  schoolDropoutRate?: number; // Percentage
  
  // Health
  malnutritionRate?: number; // Percentage
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IResource>(
  {
    // Basic Information
    village: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    population: { type: Number, required: true, min: 0 },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function(v: number[]) {
            return v.length === 2 && 
                   v[0] >= -180 && v[0] <= 180 && 
                   v[1] >= -90 && v[1] <= 90;
          },
          message: 'Coordinates must be in [longitude, latitude] format with valid ranges.'
        }
      }
    },
    
    // Demographics
    stPercentage: { type: Number, required: true, min: 0, max: 100 },
    children0to6: { type: Number, min: 0 },
    womenPopulation: { type: Number, min: 0 },
    
    // Infrastructure & Services
    infrastructureStatus: { type: Number, required: true, min: 0, max: 10 },
    roadConnectivity: { type: String, enum: ['None', 'Kaccha', 'Pacca', 'Highway'] },
    distanceToPHC: { type: Number, min: 0 },
    distanceToSchool: { type: Number, min: 0 },
    electrificationStatus: { type: String, enum: ['Not Electrified', 'Partial', 'Fully Electrified'] },
    
    // Resources
    waterAvailability: { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
    foodAvailability: { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
    forestCoverPercentage: { type: Number, min: 0, max: 100 },
    bambooCoverage: { type: String, enum: ['None', 'Low', 'Medium', 'High'] },
    
    // Socio-economic Indicators
    povertyRatio: { type: Number, required: true, min: 0, max: 100 },
    literacyRate: { type: Number, required: true, min: 0, max: 100 },
    employmentRatio: { type: Number, required: true, min: 0, max: 100 },
    housingType: {
      kutcha: { type: Number, min: 0, default: 0 },
      semiPacca: { type: Number, min: 0, default: 0 },
      pacca: { type: Number, min: 0, default: 0 }
    },
    
    // Education
    schoolDropoutRate: { type: Number, min: 0, max: 100 },
    
    // Health
    malnutritionRate: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true }
);

// Compound index for unique village-district-state combination
resourceSchema.index(
  { village: 1, district: 1, state: 1 },
  { unique: true, name: 'location_unique' }
);

const Resource = mongoose.model<IResource>('Resource', resourceSchema);

export default Resource;
