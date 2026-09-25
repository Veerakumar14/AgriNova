import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AppState, User, Farm, Crop, SoilRecord, Notification, AIMessage, CropAnalysis, IrrigationRecommendation } from '../types';
import { generateDemoData } from '../services/demoData';

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_FARMS'; payload: Farm[] }
  | { type: 'ADD_FARM'; payload: Farm }
  | { type: 'UPDATE_FARM'; payload: Farm }
  | { type: 'DELETE_FARM'; payload: string }
  | { type: 'SET_CURRENT_FARM'; payload: string | null }
  | { type: 'SET_CROPS'; payload: Crop[] }
  | { type: 'ADD_CROP'; payload: Crop }
  | { type: 'UPDATE_CROP'; payload: Crop }
  | { type: 'DELETE_CROP'; payload: string }
  | { type: 'SET_SOIL'; payload: SoilRecord[] }
  | { type: 'ADD_SOIL'; payload: SoilRecord }
  | { type: 'UPDATE_SOIL'; payload: SoilRecord }
  | { type: 'DELETE_SOIL'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'ADD_AI_MESSAGE'; payload: AIMessage }
  | { type: 'SET_AI_MESSAGES'; payload: AIMessage[] }
  | { type: 'ADD_CROP_ANALYSIS'; payload: CropAnalysis }
  | { type: 'ADD_IRRIGATION'; payload: IrrigationRecommendation }
  | { type: 'UPDATE_IRRIGATION'; payload: IrrigationRecommendation }
  | { type: 'LOAD_STATE'; payload: AppState };

const initialState: AppState = {
  user: null,
  farms: [],
  currentFarmId: null,
  crops: [],
  soilRecords: [],
  notifications: [],
  aiMessages: [],
  cropAnalyses: [],
  irrigationRecs: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE': return action.payload;
    case 'SET_USER': return { ...state, user: action.payload };
    case 'SET_FARMS': return { ...state, farms: action.payload };
    case 'ADD_FARM': return { ...state, farms: [...state.farms, action.payload] };
    case 'UPDATE_FARM': return { ...state, farms: state.farms.map(f => f.id === action.payload.id ? action.payload : f) };
    case 'DELETE_FARM': return { ...state, farms: state.farms.filter(f => f.id !== action.payload) };
    case 'SET_CURRENT_FARM': return { ...state, currentFarmId: action.payload };
    case 'SET_CROPS': return { ...state, crops: action.payload };
    case 'ADD_CROP': return { ...state, crops: [...state.crops, action.payload] };
    case 'UPDATE_CROP': return { ...state, crops: state.crops.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CROP': return { ...state, crops: state.crops.filter(c => c.id !== action.payload) };
    case 'SET_SOIL': return { ...state, soilRecords: action.payload };
    case 'ADD_SOIL': return { ...state, soilRecords: [action.payload, ...state.soilRecords] };
    case 'UPDATE_SOIL': return { ...state, soilRecords: state.soilRecords.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SOIL': return { ...state, soilRecords: state.soilRecords.filter(s => s.id !== action.payload) };
    case 'SET_NOTIFICATIONS': return { ...state, notifications: action.payload };
    case 'ADD_NOTIFICATION': return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ': return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case 'MARK_ALL_READ': return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    case 'DELETE_NOTIFICATION': return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case 'ADD_AI_MESSAGE': return { ...state, aiMessages: [...state.aiMessages, action.payload] };
    case 'SET_AI_MESSAGES': return { ...state, aiMessages: action.payload };
    case 'ADD_CROP_ANALYSIS': return { ...state, cropAnalyses: [action.payload, ...state.cropAnalyses] };
    case 'ADD_IRRIGATION': return { ...state, irrigationRecs: [action.payload, ...state.irrigationRecs] };
    case 'UPDATE_IRRIGATION': return { ...state, irrigationRecs: state.irrigationRecs.map(r => r.id === action.payload.id ? action.payload : r) };
    default: return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  currentFarm: Farm | null;
  latestSoil: SoilRecord | null;
  farmCrops: Crop[];
  unreadCount: number;
  addNotification: (title: string, message: string, type: Notification['type']) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'agrinova_state';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentFarm = state.farms.find(f => f.id === state.currentFarmId) || state.farms[0] || null;
  const latestSoil = currentFarm ? state.soilRecords.filter(s => s.farmId === currentFarm.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null : null;
  const farmCrops = currentFarm ? state.crops.filter(c => c.farmId === currentFarm.id) : [];
  const unreadCount = state.notifications.filter(n => !n.read && n.userId === state.user?.id).length;

  const addNotification = useCallback((title: string, message: string, type: Notification['type']) => {
    const notif: Notification = {
      id: crypto.randomUUID(),
      userId: state.user?.id || '',
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });
  }, [state.user?.id]);

  const logout = useCallback(() => {
    dispatch({ type: 'LOAD_STATE', payload: { ...initialState } });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, currentFarm, latestSoil, farmCrops, unreadCount, addNotification, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export function seedDemoData(dispatch: React.Dispatch<Action>, userId: string) {
  const demo = generateDemoData(userId);
  dispatch({ type: 'SET_FARMS', payload: demo.farms });
  dispatch({ type: 'SET_CURRENT_FARM', payload: demo.farms[0].id });
  dispatch({ type: 'SET_CROPS', payload: demo.crops });
  dispatch({ type: 'SET_SOIL', payload: demo.soilRecords });
  dispatch({ type: 'SET_NOTIFICATIONS', payload: demo.notifications });
  dispatch({ type: 'SET_AI_MESSAGES', payload: demo.aiMessages });
}
