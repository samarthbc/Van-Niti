import stringSimilarity from "string-similarity";
import { mapOcrToFormData as ruleBasedMapper } from "./mapOcrToPatta";

// ------------------- Constants -------------------
const KNOWN_DISTRICTS = ["West Tripura", "South Tripura", "North Tripura", "Dhalai"];
const KNOWN_VILLAGES = ["Badharghat", "Agartala", "Dukli"];

// ------------------- Helper Functions -------------------

export function normalizeText(str: string = ""): string {
  return str.toLowerCase().replace(/[^a-z0-9\s]/gi, "").trim();
}

/**
 * Fuzzy match input to known candidates
 */
export function fuzzyMatch(input: string, candidates: string[], threshold = 0.7): string {
  if (!input) return "";
  const bestMatch = stringSimilarity.findBestMatch(
    normalizeText(input),
    candidates.map(normalizeText)
  );
  return bestMatch.bestMatch.rating >= threshold ? candidates[bestMatch.bestMatchIndex] : input;
}

/**
 * Clean common OCR errors / typos
 */
export function cleanText(val: string | undefined): string {
  if (!val) return "";
  const corrections: Record<string, string> = {
    basty: "Bastu",
    khativan: "Khatiyan",
    movia: "Mouja",
    pattano: "Patta Number",
  };
  const normalized = normalizeText(val);
  return corrections[normalized] || val.trim();
}

/**
 * Parse numeric values from strings
 */
export function parseNumber(val: string | undefined): number {
  if (!val) return 0;
  const match = val.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

/**
 * Parse dates into YYYY-MM-DD
 */
export function parseDate(val: string | undefined): string {
  if (!val) return new Date().toISOString().split("T")[0];
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date().toISOString().split("T")[0] : d.toISOString().split("T")[0];
}

// ------------------- OCR Mapping -------------------

/**
 * Map OCR result to PattaFormData using rule-based extraction
 */
export function mapOcrToFormData(ocrResult: any) {
  const detections = ocrResult?.data?.[0]?.text_detections || [];

  const formData = ruleBasedMapper(ocrResult);

  // Fuzzy normalize key fields
  formData.location.district = fuzzyMatch(formData.location.district, KNOWN_DISTRICTS);
  formData.location.village = fuzzyMatch(formData.location.village, KNOWN_VILLAGES);

  return formData;
}

// ------------------- AI-enhanced Mapping -------------------

/**
 * Process OCR result with optional AI backend for enhanced corrections
 */
export async function processPattaOcr(ocrResult: any) {
  // Step 1: Rule-based extraction
  const draftFormData = mapOcrToFormData(ocrResult);

  try {
    // Step 2: AI backend enhancement
    const response = await fetch("http://localhost:5000/api/ai/patta-mapper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ocrResult, draftFormData }),
    });

    if (!response.ok) throw new Error("AI mapping failed");
    const aiData = await response.json();
    return aiData;
  } catch (err) {
    console.warn("AI mapping failed, using rule-based extraction", err);
    return draftFormData;
  }
}
