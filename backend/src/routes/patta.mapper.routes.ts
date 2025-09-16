import express from "express";
import { Groq } from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const router = express();

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/patta-mapper", async (req, res) => {
  try {
    const { ocrResult, draftFormData } = req.body;
    console.log(ocrResult);
    console.log(draftFormData);

    const prompt = `
You are an intelligent data extraction assistant.

You will be given:
1. Raw OCR results (sometimes noisy, misspelled, or inconsistent).
2. A partially filled JSON form (PattaFormData).

Your job:
- Correct OCR mistakes (e.g., "Khativan" → "Khatiyan", "Basty" → "Bastu").
- Fill missing details if possible.
- Normalize names (district, sub-division, revenue circle) to known values:
  ["West Tripura", "South Tripura", "North Tripura", "Dhalai"].
- the states would only be tripura, telangana, madhya pradesh, odissa
- Ensure date is in YYYY-MM-DD format.
- Output strictly valid JSON matching this TypeScript interface:

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

Return **only the JSON object**, no explanations.

OCR Result:
${JSON.stringify(ocrResult, null, 2)}

Draft Form Data:
${JSON.stringify(draftFormData, null, 2)}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a precise JSON data extraction model." },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    console.log(parsed)

    res.json(parsed);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to process OCR result" });
  }
});



export default router;