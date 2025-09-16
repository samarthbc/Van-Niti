import { cleanText, fuzzyMatch, parseNumber, parseDate } from "./pattaUtils";

// Known values for normalization
const KNOWN_DISTRICTS = ["West Tripura", "South Tripura", "North Tripura", "Dhalai"];
const KNOWN_VILLAGES = ["Badharghat", "Agartala", "Dukli"];

interface PattaFormData {
  pattaNumber: string;
  holder: {
    name: string;
    fatherName: string;
    tribe: string;
    category: "Scheduled Tribe" | "Other Traditional Forest Dweller";
  };
  location: {
    state: string;
    district: string;
    subDivision: string;
    revenueCircle: string;
    village: string;
    surveyNumber: string;
    khatiyanNumber: string;
    coordinates: {
      type: string;
      coordinates: [number, number];
    };
    area: {
      value: number;
      unit: "acres" | "hectares";
    };
    boundaries: {
      north: string;
      south: string;
      east: string;
      west: string;
    };
  };
  rights: string[];
  isHeritable: boolean;
  status: "active" | "inactive" | "pending";
  issuedBy: {
    authority: string;
    designation: string;
    date: string;
  };
}

/**
 * Rule-based OCR -> PattaFormData mapping
 */
export function mapOcrToFormData(ocrResult: any): PattaFormData {
  const detections = ocrResult?.data?.[0]?.text_detections || [];

  const formData: PattaFormData = {
    pattaNumber: "",
    holder: { name: "", fatherName: "", tribe: "", category: "Scheduled Tribe" },
    location: {
      state: "",
      district: "",
      subDivision: "",
      revenueCircle: "",
      village: "",
      surveyNumber: "",
      khatiyanNumber: "",
      coordinates: { type: "Point", coordinates: [0, 0] },
      area: { value: 0, unit: "acres" },
      boundaries: { north: "", south: "", east: "", west: "" },
    },
    rights: [],
    isHeritable: true,
    status: "active",
    issuedBy: { authority: "", designation: "", date: new Date().toISOString().split("T")[0] },
  };

  // Iterate OCR text
  detections.forEach((det: any, i: number) => {
    const text: string = det.text_prediction?.text?.trim() || "";
    const lower = text.toLowerCase();

    // --- Patta Number ---
    if (/patta/i.test(lower)) {
      const value = text.includes(":") ? text.split(":")[1] : detections[i + 1]?.text_prediction?.text;
      formData.pattaNumber = cleanText(value);
    }

    // --- District ---
    else if (/district/i.test(lower)) {
      const value = text.includes(":") ? text.split(":")[1] : detections[i + 1]?.text_prediction?.text;
      formData.location.district = cleanText(value);
    }

    // --- Sub-division ---
    else if (/sub-?division/i.test(lower)) {
      const value = text.includes(":") ? text.split(":")[1] : detections[i + 1]?.text_prediction?.text;
      formData.location.subDivision = cleanText(value);
    }

    // --- Revenue Circle ---
    else if (/revenue circle/i.test(lower)) {
      const value = text.includes(":") ? text.split(":")[1] : detections[i + 1]?.text_prediction?.text;
      formData.location.revenueCircle = cleanText(value);
    }

    // --- Survey Number ---
    else if (/survey/i.test(lower)) {
      formData.location.surveyNumber = cleanText(text.split(":")[1]);
    }

    // --- Khatiyan Number ---
    else if (/khati(y|v)an/i.test(lower)) {
      formData.location.khatiyanNumber = cleanText(text.split(":")[1]);
    }

    // --- Holder Info ---
    else if (/owner name/i.test(lower)) {
      formData.holder.name = cleanText(detections[i + 1]?.text_prediction?.text);
    } else if (/father/i.test(lower)) {
      formData.holder.fatherName = cleanText(detections[i + 1]?.text_prediction?.text);
    } else if (/tribe/i.test(lower)) {
      formData.holder.tribe = cleanText(detections[i + 1]?.text_prediction?.text);
    }

    // --- Rights ---
    else if (/type of land/i.test(lower)) {
      const value = text.includes(":") ? text.split(":")[1] : detections[i + 1]?.text_prediction?.text;
      formData.rights.push(cleanText(value));
    }

    // --- Area ---
    else if (/extent of land/i.test(lower)) {
      formData.location.area.value = parseNumber(text);
    }

    // --- Boundaries ---
    else if (/north/i.test(lower)) formData.location.boundaries.north = cleanText(text.split(":")[1]);
    else if (/south/i.test(lower)) formData.location.boundaries.south = cleanText(text.split(":")[1]);
    else if (/east/i.test(lower)) formData.location.boundaries.east = cleanText(text.split(":")[1]);
    else if (/west/i.test(lower)) formData.location.boundaries.west = cleanText(text.split(":")[1]);

    // --- Issued By ---
    else if (/authority/i.test(lower)) formData.issuedBy.authority = cleanText(text.split(":")[1]);
    else if (/designation/i.test(lower)) formData.issuedBy.designation = cleanText(text.split(":")[1]);
    else if (/date/i.test(lower)) formData.issuedBy.date = parseDate(text.split(":")[1]);
  });

  // --- Fuzzy Normalization ---
  formData.location.district = fuzzyMatch(formData.location.district, KNOWN_DISTRICTS);
  formData.location.village = fuzzyMatch(formData.location.village, KNOWN_VILLAGES);

  return formData;
}
