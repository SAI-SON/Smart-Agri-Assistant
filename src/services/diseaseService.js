import { analyzeImage } from '../config/gemini';

export async function detectPlantDisease(imageBase64, mimeType) {
  const prompt = `You are an expert plant pathologist. Analyze this plant leaf image carefully and detect any diseases or health issues.

Provide your response in this EXACT JSON format (no markdown, no code blocks, just pure JSON):
{
  "isHealthy": false,
  "diseaseName": "Name of disease if detected, or 'Healthy' if no disease",
  "confidence": 87,
  "severity": "Mild/Moderate/Severe",
  "plantType": "Detected plant type",
  "symptoms": ["Symptom 1", "Symptom 2"],
  "causes": ["Cause 1", "Cause 2"],
  "treatment": {
    "chemical": ["Chemical treatment 1", "Chemical treatment 2"],
    "organic": ["Organic treatment 1", "Organic treatment 2"],
    "cultural": ["Cultural practice 1", "Cultural practice 2"]
  },
  "prevention": ["Prevention tip 1", "Prevention tip 2"],
  "urgency": "Low/Medium/High/Critical",
  "additionalNotes": "Any additional observations"
}

If the image does not appear to be a plant leaf or is unclear, set isHealthy to null and provide a message in additionalNotes.`;

  const response = await analyzeImage(imageBase64, mimeType, prompt);
  
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      isHealthy: null,
      diseaseName: 'Analysis Error',
      rawResponse: response,
      additionalNotes: 'Could not parse the AI response. Raw response is included.',
    };
  }
}
