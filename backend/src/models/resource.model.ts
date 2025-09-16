import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
  village: string;
  district: string;
  state: string;
  population: number;
  stPercentage: number;
  infrastructureStatus: number;
  waterAvailability: string;
  foodAvailability: string;
  povertyRatio: number;
  literacyRate: number;
  employmentRatio: number;
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IResource>(
  {
    village: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    population: { type: Number, required: true, min: 0 },
    stPercentage: { type: Number, required: true, min: 0, max: 100 },
    infrastructureStatus: { type: Number, required: true, min: 0, max: 10 },
    waterAvailability: { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
    foodAvailability: { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
    povertyRatio: { type: Number, required: true, min: 0, max: 100 },
    literacyRate: { type: Number, required: true, min: 0, max: 100 },
    employmentRatio: { type: Number, required: true, min: 0, max: 100 },
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
