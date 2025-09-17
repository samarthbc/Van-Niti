import { Document } from 'mongoose';

export interface IIndividualProfile {
  // From Patta holder information
  name: string;
  fatherName: string;
  tribe: string;
  category: 'Scheduled Tribe' | 'Other Traditional Forest Dweller';
  
  // From Patta location
  village: string;
  district: string;
  state: string;
  
  // From Patta land details
  landArea: number; // in hectares
  hasForestRights: boolean;
  
  // Additional parameters
  isBPL: boolean; // Can be linked to external BPL data
  hasBankAccount: boolean; // From PMJDY or similar
  familyMembers?: number;
  hasDisabledMember?: boolean;
  isWidow?: boolean;
  isSingleMother?: boolean;
  
  // For backward compatibility (to be phased out)
  isSC?: boolean;
  isST?: boolean;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
}

export interface IScheme {
  id: string;
  name: string;
  ministry: string;
  description: string;
  eligibility: (profile: IIndividualProfile) => boolean;
  priority: (profile: IIndividualProfile) => number;
  benefits: string[];
  requiredDocuments: string[];
  applyLink?: string;
}

// Define schemes first
const schemeDefinitions: IScheme[] = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    description: 'Income support of ₹6,000/year to small & marginal farmers',
    benefits: ['₹6,000 annual income support'],
    requiredDocuments: ['Aadhaar Card', 'Land Records (Patta)', 'Bank Account Details', 'Income Certificate'],
    eligibility: (profile) => 
      profile.landArea > 0 && 
      profile.landArea <= 2, // Up to 2 hectares
    priority: (profile) => (profile.isBPL ? 100 : 80) + (profile.category === 'Scheduled Tribe' ? 20 : 0)
  },
  {
    id: 'pmay-g',
    name: 'PMAY-G',
    ministry: 'Ministry of Rural Development',
    description: 'Housing for All - Rural (Pradhan Mantri Awas Yojana - Gramin)',
    benefits: ['Financial assistance of ₹1.20 lakh in plains/₹1.30 lakh in hilly areas'],
    requiredDocuments: ['Aadhaar Card', 'BPL Certificate', 'Land Documents', 'Affidavit for Landless'],
    eligibility: (profile) => 
      profile.isBPL && 
      profile.hasForestRights,
    priority: (profile) => (profile.category === 'Scheduled Tribe' ? 100 : 90) + (profile.isBPL ? 20 : 0)
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    description: 'Easy credit access for farmers at subsidized interest rates',
    benefits: ['Up to ₹3 lakh loan at 4% interest', 'Insurance coverage', 'Flexible repayment'],
    requiredDocuments: ['Aadhaar Card', 'Land Records', 'Bank Account', 'Passport Photo'],
    eligibility: (profile) => 
      profile.landArea > 0,
    priority: (profile) => (profile.isBPL ? 95 : 85) + (profile.category === 'Scheduled Tribe' ? 15 : 0)
  },
  {
    id: 'pmfby',
    name: 'PM Fasal Bima Yojana (PMFBY)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    description: 'Crop insurance scheme for farmers',
    benefits: ['Premium as low as 1.5-5%', 'Timely claim settlement', 'Coverage for all crops'],
    requiredDocuments: ['Aadhaar Card', 'Land Records', 'Bank Account Details', 'Crop Details'],
    eligibility: (profile) => 
      profile.landArea > 0,
    priority: (profile) => 90 + (profile.category === 'Scheduled Tribe' ? 15 : 0)
  },
  {
    id: 'pmuy',
    name: 'PMUY (Pradhan Mantri Ujjwala Yojana)',
    ministry: 'Ministry of Petroleum & Natural Gas',
    description: 'Free LPG connection for BPL households',
    benefits: ['Free LPG connection', 'First refill and stove cost covered', 'EMI facility for stove cost'],
    requiredDocuments: ['Aadhaar Card', 'BPL Certificate', 'Ration Card', 'Bank Account Details'],
    eligibility: (profile) => 
      profile.isBPL === true && 
      profile.hasBankAccount === true,
    priority: (profile) => (profile.isBPL ? 100 : 70) + ((profile.familyMembers && profile.familyMembers > 5) ? 20 : 0)
  },
  {
    id: 'sukanya-samriddhi',
    name: 'Sukanya Samriddhi Yojana',
    ministry: 'Ministry of Women and Child Development',
    description: 'Savings scheme for girl child',
    benefits: ['High interest rate', 'Tax benefits', 'Maturity after girl turns 21'],
    requiredDocuments: ['Birth Certificate', 'Aadhaar Card', 'Address Proof', 'Parents ID Proof'],
    eligibility: (profile) => 
      profile.hasBankAccount,
    priority: (profile) => (profile.category === 'Scheduled Tribe' ? 95 : 85) + (profile.isBPL ? 15 : 0)
  },
  {
    id: 'scholarship-st-sc',
    name: 'Scholarships for ST/SC Students',
    ministry: 'Ministry of Tribal Affairs / Social Justice',
    description: 'Education support for ST/SC students',
    benefits: ['Tuition fee reimbursement', 'Maintenance allowance', 'Book grant'],
    requiredDocuments: ['Caste Certificate', 'Income Certificate', 'Admission Proof', 'Bank Account Details'],
    eligibility: (profile) => 
      profile.category === 'Scheduled Tribe' && 
      profile.hasBankAccount === true,
    priority: (profile) => (profile.isBPL ? 100 : 90) + ((profile.familyMembers && profile.familyMembers > 5) ? 20 : 0)
  },
  {
    id: 'mudra',
    name: 'Stand-Up India / Mudra Yojana',
    ministry: 'Ministry of Finance',
    description: 'Small business loans for SC/ST and women',
    benefits: ['Loan up to ₹10 lakh', 'No collateral required', 'Subsidized interest rates'],
    requiredDocuments: ['Business Plan', 'Identity Proof', 'Address Proof', 'Caste Certificate (if applicable)'],
    eligibility: (profile) => 
      profile.hasBankAccount,
    priority: (profile) => (profile.category === 'Scheduled Tribe' ? 100 : 80) + (profile.isBPL ? 15 : 0)
  },
  {
    id: 'van-dhan',
    name: 'Van Dhan Yojana',
    ministry: 'Ministry of Tribal Affairs',
    description: 'Value addition to forest produce',
    benefits: ['Training in value addition', 'Market linkage', 'Infrastructure support'],
    requiredDocuments: ['Aadhaar Card', 'ST Certificate', 'Bank Account Details', 'Ration Card'],
    eligibility: (profile) => 
      profile.category === 'Scheduled Tribe' && 
      profile.hasForestRights,
    priority: (profile) => 95 + (profile.isBPL ? 10 : 0)
  },
  {
    id: 'pmsby',
    name: 'PM Suraksha Bima Yojana',
    ministry: 'Ministry of Finance',
    description: 'Accident insurance (₹2 lakh)',
    benefits: ['₹2 lakh accidental death/disability cover', 'Low premium (₹12/year)', 'Auto-debit facility'],
    requiredDocuments: ['Aadhaar Card', 'Bank Account Details', 'Nominee Details'],
    eligibility: (profile) => 
      (profile.age !== undefined && profile.age >= 18 && profile.age <= 70) && 
      profile.hasBankAccount,
    priority: (profile) => (profile.age ? 70 - (profile.age - 18) : 50) + (profile.isBPL ? 20 : 0)
  },
  {
    id: 'pre-matric-scholarship',
    name: 'Pre-Matric Scholarship for ST Students',
    ministry: 'Ministry of Tribal Affairs',
    description: 'Scholarship for ST students studying in classes 9 and 10',
    benefits: ['Maintenance allowance', 'Admission fee', 'Tuition fee', 'Other charges'],
    requiredDocuments: ['Aadhaar Card', 'Caste Certificate', 'Income Certificate', 'Bank Account Details'],
    eligibility: (profile) => 
      profile.category === 'Scheduled Tribe' &&
      profile.isBPL,
    priority: (profile) => profile.isBPL ? 100 : 90
  }
];

