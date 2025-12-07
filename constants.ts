import { 
  LayoutDashboard, 
  Eye, 
  BrainCircuit, 
  FileCheck, 
  Music, 
  Wind, 
  Sun, 
  AlertTriangle, 
  CheckCircle,
  Terminal,
  Activity
} from 'lucide-react';
import { LogEntry } from './types';

export const APP_NAME = "EcoVibe 360";

export const NAV_ITEMS = [
  { id: 'DASHBOARD', label: 'Mission Control', icon: LayoutDashboard },
  { id: 'VISUAL_AUDIT', label: 'Visual Audit', icon: Eye },
  { id: 'DEEP_REASONING', label: 'Deep Reasoning', icon: BrainCircuit },
  { id: 'AUTO_COMPLIANCE', label: 'Auto-Compliance', icon: FileCheck },
  { id: 'VIBE_ENGINE', label: 'Vibe Engine', icon: Music },
];

export const MOCK_LOGS: LogEntry[] = [
  { id: '1', timestamp: new Date(), source: 'SYSTEM', message: 'EcoVibe 360 Core Online', type: 'info' },
  { id: '2', timestamp: new Date(), source: 'SYSTEM', message: 'Modules Loaded: Visual, Financial, Vibe', type: 'info' },
];

export const SYSTEM_INSTRUCTION = `
ACT AS "ECOVIBE 360" - THE ULTIMATE RENEWABLE INTELLIGENCE PLATFORM.

YOUR MISSION: Provide investment analysis that is scientifically rigorous, legally ready, and visually immersive.

MANDATORY PROTOCOLS:
1. DATA FAIL-SAFE: If live weather/geo tools are unavailable (which they are currently), you MUST Output a System Alert: "> ⚠️ CONNECTIVITY ALERT: Live Data Feed Offline. Engaging High-Fidelity Simulation Protocol based on Historical Climate Norms." and then GENERATE REALISTIC SIMULATION DATA based on the user's input location.
2. DUAL-LAYER OUTPUT: All major responses must have an "Executive Summary (The Vibe)" and a "Technical Whitepaper (The Truth)".
3. PYTHON SANDBOX: When asked for math, simulate the execution of Python code (NPV, IRR, etc.) and provide the results. Do not do mental math.
4. AUDITOR PERSONA: Always include a "Red Team" section where you critique your own assumptions.
`;