import type { Farm, Crop, SoilRecord, Notification, AIMessage } from '../types';

export function generateDemoData(userId: string) {
  const farmId = 'demo-farm-1';
  const now = new Date();

  const farms: Farm[] = [{
    id: farmId,
    userId,
    name: 'Green Valley Farm',
    location: 'Coimbatore, Tamil Nadu',
    size: '12',
    sizeUnit: 'acres',
    irrigationMethod: 'Drip Irrigation',
    farmingType: 'Organic',
    createdAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
  }];

  const crops: Crop[] = [
    { id: 'crop-1', farmId, name: 'Tomato', plantingDate: '2024-11-15', expectedHarvest: '2025-02-20', area: '4', health: 92, status: 'growing' },
    { id: 'crop-2', farmId, name: 'Rice', plantingDate: '2024-10-01', expectedHarvest: '2025-01-30', area: '5', health: 84, status: 'growing' },
    { id: 'crop-3', farmId, name: 'Chili', plantingDate: '2024-12-01', expectedHarvest: '2025-03-15', area: '3', health: 78, status: 'growing' },
  ];

  const soilRecords: SoilRecord[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now.getTime() - (29 - i) * 86400000);
    const base = { ph: 6.7, nitrogen: 72, phosphorus: 64, potassium: 81, moisture: 68 };
    const noise = () => (Math.random() - 0.5) * 6;
    return {
      id: `soil-${i}`,
      farmId,
      ph: parseFloat((base.ph + (Math.random() - 0.5) * 0.4).toFixed(1)),
      nitrogen: Math.round(base.nitrogen + noise()),
      phosphorus: Math.round(base.phosphorus + noise()),
      potassium: Math.round(base.potassium + noise()),
      moisture: Math.round(base.moisture + noise()),
      soilType: 'Red Loamy Soil',
      date: d.toISOString(),
      healthScore: Math.round(80 + noise()),
    };
  });

  const notifications: Notification[] = [
    { id: 'n1', userId, title: 'Soil Moisture Alert', message: 'Soil moisture in Tomato field dropped to 62%. Irrigation recommended.', type: 'warning', read: false, createdAt: new Date(now.getTime() - 2 * 3600000).toISOString() },
    { id: 'n2', userId, title: 'AI Analysis Complete', message: 'Crop health analysis for Green Valley Farm is ready. View insights.', type: 'success', read: false, createdAt: new Date(now.getTime() - 5 * 3600000).toISOString() },
    { id: 'n3', userId, title: 'Weather Alert', message: 'Rain probability increases to 65% tomorrow. Adjust irrigation schedule.', type: 'info', read: false, createdAt: new Date(now.getTime() - 8 * 3600000).toISOString() },
    { id: 'n4', userId, title: 'Irrigation Scheduled', message: 'Drip irrigation scheduled for 6:30 PM - 7:00 PM today for Tomato field.', type: 'success', read: true, createdAt: new Date(now.getTime() - 24 * 3600000).toISOString() },
    { id: 'n5', userId, title: 'Crop Health Update', message: 'Chili crop health improved from 72% to 78% after applying recommended nutrients.', type: 'success', read: true, createdAt: new Date(now.getTime() - 48 * 3600000).toISOString() },
  ];

  const aiMessages: AIMessage[] = [
    {
      id: 'ai-1',
      conversationId: 'conv-1',
      sender: 'ai',
      message: 'Hello! I\'m your AgriNova AI Farm Advisor. I have access to your Green Valley Farm data — including your Tomato, Rice, and Chili crops, soil readings, and local weather for Coimbatore. How can I help you today?',
      timestamp: new Date(now.getTime() - 86400000).toISOString(),
    },
    {
      id: 'ai-2',
      conversationId: 'conv-1',
      sender: 'user',
      message: 'My tomato leaves are turning yellow at the bottom.',
      timestamp: new Date(now.getTime() - 86000000).toISOString(),
    },
    {
      id: 'ai-3',
      conversationId: 'conv-1',
      sender: 'ai',
      message: 'Based on your soil data (Nitrogen: 72 mg/kg, pH: 6.7) and current moisture levels, yellowing of lower tomato leaves is most likely related to nitrogen deficiency or early Septoria leaf spot — both common in your region during this season.',
      timestamp: new Date(now.getTime() - 85900000).toISOString(),
      causes: ['Nitrogen deficiency (lower leaves yellow first)', 'Septoria leaf spot (fungal)', 'Overwatering stress'],
      actions: ['Apply 20g urea per plant around root zone', 'Inspect lower leaves for brown spots with yellow halo', 'Reduce irrigation frequency — current moisture is at 68%', 'Apply copper-based fungicide if spots are present'],
    },
  ];

  return { farms, crops, soilRecords, notifications, aiMessages };
}

export function generateWeatherData(location: string) {
  const conditions = ['Partly Cloudy', 'Sunny', 'Overcast', 'Light Rain', 'Clear'];
  const forecast = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString(),
      tempHigh: 28 + Math.round((Math.random() - 0.5) * 6),
      tempLow: 20 + Math.round((Math.random() - 0.5) * 4),
      rainProbability: Math.round(Math.random() * 60),
      condition: conditions[Math.floor(Math.random() * conditions.length)],
    };
  });
  return {
    temperature: 29,
    humidity: 72,
    windSpeed: 14,
    rainProbability: 18,
    uvIndex: 7,
    visibility: 10,
    condition: 'Partly Cloudy',
    location,
    forecast,
  };
}

export function generateAnalyticsData(days: number) {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now.getTime() - (days - 1 - i) * 86400000);
    return {
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      cropHealth: 75 + Math.round(Math.sin(i / 4) * 10 + Math.random() * 5),
      soilHealth: 78 + Math.round(Math.cos(i / 5) * 8 + Math.random() * 4),
      waterUsage: 120 + Math.round(Math.sin(i / 3) * 30 + Math.random() * 20),
      farmHealth: 82 + Math.round(Math.sin(i / 6) * 8 + Math.random() * 4),
    };
  });
}
