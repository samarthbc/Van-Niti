import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resource, { IResource } from '../src/models/resource.model';
import { getRecommendedSchemes } from '../src/utils/schemeRecommender';

dotenv.config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vanniti';

// Helper function to generate random number in range
const randomInRange = (min: number, max: number, precision: number = 0): number => {
  const value = Math.random() * (max - min) + min;
  return precision ? parseFloat(value.toFixed(precision)) : Math.round(value);
};

// Helper function to get random element from array
const randomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Generate random coordinates within state bounds
const generateCoordinates = (state: string): [number, number] => {
  const bounds = stateData[state as keyof typeof stateData].bounds;
  const [minLon, minLat, maxLon, maxLat] = bounds;
  return [
    randomInRange(minLon, maxLon, 6), // longitude
    randomInRange(minLat, maxLat, 6)  // latitude
  ];
};

// Generate a single dummy resource
const generateDummyResource = (village: string, district: string, state: string): IResource => {
  const [longitude, latitude] = generateCoordinates(state);
  const population = randomInRange(500, 10000);
  const stPercentage = randomInRange(5, 95, 1);
  const children0to6 = Math.round(population * (randomInRange(8, 15) / 100));
  const womenPopulation = Math.round(population * (randomInRange(45, 55) / 100));
  
  const housingType = {
    kutcha: randomInRange(10, 80),
    semiPacca: randomInRange(10, 80),
    pacca: randomInRange(10, 80)
  };
  
  // Normalize housing type percentages
  const totalHousing = housingType.kutcha + housingType.semiPacca + housingType.pacca;
  housingType.kutcha = Math.round((housingType.kutcha / totalHousing) * 100);
  housingType.semiPacca = Math.round((housingType.semiPacca / totalHousing) * 100);
  housingType.pacca = 100 - housingType.kutcha - housingType.semiPacca;

  return new Resource({
    village,
    district,
    state,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    },
    population,
    stPercentage,
    children0to6,
    womenPopulation,
    infrastructureStatus: randomInRange(2, 9),
    roadConnectivity: randomElement(['None', 'Kaccha', 'Pacca', 'Highway']),
    distanceToPHC: randomInRange(1, 30, 1),
    distanceToSchool: randomInRange(0.5, 10, 1),
    electrificationStatus: randomElement(['Not Electrified', 'Partial', 'Fully Electrified']),
    waterAvailability: randomElement(['Low', 'Medium', 'High']),
    foodAvailability: randomElement(['Low', 'Medium', 'High']),
    forestCoverPercentage: randomInRange(0, 80, 1),
    bambooCoverage: randomElement(['None', 'Low', 'Medium', 'High']),
    povertyRatio: randomInRange(5, 70, 1),
    literacyRate: randomInRange(30, 95, 1),
    employmentRatio: randomInRange(30, 90, 1),
    housingType,
    schoolDropoutRate: randomInRange(1, 40, 1),
    malnutritionRate: randomInRange(1, 50, 1)
  });
};

// State-wise data with districts, villages, and approximate coordinate bounds [minLon, minLat, maxLon, maxLat]
const stateData = {
  'Odisha': {
    districts: ['Gajapati', 'Kandhamal', 'Rayagada', 'Koraput', 'Malkangiri'],
    villagesPerDistrict: 3,
    bounds: [81.5, 17.5, 87.5, 22.5] // Approximate bounds for Odisha
  },
  'Madhya Pradesh': {
    districts: ['Alirajpur', 'Barwani', 'Dhar', 'Jhabua', 'Mandla'],
    villagesPerDistrict: 3,
    bounds: [74.0, 21.0, 82.5, 26.5] // Approximate bounds for Madhya Pradesh
  },
  'Telangana': {
    districts: ['Adilabad', 'Kumram Bheem', 'Mahabubabad', 'Bhadradri Kothagudem', 'Mancherial'],
    villagesPerDistrict: 3,
    bounds: [77.0, 15.5, 81.5, 19.5] // Approximate bounds for Telangana
  },
  'Tripura': {
    districts: ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'South Tripura'],
    villagesPerDistrict: 3,
    bounds: [91.0, 22.5, 92.5, 24.5] // Approximate bounds for Tripura
  }
};

// Generate dummy resources for all states
const generateDummyResources = (): IResource[] => {
  const resources: IResource[] = [];
  
  Object.entries(stateData).forEach(([state, stateInfo]) => {
    stateInfo.districts.forEach(district => {
      for (let i = 1; i <= stateInfo.villagesPerDistrict; i++) {
        const village = `Village ${i}${String.fromCharCode(64 + Math.ceil(Math.random() * 3))}`;
        resources.push(generateDummyResource(village, district, state));
      }
    });
  });
  
  return resources;
};

// Main function to seed the database
const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Resource.deleteMany({});
    console.log('Cleared existing resources');
    
    // Generate and insert dummy resources
    const dummyResources = generateDummyResources();
    await Resource.insertMany(dummyResources);
    
    console.log(`Successfully inserted ${dummyResources.length} dummy resources`);
    
    // Verify by counting
    const count = await Resource.countDocuments();
    console.log(`Total resources in database: ${count}`);
    
    // Show a sample with recommended schemes
    const sampleResource = await Resource.findOne();
    if (sampleResource) {
      const withSchemes = {
        ...sampleResource.toObject(),
        recommendedSchemes: getRecommendedSchemes(sampleResource.toObject())
      };
      console.log('\nSample resource with recommended schemes:');
      console.log(JSON.stringify(withSchemes, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
