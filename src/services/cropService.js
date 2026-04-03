import { askGemini } from '../config/gemini';

export async function getCropRecommendation({ soilType, phLevel, location, season, waterAvailability, landSize }) {
  const prompt = `You are an expert agricultural advisor. Based on the following farmer inputs, recommend the best crops to grow.

Farmer Inputs:
- Soil Type: ${soilType}
- Soil pH Level: ${phLevel}
- Location/Region: ${location}
- Season: ${season}
- Water Availability: ${waterAvailability}
- Land Size: ${landSize || 'Not specified'}

Please provide your response in this EXACT JSON format (no markdown, no code blocks, just pure JSON):
{
  "recommendations": [
    {
      "crop": "Crop Name",
      "confidence": 95,
      "expectedYield": "Expected yield per acre",
      "growingPeriod": "Duration in days/months",
      "waterNeeds": "Low/Medium/High",
      "marketDemand": "Low/Medium/High",
      "estimatedProfit": "Estimated profit range per acre",
      "tips": ["Tip 1", "Tip 2", "Tip 3"]
    }
  ],
  "soilAdvice": "Brief soil management advice",
  "seasonalNotes": "Important notes for the season",
  "fertilizerSuggestion": "Recommended fertilizers"
}

Provide exactly 4-5 crop recommendations sorted by confidence/suitability.`;

  const response = await askGemini(prompt);
  
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      recommendations: [],
      soilAdvice: response,
      seasonalNotes: '',
      fertilizerSuggestion: '',
      rawResponse: response,
    };
  }
}

export async function getFertilizerAdvice(crop, soilType, issue) {
  const prompt = `As an agricultural expert, provide fertilizer and nutrient advice for:
- Crop: ${crop}
- Soil Type: ${soilType}
- Issue/Goal: ${issue || 'General health'}

Provide response in JSON format:
{
  "fertilizer": "Recommended fertilizer name",
  "dosage": "Application rate",
  "schedule": "When to apply",
  "organic_alternative": "Organic option",
  "tips": ["Tip 1", "Tip 2"]
}`;

  const response = await askGemini(prompt);
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { rawResponse: response };
  }
}
