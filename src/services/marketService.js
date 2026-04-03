import { askGemini } from '../config/gemini';

const CROPS_LIST = [
  'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Soybean', 
  'Potato', 'Tomato', 'Onion', 'Chilli', 'Turmeric', 'Groundnut',
  'Mustard', 'Tea', 'Coffee', 'Banana', 'Mango', 'Apple',
  'Coconut', 'Rubber', 'Jute', 'Pulses', 'Barley', 'Jowar'
];

export function getCropsList() {
  return CROPS_LIST;
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function roundPrice(value) {
  return Math.round(value * 100) / 100;
}

function detectPerKgFactor(unit, modalPrice) {
  const normalizedUnit = String(unit || '').toLowerCase();

  if (normalizedUnit.includes('quintal') || normalizedUnit.includes('100 kg')) {
    return 0.01;
  }

  if (normalizedUnit.includes('per kg') || normalizedUnit.includes('/kg')) {
    return 1;
  }

  // Heuristic fallback: very high values are usually per quintal in mandi data.
  if (toNumber(modalPrice) > 500) {
    return 0.01;
  }

  return 1;
}

function toPerKg(value, factor) {
  return roundPrice(toNumber(value) * factor);
}

function normalizeTrend(value) {
  const trend = String(value || '').trim().toLowerCase();
  if (trend === 'rising') return 'Rising';
  if (trend === 'falling') return 'Falling';
  return 'Stable';
}

function cleanJsonResponse(text) {
  const cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();

  // Handle models that prepend/append explanatory text around JSON.
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

function normalizeMarketData(parsed, selectedCrop, selectedState) {
  const stateValue = selectedState || 'India';
  const currentPrice = parsed?.currentPrice || {};
  const perKgFactor = detectPerKgFactor(currentPrice.unit, currentPrice.modal);

  return {
    crop: selectedCrop,
    state: stateValue,
    currentPrice: {
      min: toPerKg(currentPrice.min, perKgFactor),
      max: toPerKg(currentPrice.max, perKgFactor),
      modal: toPerKg(currentPrice.modal, perKgFactor),
      unit: 'per kg (INR)',
    },
    priceHistory: Array.isArray(parsed?.priceHistory)
      ? parsed.priceHistory.map((entry) => ({
          month: entry?.month || '',
          price: toPerKg(entry?.price, perKgFactor),
        }))
      : [],
    msp: parsed?.msp == null ? null : toPerKg(parsed.msp, perKgFactor),
    trend: normalizeTrend(parsed?.trend),
    bestTimeToSell: parsed?.bestTimeToSell || 'Based on current trend',
    marketInsight: parsed?.marketInsight || `Current market outlook for ${selectedCrop} in ${stateValue}.`,
    topMarkets: Array.isArray(parsed?.topMarkets)
      ? parsed.topMarkets.map((m) => ({
          market: m?.market || 'Local Market',
          price: toPerKg(m?.price, perKgFactor),
        }))
      : [],
  };
}

export async function getMarketPrices(crop, state) {
  const prompt = `You are an Indian agricultural market expert. Provide realistic current market price data for ${crop} in ${state || 'India'}.

IMPORTANT: Return price data for ONLY this crop: ${crop}. Do not include or compare any other crops.

Provide your response in this EXACT JSON format (no markdown, no code blocks, just pure JSON):
{
  "crop": "${crop}",
  "state": "${state || 'India'}",
  "currentPrice": {
    "min": 18,
    "max": 22,
    "modal": 20,
    "unit": "per kg (INR)"
  },
  "priceHistory": [
    { "month": "Jan", "price": 19 },
    { "month": "Feb", "price": 19.5 },
    { "month": "Mar", "price": 20 },
    { "month": "Apr", "price": 20.5 },
    { "month": "May", "price": 19.8 },
    { "month": "Jun", "price": 21 },
    { "month": "Jul", "price": 21.5 },
    { "month": "Aug", "price": 22 },
    { "month": "Sep", "price": 20.5 },
    { "month": "Oct", "price": 19 },
    { "month": "Nov", "price": 18.5 },
    { "month": "Dec", "price": 19.2 }
  ],
  "msp": 20.4,
  "trend": "Stable/Rising/Falling",
  "bestTimeToSell": "Recommended months",
  "marketInsight": "Brief market analysis",
  "topMarkets": [
    { "market": "Market Name 1", "price": 21 },
    { "market": "Market Name 2", "price": 20.5 },
    { "market": "Market Name 3", "price": 19.8 }
  ]
}

Provide realistic Indian market prices in INR per kg only. Use actual MSP (Minimum Support Price) values where applicable, converted to per kg.`;

  const response = await askGemini(prompt);
  try {
    const cleaned = cleanJsonResponse(response);
    const parsed = JSON.parse(cleaned);
    return normalizeMarketData(parsed, crop, state);
  } catch {
    return { rawResponse: response };
  }
}
