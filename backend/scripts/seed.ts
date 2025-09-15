import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Patta } from '../src/models/patta.model';

// Load environment variables
dotenv.config();

// Sample data
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
        coordinates: [80.3719, 22.6000] // Mandla coordinates
      },
      surveyNumber: '45/2',
      area: {
        value: 2.5,
        unit: 'acres'
      },
      boundaries: {
        north: 'Road',
        south: 'Stream',
        east: 'Neighbor: Ramesh Patel',
        west: 'Forest boundary'
      }
    },
    rights: ['Right to cultivate', 'Right to collect minor forest produce'],
    isHeritable: true,
    isTransferable: false,
    issuedBy: {
      authority: 'Forest Department',
      designation: 'Deputy Conservator of Forests',
      date: new Date('2023-01-15')
    },
    status: 'active',
    documents: [
      {
        name: 'Land Record',
        url: 'https://example.com/documents/land1.pdf'
      }
    ],
    createdBy: new mongoose.Types.ObjectId(),
    notes: 'Land near the main road with good water source.'
  },
  {
    pattaNumber: 'P/MP/2023/002',
    holder: {
      name: 'Sunita Bai',
      fatherName: 'Ram Singh',
      tribe: 'Baiga',
      category: 'Scheduled Tribe'
    },
    location: {
      village: 'Dindori',
      district: 'Dindori',
      state: 'Madhya Pradesh',
      coordinates: {
        type: 'Point',
        coordinates: [81.0754, 22.9430] // Dindori coordinates
      },
      surveyNumber: '12/7',
      area: {
        value: 1.75,
        unit: 'acres'
      },
      boundaries: {
        north: 'Hills',
        south: 'Village road',
        east: 'Neighbor: Ganesh Yadav',
        west: 'Stream'
      }
    },
    rights: ['Right to cultivate', 'Right to graze cattle'],
    isHeritable: true,
    isTransferable: false,
    issuedBy: {
      authority: 'Forest Department',
      designation: 'Deputy Conservator of Forests',
      date: new Date('2023-02-20')
    },
    status: 'active',
    documents: [
      {
        name: 'Land Record',
        url: 'https://example.com/documents/land2.pdf'
      }
    ],
    createdBy: new mongoose.Types.ObjectId(),
    notes: 'Hilly terrain with some forest cover.'
  },
  {
    pattaNumber: 'P/OD/2023/001',
    holder: {
      name: 'Lakshman Majhi',
      fatherName: 'Biswanath Majhi',
      tribe: 'Santal',
      category: 'Scheduled Tribe'
    },
    location: {
      village: 'Karanjia',
      district: 'Mayurbhanj',
      state: 'Odisha',
      coordinates: {
        type: 'Point',
        coordinates: [86.3379, 21.4927] // Mayurbhanj coordinates
      },
      surveyNumber: '89/15',
      area: {
        value: 3.2,
        unit: 'acres'
      },
      boundaries: {
        north: 'Paddy fields',
        south: 'Forest area',
        east: 'Neighbor: Harijan Sahoo',
        west: 'Government land'
      }
    },
    rights: ['Right to cultivate', 'Right to collect minor forest produce', 'Right to fish in nearby water body'],
    isHeritable: true,
    isTransferable: true,
    issuedBy: {
      authority: 'Revenue Department',
      designation: 'Tahsildar',
      date: new Date('2023-03-10')
    },
    status: 'active',
    documents: [
      {
        name: 'Land Record',
        url: 'https://example.com/documents/land3.pdf'
      },
      {
        name: 'Identity Proof',
        url: 'https://example.com/documents/id3.pdf'
      }
    ],
    createdBy: new mongoose.Types.ObjectId(),
    notes: 'Fertile land near water source.'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/van_niti');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Patta.deleteMany({});
    console.log('Cleared existing patta data');

    // Insert sample data
    const createdPattas = await Patta.insertMany(samplePattas);
    console.log(`Inserted ${createdPattas.length} patta records`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
