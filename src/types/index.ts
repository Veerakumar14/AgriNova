export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  farmSize: string;
  primaryCrop: string;
  createdAt: string;
  onboardingComplete: boolean;
  darkMode: boolean;
  notifications: { email: boolean; push: boolean; sms: boolean };
}

export interface Farm {
  id: string;
  userId: string;
  name: string;
  location: string;
  size: string;
  sizeUnit: string;
  irrigationMethod: string;
  farmingType: string;
  createdAt: string;
}

export interface Crop {
  id: string;
  farmId: string;
  name: string;
  plantingDate: string;
  expectedHarvest: string;
  area: string;
  health: number;
  status: 'growing' | 'harvested' | 'planned' | 'at-risk';
}

export interface SoilRecord {
  id: string;
  farmId: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  moisture: number;
  soilType: string;
  date: string;
  healthScore?: number;
}

export interface WeatherRecord {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  uvIndex: number;
  visibility: number;
  condition: string;
  location: string;
  forecast: ForecastDay[];
}

export interface ForecastDay {
  date: string;
  tempHigh: number;
  tempLow: number;
  rainProbability: number;
  condition: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
  createdAt: string;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
  suggestions?: string[];
  causes?: string[];
  actions?: string[];
}

export interface CropAnalysis {
  id: string;
  farmId: string;
  imageUrl?: string;
  crop: string;
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  actions: string[];
  analyzedAt: string;
}

export interface IrrigationRecommendation {
  id: string;
  farmId: string;
  currentMoisture: number;
  targetMoisture: number;
  rainProbability: number;
  recommendedDuration: number;
  bestTime: string;
  status: 'recommended' | 'scheduled' | 'completed' | 'dismissed';
  scheduledAt?: string;
  createdAt: string;
}

export interface CropRecommendation {
  crop: string;
  suitability: number;
  waterRequirement: string;
  growingPeriod: string;
  conditions: string;
  reason: string;
}

export interface AppState {
  user: User | null;
  farms: Farm[];
  currentFarmId: string | null;
  crops: Crop[];
  soilRecords: SoilRecord[];
  notifications: Notification[];
  aiMessages: AIMessage[];
  cropAnalyses: CropAnalysis[];
  irrigationRecs: IrrigationRecommendation[];
}
