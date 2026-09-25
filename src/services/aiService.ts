import type { Farm, Crop, SoilRecord } from '../types';

interface AIContext {
  farm?: Farm | null;
  crops?: Crop[];
  soilRecord?: SoilRecord | null;
  location?: string;
}

const cropKnowledge: Record<string, {
  diseases: Array<{ name: string; symptoms: string[]; causes: string[]; actions: string[] }>;
  irrigation: { minMoisture: number; waterReq: string };
  nutrients: { n: string; p: string; k: string };
}> = {
  tomato: {
    diseases: [
      { name: 'Early Blight', symptoms: ['Brown spots with yellow rings', 'Lower leaf yellowing', 'Dark concentric rings'], causes: ['Fungal infection (Alternaria solani)', 'High humidity', 'Overhead watering'], actions: ['Apply mancozeb fungicide', 'Remove infected leaves', 'Improve air circulation', 'Avoid overhead irrigation'] },
      { name: 'Septoria Leaf Spot', symptoms: ['Small circular spots with gray centers', 'Yellow halos', 'Premature leaf drop'], causes: ['Fungal pathogen', 'Wet weather', 'Infected soil'], actions: ['Apply copper-based fungicide', 'Remove infected plant parts', 'Mulch soil surface', 'Avoid wetting foliage'] },
    ],
    irrigation: { minMoisture: 65, waterReq: 'Medium-High (600-1200mm)' },
    nutrients: { n: 'High (80-100 kg/ha)', p: 'Medium (60-80 kg/ha)', k: 'High (100-120 kg/ha)' },
  },
  rice: {
    diseases: [
      { name: 'Blast Disease', symptoms: ['Diamond-shaped lesions', 'Gray centers', 'Brown borders'], causes: ['Magnaporthe oryzae fungus', 'High nitrogen', 'Temperature fluctuations'], actions: ['Apply tricyclazole fungicide', 'Reduce nitrogen application', 'Maintain proper water level', 'Use resistant varieties'] },
    ],
    irrigation: { minMoisture: 75, waterReq: 'High (1000-2000mm)' },
    nutrients: { n: 'High (100-120 kg/ha)', p: 'Medium (60 kg/ha)', k: 'Medium (60 kg/ha)' },
  },
  chili: {
    diseases: [
      { name: 'Anthracnose', symptoms: ['Dark sunken lesions on fruit', 'Orange spore masses', 'Soft rot'], causes: ['Colletotrichum fungus', 'Warm humid weather', 'Mechanical injury'], actions: ['Apply carbendazim fungicide', 'Harvest promptly at maturity', 'Avoid fruit injury', 'Reduce humidity'] },
    ],
    irrigation: { minMoisture: 60, waterReq: 'Medium (600-900mm)' },
    nutrients: { n: 'High (80-100 kg/ha)', p: 'Medium (50-60 kg/ha)', k: 'High (80-100 kg/ha)' },
  },
};

const aiResponses = {
  yellowing: (ctx: AIContext) => {
    const soil = ctx.soilRecord;
    const nLevel = soil?.nitrogen || 72;
    const lowN = nLevel < 70;
    return {
      message: `Based on your ${ctx.farm?.name || 'farm'} soil data (Nitrogen: ${nLevel} mg/kg, pH: ${soil?.ph || 6.7}, Moisture: ${soil?.moisture || 68}%), yellowing leaves are most likely caused by ${lowN ? 'nitrogen deficiency' : 'possible fungal pressure or overwatering'}.`,
      causes: lowN
        ? ['Nitrogen deficiency (lower leaves yellow first)', 'Magnesium deficiency', 'Early fungal infection']
        : ['Overwatering or waterlogging', 'Fungal disease (Septoria/Blight)', 'Root rot'],
      actions: lowN
        ? ['Apply 20g urea per plant around root zone', 'Test soil nitrogen — current level is borderline', 'Reduce irrigation frequency to improve uptake', 'Inspect for fungal spots on leaf undersides']
        : ['Reduce irrigation frequency immediately', 'Check drainage around root zone', 'Apply copper-based fungicide', 'Remove and destroy infected leaves'],
    };
  },
  irrigation: (ctx: AIContext) => {
    const moisture = ctx.soilRecord?.moisture || 68;
    const needsWater = moisture < 65;
    return {
      message: `Current soil moisture at ${ctx.farm?.name || 'your farm'} is ${moisture}%. ${needsWater ? 'Irrigation is recommended within the next 6-8 hours.' : 'Moisture levels are adequate — no immediate irrigation needed.'}`,
      causes: needsWater ? ['Moisture below crop threshold', 'High evapotranspiration rate', 'Recent dry spell'] : [],
      actions: needsWater
        ? ['Schedule drip irrigation for 18-20 minutes this evening', 'Target moisture: 72-75%', 'Monitor leaf turgor pressure in morning', 'Check drip emitters for blockage']
        : ['Continue current irrigation schedule', 'Monitor forecast — 18% rain probability reduces irrigation need', 'Check soil moisture in 48 hours'],
    };
  },
  weather: (ctx: AIContext) => ({
    message: `Current weather at ${ctx.farm?.location || ctx.location || 'Coimbatore'}: 29°C, Partly Cloudy, 18% rain probability. Conditions are generally favorable for your Tomato and Chili crops, though the UV index (7) is high — consider morning/evening field operations.`,
    causes: [],
    actions: ['Schedule irrigation before 7 AM or after 6 PM to reduce evaporation', 'High UV — avoid pesticide application midday', 'Rain probability low — proceed with planned operations', 'Monitor temperature for next 3 days'],
  }),
  default: (query: string, ctx: AIContext) => {
    const cropNames = ctx.crops?.map(c => c.name).join(', ') || 'your crops';
    return {
      message: `I've analyzed your query regarding "${query}" in context of ${ctx.farm?.name || 'your farm'} (${cropNames}). Based on current soil conditions and weather data, here are my recommendations:`,
      causes: ['Seasonal variation in crop conditions', 'Soil nutrient balance', 'Microclimate factors at farm location'],
      actions: ['Monitor crop daily for visible stress signs', 'Maintain soil moisture between 65-75%', 'Apply balanced NPK fertilizer per crop schedule', 'Schedule AI analysis for detailed insights'],
    };
  },
};

