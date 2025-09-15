import mongoose, { Document, Schema } from 'mongoose';

export interface ICoordinates {
  type: string;
  coordinates: number[];
}

export interface IArea {
  value: number;
  unit: 'hectares' | 'acres';
}

export interface IBoundaries {
  north: string;
  south: string;
  east: string;
  west: string;
}

export interface IDocument {
  name: string;
  url: string;
  uploadedAt: Date;
}

export interface IIssuedBy {
  authority: string;
  designation: string;
  date: Date;
}

export interface IPatta extends Document {
  pattaNumber: string;
  holder: {
    name: string;
    fatherName: string;
    tribe: string;
    category: 'Scheduled Tribe' | 'Other Traditional Forest Dweller';
  };
  location: {
    village: string;
    district: string;
    state: string;
    coordinates: ICoordinates;
    surveyNumber: string;
    area: IArea;
    boundaries: IBoundaries;
  };
  rights: string[];
  isHeritable: boolean;
  isTransferable: boolean;
  issuedBy: IIssuedBy;
  status: 'active' | 'revoked' | 'under_dispute';
  documents: IDocument[];
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  lastUpdatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const pattaSchema = new Schema<IPatta>(
  {
    pattaNumber: {
      type: String,
      required: [true, 'Patta number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    holder: {
      name: {
        type: String,
        required: [true, 'Holder name is required'],
        trim: true
      },
      fatherName: {
        type: String,
        required: [true, "Father's name is required"],
        trim: true
      },
      tribe: {
        type: String,
        required: [true, 'Tribe information is required'],
        trim: true
      },
      category: {
        type: String,
        enum: ['Scheduled Tribe', 'Other Traditional Forest Dweller'],
        required: [true, 'Category is required']
      }
    },
    location: {
      village: {
        type: String,
        required: [true, 'Village name is required'],
        trim: true
      },
      district: {
        type: String,
        required: [true, 'District name is required'],
        trim: true
      },
      state: {
        type: String,
        required: [true, 'State name is required'],
        trim: true
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          required: [true, 'Coordinates are required'],
          validate: {
            validator: function(v: number[]) {
              return v.length === 2;
            },
            message: 'Coordinates must be an array of [longitude, latitude]'
          }
        }
      },
      surveyNumber: {
        type: String,
        required: [true, 'Survey number is required'],
        trim: true
      },
      area: {
        value: {
          type: Number,
          required: [true, 'Area value is required'],
          min: [0, 'Area cannot be negative']
        },
        unit: {
          type: String,
          enum: ['hectares', 'acres'],
          default: 'hectares'
        }
      },
      boundaries: {
        north: {
          type: String,
          required: [true, 'Northern boundary description is required'],
          trim: true
        },
        south: {
          type: String,
          required: [true, 'Southern boundary description is required'],
          trim: true
        },
        east: {
          type: String,
          required: [true, 'Eastern boundary description is required'],
          trim: true
        },
        west: {
          type: String,
          required: [true, 'Western boundary description is required'],
          trim: true
        }
      }
    },
    rights: [{
      type: String,
      required: [true, 'At least one right must be specified']
    }],
    isHeritable: {
      type: Boolean,
      default: false
    },
    isTransferable: {
      type: Boolean,
      default: false
    },
    issuedBy: {
      authority: {
        type: String,
        required: [true, 'Issuing authority is required'],
        trim: true
      },
      designation: {
        type: String,
        required: [true, 'Designation is required'],
        trim: true
      },
      date: {
        type: Date,
        required: [true, 'Issue date is required']
      }
    },
    status: {
      type: String,
      enum: ['active', 'revoked', 'under_dispute'],
      default: 'active'
    },
    documents: [{
      name: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    notes: {
      type: String,
      trim: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create 2dsphere index for geospatial queries
pattaSchema.index({ 'location.coordinates': '2dsphere' });

// Create text index for search
pattaSchema.index(
  {
    'pattaNumber': 'text',
    'holder.name': 'text',
    'holder.fatherName': 'text',
    'holder.tribe': 'text',
    'location.village': 'text',
    'location.district': 'text',
    'location.state': 'text',
    'location.surveyNumber': 'text'
  },
  {
    weights: {
      'pattaNumber': 10,
      'holder.name': 5,
      'holder.fatherName': 4,
      'location.village': 3,
      'location.district': 3,
      'location.state': 2,
      'location.surveyNumber': 5
    },
    name: 'patta_search_index'
  }
);

export const Patta = mongoose.model<IPatta>('Patta', pattaSchema);
