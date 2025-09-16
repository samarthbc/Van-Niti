import { IResource } from '../models/resource.model';

type ResourceData = Partial<IResource>;

interface Scheme {
  id: string;
  name: string;
  ministry: string;
  focusArea: string;
  description: string;
  eligibility: (resource: ResourceData) => boolean;
  priority: (resource: ResourceData) => number;
}

const schemes: Scheme[] = [
  // MGNREGA - Mahatma Gandhi National Rural Employment Guarantee Act
  {
    id: 'mgnrega',
    name: 'MGNREGA',
    ministry: 'Ministry of Rural Development',
    focusArea: 'Rural employment + community asset creation',
    description: 'Mahatma Gandhi National Rural Employment Guarantee Act',
    eligibility: (resource) => 
      (resource.population || 0) < 10000 && // Rural focus
      (resource.employmentRatio || 0) < 70, // High unemployment
    priority: (resource) => {
      let score = 0;
      if ((resource.employmentRatio || 0) < 60) score += 30;
      if ((resource.povertyRatio || 0) > 30) score += 25;
      if ((resource.stPercentage || 0) > 20) score += 20;
      if ((resource.infrastructureStatus || 0) < 5) score += 25;
      return score;
    }
  },
  
  // PMGSY - Pradhan Mantri Gram Sadak Yojana
  {
    id: 'pmgsy',
    name: 'PMGSY',
    ministry: 'Ministry of Rural Development',
    focusArea: 'All-weather road connectivity',
    description: 'Pradhan Mantri Gram Sadak Yojana',
    eligibility: (resource) => 
      (resource.population || 0) >= 250 && 
      (resource.roadConnectivity === 'None' || resource.roadConnectivity === 'Kaccha'),
    priority: (resource) => {
      let score = 0;
      if (resource.roadConnectivity === 'None') score += 50;
      if (resource.roadConnectivity === 'Kaccha') score += 30;
      if ((resource.stPercentage || 0) > 20) score += 20;
      return score;
    }
  },
  
  // Jal Jeevan Mission
  {
    id: 'jjm',
    name: 'Jal Jeevan Mission',
    ministry: 'Ministry of Jal Shakti',
    focusArea: 'Tap water to every rural household',
    description: 'Ensuring piped water supply to all rural households',
    eligibility: (resource) => 
      resource.waterAvailability === 'Low' || resource.waterAvailability === 'Medium',
    priority: (resource) => {
      let score = 0;
      if (resource.waterAvailability === 'Low') score += 50;
      if (resource.waterAvailability === 'Medium') score += 30;
      if ((resource.population || 0) > 1000) score += 20;
      return score;
    }
  },
  
  // PMKSY - Watershed & Irrigation
  {
    id: 'pmksy',
    name: 'PMKSY - Watershed & Irrigation',
    ministry: 'Ministry of Agriculture & Farmers’ Welfare',
    focusArea: 'Irrigation, water-use efficiency, watershed development',
    description: 'Pradhan Mantri Krishi Sinchai Yojana',
    eligibility: (resource) => 
      resource.waterAvailability === 'Low' || 
      (resource.infrastructureStatus || 0) < 5,
    priority: (resource) => {
      let score = 0;
      if (resource.waterAvailability === 'Low') score += 40;
      if ((resource.infrastructureStatus || 0) < 5) score += 30;
      if ((resource.employmentRatio || 0) < 60) score += 30;
      return score;
    }
  },
  
  // ICDS / Poshan Abhiyaan
  {
    id: 'icds',
    name: 'ICDS / Poshan Abhiyaan',
    ministry: 'Ministry of Women & Child Development',
    focusArea: 'Anganwadi services, nutrition, maternal & child health',
    description: 'Integrated Child Development Services',
    eligibility: (resource) => 
      (resource.children0to6 || 0) > 100 ||
      (resource.malnutritionRate || 0) > 30,
    priority: (resource) => {
      let score = 0;
      if ((resource.malnutritionRate || 0) > 30) score += 50;
      if ((resource.children0to6 || 0) > 200) score += 50;
      if ((resource.stPercentage || 0) > 20) score += 20;
      return score;
    }
  },
  
  // Samagra Shiksha
  {
    id: 'samagra-shiksha',
    name: 'Samagra Shiksha',
    ministry: 'Ministry of Education',
    focusArea: 'School infrastructure, inclusive education, digital learning',
    description: 'Holistic education scheme',
    eligibility: (resource) => 
      (resource.schoolDropoutRate || 0) > 20 ||
      (resource.distanceToSchool || 0) > 5,
    priority: (resource) => {
      let score = 0;
      if ((resource.schoolDropoutRate || 0) > 30) score += 40;
      if ((resource.distanceToSchool || 0) > 5) score += 40;
      if ((resource.literacyRate || 0) < 70) score += 20;
      return score;
    }
  },
  
  // National Health Mission
  {
    id: 'nhm',
    name: 'National Health Mission',
    ministry: 'Ministry of Health & Family Welfare',
    focusArea: 'Rural health infrastructure',
    description: 'Improving healthcare infrastructure and services',
    eligibility: (resource) => 
      (resource.distanceToPHC || 0) > 5 ||
      (resource.population || 0) > 2000,
    priority: (resource) => {
      let score = 0;
      if ((resource.distanceToPHC || 0) > 10) score += 50;
      if ((resource.population || 0) > 3000) score += 30;
      if ((resource.stPercentage || 0) > 20) score += 20;
      return score;
    }
  },
  
  // PMAY-G (Gramin Housing)
  {
    id: 'pmay-g',
    name: 'PMAY-G',
    ministry: 'Ministry of Rural Development',
    focusArea: 'Housing for rural poor',
    description: 'Pradhan Mantri Awas Yojana - Gramin',
    eligibility: (resource) => 
      (resource.housingType?.kutcha || 0) > 0.3 * (resource.population || 0) / 5, // Assuming 5 people per household
    priority: (resource) => {
      const kutchaHouses = resource.housingType?.kutcha || 0;
      const totalHouses = ((resource.housingType?.kutcha || 0) + 
                         (resource.housingType?.semiPacca || 0) + 
                         (resource.housingType?.pacca || 0)) || 1;
      const kutchaPercentage = (kutchaHouses / totalHouses) * 100;
      
      let score = 0;
      if (kutchaPercentage > 50) score += 50;
      if ((resource.povertyRatio || 0) > 30) score += 30;
      if ((resource.stPercentage || 0) > 20) score += 20;
      return score;
    }
  },
  
  // NRLM - National Rural Livelihood Mission
  {
    id: 'nrlm',
    name: 'NRLM',
    ministry: 'Ministry of Rural Development',
    focusArea: 'SHGs, microfinance & enterprises',
    description: 'National Rural Livelihood Mission',
    eligibility: (resource) => 
      (resource.womenPopulation || 0) > (resource.population || 0) * 0.4 &&
      (resource.employmentRatio || 0) < 70,
    priority: (resource) => {
      let score = 0;
      if ((resource.employmentRatio || 0) < 60) score += 40;
      if ((resource.womenPopulation || 0) > (resource.population || 0) * 0.45) score += 40;
      if ((resource.stPercentage || 0) > 20) score += 20;
      return score;
    }
  },
  
  // PM Gati Shakti
  {
    id: 'gati-shakti',
    name: 'PM Gati Shakti',
    ministry: 'Ministry of Commerce & Industry',
    focusArea: 'Multi-modal infrastructure planning',
    description: 'Infrastructure development and planning',
    eligibility: (resource) => 
      (resource.infrastructureStatus || 0) < 6 ||
      (resource.population || 0) > 5000,
    priority: (resource) => {
      let score = 0;
      if ((resource.infrastructureStatus || 0) < 5) score += 40;
      if ((resource.population || 0) > 5000) score += 40;
      if ((resource.employmentRatio || 0) < 70) score += 20;
      return score;
    }
  },
  
  // National Bamboo Mission
  {
    id: 'bamboo-mission',
    name: 'National Bamboo Mission',
    ministry: 'Ministry of Agriculture & Farmers’ Welfare',
    focusArea: 'Bamboo plantations and NTFP-based livelihoods',
    description: 'Promoting bamboo cultivation and industry',
    eligibility: (resource) => 
      resource.bambooCoverage === 'Medium' || 
      resource.bambooCoverage === 'High',
    priority: (resource) => {
      let score = 0;
      if (resource.bambooCoverage === 'High') score += 60;
      if (resource.bambooCoverage === 'Medium') score += 40;
      if ((resource.stPercentage || 0) > 20) score += 20;
      return score;
    }
  },
  
  // Van Dhan Yojana
  {
    id: 'van-dhan',
    name: 'Van Dhan Yojana',
    ministry: 'Ministry of Tribal Affairs',
    focusArea: 'NTFP value chains',
    description: 'Promoting tribal entrepreneurship through forest produce',
    eligibility: (resource) => 
      (resource.forestCoverPercentage || 0) > 30 &&
      (resource.stPercentage || 0) > 20,
    priority: (resource) => {
      let score = 0;
      if ((resource.stPercentage || 0) > 30) score += 40;
      if ((resource.forestCoverPercentage || 0) > 40) score += 40;
      if ((resource.employmentRatio || 0) < 70) score += 20;
      return score;
    }
  },
  
  // Solar/RE Village Schemes
  {
    id: 'solar-village',
    name: 'Solar/RE Village Scheme',
    ministry: 'Ministry of New & Renewable Energy',
    focusArea: 'Renewable energy in rural areas',
    description: 'Promoting solar energy in villages',
    eligibility: (resource) => 
      resource.electrificationStatus !== 'Fully Electrified' ||
      (resource.population || 0) < 1000,
    priority: (resource) => {
      let score = 0;
      if (resource.electrificationStatus === 'Not Electrified') score += 60;
      if (resource.electrificationStatus === 'Partial') score += 40;
      if ((resource.population || 0) < 1000) score += 30;
      return score;
    }
  }
  // Add more schemes following the same pattern
];

export function getRecommendedSchemes(resource: ResourceData, limit: number = 5) {
  const eligibleSchemes = schemes
    .map(scheme => ({
      ...scheme,
      score: scheme.eligibility(resource) ? scheme.priority(resource) : 0
    }))
    .filter(scheme => scheme.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return eligibleSchemes;
}

export function getSchemeDetails(schemeId: string) {
  return schemes.find(scheme => scheme.id === schemeId);
}
