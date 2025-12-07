export interface LogEntry {
  id: string;
  timestamp: Date;
  source: 'SYSTEM' | 'AUDITOR' | 'SIMULATION' | 'USER' | 'API_METEO' | 'API_NWS';
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface InvestmentMetrics {
  npv: number;
  irr: number;
  paybackPeriod: number;
  capacityFactor: number;
  lcoe: number; // Levelized Cost of Energy
  confidenceScore: number;
}

export interface VisualRisk {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: 'environmental' | 'infrastructure' | 'regulatory';
  coordinates?: string;
  imageUrl?: string; // For archived evidence
}

export interface AnalysisReport {
  executiveSummary: {
    story: string;
    drivers: string[];
    systemStatus: 'Live Data' | 'Simulation Mode';
  };
  metrics: InvestmentMetrics;
  risks: VisualRisk[];
  redTeamLog: string[];
  vibeConfig: {
    weather: 'sunny' | 'cloudy' | 'windy' | 'stormy';
    intensity: 'low' | 'medium' | 'high';
  };
  technicalWhitepaper: string; // Markdown
}

export interface PodcastScript {
  title: string;
  dialogue: Array<{
    speaker: 'Investor (Bull)' | 'Risk Officer (Bear)';
    text: string;
  }>;
}

export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  VISUAL_AUDIT = 'VISUAL_AUDIT',
  DEEP_REASONING = 'DEEP_REASONING',
  AUTO_COMPLIANCE = 'AUTO_COMPLIANCE',
  VIBE_ENGINE = 'VIBE_ENGINE'
}

export interface GeoLocation {
  lat: number;
  lon: number;
  display_name: string;
}

export interface RealtimeWeather {
  temperature: number;
  windSpeed: number;
  isDay: boolean;
  timestamp: string;
  source: 'Open-Meteo' | 'NWS' | 'Simulation';
  location: string;
}