export function getAIResponse(query: string, ctx: AIContext): { message: string; causes?: string[]; actions?: string[] } {
  const q = query.toLowerCase();
  if (q.includes('yellow') || q.includes('yellowing') || q.includes('pale')) return aiResponses.yellowing(ctx);
  if (q.includes('irrig') || q.includes('water') || q.includes('moisture')) return aiResponses.irrigation(ctx);
  if (q.includes('weather') || q.includes('rain') || q.includes('temperature')) return aiResponses.weather(ctx);
  if (q.includes('disease') || q.includes('spot') || q.includes('blight') || q.includes('rot')) {
    return {
      message: `Disease pressure detected in your query. Based on current humidity (72%) and temperature (29°C) conditions at ${ctx.farm?.location || 'Coimbatore'}, fungal diseases are a moderate risk this season.`,
      causes: ['High ambient humidity favors fungal growth', 'Temperature range supports pathogen activity', 'Dense canopy reduces air circulation'],
      actions: ['Inspect plants early morning for fresh lesions', 'Apply preventive copper-based fungicide every 10-14 days', 'Ensure proper plant spacing for airflow', 'Remove and destroy any infected plant debris immediately'],
    };
  }
  if (q.includes('nutrient') || q.includes('fertiliz') || q.includes('nitrogen') || q.includes('npk')) {
    const soil = ctx.soilRecord;
    return {
      message: `Soil nutrient analysis for ${ctx.farm?.name || 'your farm'}: Nitrogen ${soil?.nitrogen || 72} mg/kg (${(soil?.nitrogen || 72) > 70 ? 'adequate' : 'low'}), Phosphorus ${soil?.phosphorus || 64} mg/kg, Potassium ${soil?.potassium || 81} mg/kg. Overall soil nutrition is moderate.`,
      causes: ['Regular crop uptake depletes soil nutrients', 'Irrigation can leach nitrogen', 'Organic matter decomposition affects P availability'],
      actions: ['Apply top dressing of urea (26 kg N/acre) for Tomato', 'Supplement Phosphorus with DAP near roots', 'Potassium levels are good — maintain current application', 'Consider soil testing every 45 days for precision'],
    };
  }
  return aiResponses.default(query, ctx);
}

export function analyzeCropImage(fileName: string): {
  crop: string; disease: string; confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[]; actions: string[];
} {
  const results = [
    { crop: 'Tomato', disease: 'Early Blight (Alternaria solani)', confidence: 87, severity: 'medium' as const, symptoms: ['Brown circular spots with yellow halos', 'Concentric ring pattern on spots', 'Lower leaf yellowing and drop', 'Lesions starting at leaf margins'], actions: ['Apply Mancozeb 75 WP @ 2g/L every 10 days', 'Remove and destroy infected leaves', 'Avoid overhead irrigation', 'Improve inter-row spacing for better airflow', 'Apply copper oxychloride as preventive treatment'] },
    { crop: 'Rice', disease: 'Rice Blast (Magnaporthe oryzae)', confidence: 91, severity: 'high' as const, symptoms: ['Diamond-shaped lesions with gray centers', 'Brown borders around lesions', 'Lesions on leaves and neck', 'Panicle wilting in severe cases'], actions: ['Apply Tricyclazole 75 WP @ 0.6g/L immediately', 'Maintain 5cm water level in field', 'Reduce nitrogen fertilizer application', 'Avoid excessive irrigation', 'Monitor neighboring fields for spread'] },
    { crop: 'Chili', disease: 'Leaf Curl Virus (CLCV)', confidence: 83, severity: 'high' as const, symptoms: ['Severe upward leaf curling', 'Leaf thickening and brittleness', 'Stunted plant growth', 'Reduced fruit set'], actions: ['Remove and destroy infected plants immediately', 'Control whitefly vectors with imidacloprid', 'Apply reflective mulch to repel insects', 'Plant resistant varieties for next season', 'Rogue out infected plants within 48 hours'] },
    { crop: 'Cotton', disease: 'Healthy Crop', confidence: 94, severity: 'low' as const, symptoms: ['No visible disease symptoms', 'Good leaf color and texture', 'Normal growth pattern', 'Adequate fruit development'], actions: ['Continue current crop management practices', 'Maintain regular irrigation schedule', 'Apply scheduled fertilizer program', 'Monitor for early pest activity weekly'] },
  ];
  return results[Math.floor(Math.random() * results.length)];
}