// Export schemes array for use in controllers
export const schemes: IScheme[] = schemeDefinitions;

export const getRecommendedSchemes = (profile: IIndividualProfile, limit: number = 5): IScheme[] => {
  const eligibleSchemes = schemes
    .map(scheme => ({
      ...scheme,
      score: scheme.eligibility(profile) ? scheme.priority(profile) : 0
    }))
    .filter(scheme => scheme.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return eligibleSchemes;
};

// Helper function to generate a profile from form data
export const createIndividualProfile = (patta: any, additionalInfo: any = {}) => {
  // Create a plain object instead of a Mongoose document
  return {
    // From Patta
    name: patta.holder.name,
    fatherName: patta.holder.fatherName,
    tribe: patta.holder.tribe,
    category: patta.holder.category,
    village: patta.location.village,
    district: patta.location.district,
    state: patta.location.state,
    landArea: patta.location.area.value, // in hectares
    hasForestRights: patta.rights && patta.rights.length > 0,
    
    // Additional info
    isBPL: additionalInfo.isBPL || false,
    hasBankAccount: additionalInfo.hasBankAccount || false,
    familyMembers: additionalInfo.familyMembers,
    hasDisabledMember: additionalInfo.hasDisabledMember || false,
    isWidow: additionalInfo.isWidow || false,
    isSingleMother: additionalInfo.isSingleMother || false,
    
    // For backward compatibility
    isSC: patta.holder.category === 'Scheduled Caste',
    isST: patta.holder.category === 'Scheduled Tribe',
    age: additionalInfo.age,
    gender: additionalInfo.gender
  };
};
