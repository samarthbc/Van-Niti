import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {Patta} from '../src/models/patta.model';

// Load environment variables
dotenv.config();

const samplePattas = [
  {
    pattaNumber: 'P/MP/2023/001',
    holder: {
      name: 'Rajesh Kumar',
      fatherName: 'Suresh Kumar',
      tribe: 'Gond',
      category: 'Scheduled Tribe'
    },
    location: {
      village: 'Bichhiya',
      district: 'Mandla',
      state: 'Madhya Pradesh',
      coordinates: {
        type: 'Point',
        coordinates: [80.3719, 22.6000] // Longitude, Latitude for Bichhiya, MP
      },
      surveyNumber: '45/2',
      area: {
        value: 2.5,
        unit: 'acres'
      },
      boundaries: {
        north: 'Nala',
        south: 'Main Road',
        east: 'Forest Boundary',
        west: 'Neighbor Patta'
      }
    },
    rights: ['Right to cultivate', 'Right to collect minor forest produce'],
    isHeritable: true,
    status: 'active',
    issuedBy: {
      authority: 'District Tribal Welfare Office',
      designation: 'District Tribal Welfare Officer',
      date: new Date('2023-01-15')
    },
    documents: [
      {
        name: 'Identity Proof',
        url: 'https://example.com/docs/id123.pdf',
        uploadedAt: new Date('2023-01-10')
      }
    ]
  },
  {
    pattaNumber: 'P/OD/2023/001',
    holder: {
      name: 'Manoj Pradhan',
      fatherName: 'Hari Pradhan',
      tribe: 'Santal',
      category: 'Scheduled Tribe'
    },
    location: {
      village: 'Rairangpur',
      district: 'Mayurbhanj',
      state: 'Odisha',
      coordinates: {
        type: 'Point',
        coordinates: [86.1678, 22.2666] // Longitude, Latitude for Rairangpur
      },
      surveyNumber: '78/5',
      area: {
        value: 3.2,
        unit: 'acres'
      },
      boundaries: {
        north: 'River',
        south: 'Hills',
        east: 'Village Road',
        west: 'Forest Boundary'
      }
    },
    rights: ['Right to cultivate', 'Right to use forest produce', 'Right to fish in water bodies'],
    isHeritable: true,
    status: 'active',
    issuedBy: {
      authority: 'Tribal Development Department',
      designation: 'Sub-Collector',
      date: new Date('2023-02-20')
    },
    documents: [
      {
        name: 'Identity Proof',
        url: 'https://example.com/docs/id124.pdf',
        uploadedAt: new Date('2023-02-15')
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/van_niti');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Patta.deleteMany({});
    console.log('Cleared existing patta data');

    // Insert sample data
    const createdPattas = await Patta.insertMany(samplePattas);
    console.log(`Inserted ${createdPattas.length} pattas`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