export function calculateCropSuitability(params: {
  soilType: string; ph: number; nitrogen: number; phosphorus: number;
  potassium: number; temperature: number; rainfall: number; humidity: number;
}) {
  const crops = [
    { name: 'Tomato', optPh: [6.0, 7.0], optTemp: [20, 30], optRain: [600, 1200], optHumid: [60, 80], waterReq: 'Medium-High', period: '90-120 days', conditions: 'Well-drained loamy soil, full sun' },
    { name: 'Chili', optPh: [6.0, 7.5], optTemp: [20, 32], optRain: [600, 900], optHumid: [50, 75], waterReq: 'Medium', period: '90-120 days', conditions: 'Sandy loam, warm dry climate' },
    { name: 'Groundnut', optPh: [5.5, 7.0], optTemp: [22, 33], optRain: [500, 800], optHumid: [45, 70], waterReq: 'Low-Medium', period: '110-130 days', conditions: 'Sandy loam, well-drained' },
    { name: 'Rice', optPh: [5.5, 6.5], optTemp: [20, 35], optRain: [1000, 2000], optHumid: [70, 90], waterReq: 'High', period: '105-150 days', conditions: 'Clay or clay loam, flooded fields' },
    { name: 'Cotton', optPh: [6.0, 8.0], optTemp: [21, 35], optRain: [700, 1200], optHumid: [50, 80], waterReq: 'Medium', period: '150-180 days', conditions: 'Deep black soil, long frost-free season' },
    { name: 'Maize', optPh: [5.8, 7.0], optTemp: [18, 32], optRain: [500, 800], optHumid: [50, 80], waterReq: 'Medium', period: '80-110 days', conditions: 'Well-drained fertile loam' },
  ];

  return crops.map(c => {
    let score = 100;
    const phOk = params.ph >= c.optPh[0] && params.ph <= c.optPh[1];
    const tempOk = params.temperature >= c.optTemp[0] && params.temperature <= c.optTemp[1];
    const rainOk = params.rainfall >= c.optRain[0] && params.rainfall <= c.optRain[1];
    const humidOk = params.humidity >= c.optHumid[0] && params.humidity <= c.optHumid[1];
    if (!phOk) score -= 20;
    if (!tempOk) score -= 20;
    if (!rainOk) score -= 15;
    if (!humidOk) score -= 10;
    const nScore = Math.min(params.nitrogen / 80, 1) * 10;
    const pScore = Math.min(params.phosphorus / 60, 1) * 8;
    const kScore = Math.min(params.potassium / 70, 1) * 7;
    score = Math.min(100, score - 25 + nScore + pScore + kScore);
    const reason = `pH ${phOk ? '✓' : '✗'}, Temperature ${tempOk ? '✓' : '✗'}, Rainfall ${rainOk ? '✓' : '✗'}, Humidity ${humidOk ? '✓' : '✗'}. Soil nutrients: N(${params.nitrogen}), P(${params.phosphorus}), K(${params.potassium}).`;
    return { crop: c.name, suitability: Math.round(Math.max(30, score)), waterRequirement: c.waterReq, growingPeriod: c.period, conditions: c.conditions, reason };
  }).sort((a, b) => b.suitability - a.suitability);
}

export function calculateIrrigation(moisture: number, cropType: string, rainProb: number, temp: number) {
  const thresholds: Record<string, number> = { rice: 75, tomato: 65, chili: 60, groundnut: 58, cotton: 60, default: 62 };
  const threshold = thresholds[cropType.toLowerCase()] || thresholds.default;
  const needsIrrigation = moisture < threshold && rainProb < 50;
  const deficit = Math.max(0, threshold - moisture);
  const duration = needsIrrigation ? Math.round((deficit / threshold) * 30 + 10) : 0;
  const hour = new Date().getHours();
  const bestStart = hour < 12 ? '6:30 AM' : '6:30 PM';
  const endTime = hour < 12 ? '7:00 AM' : '7:00 PM';
  return {
    recommended: needsIrrigation,
    currentMoisture: moisture,
    targetMoisture: threshold + 5,
    rainProbability: rainProb,
    duration,
    bestTime: `${bestStart} – ${endTime}`,
    reason: needsIrrigation
      ? `Soil moisture (${moisture}%) is below the optimal threshold for ${cropType} (${threshold}%). Rain probability is ${rainProb}% — insufficient to meet crop water needs.`
      : `Soil moisture (${moisture}%) is within optimal range for ${cropType}. ${rainProb >= 50 ? `Rain probability is ${rainProb}% — natural rainfall may be sufficient.` : 'No irrigation needed at this time.'}`,
  };
}
