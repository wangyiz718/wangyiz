import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { AnalysisReport, PodcastScript, VisualRisk, RealtimeWeather } from '../types';

// Initialize Gemini
// Note: API Key is accessed via process.env.API_KEY as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helpers
const getModel = (modelName: string = 'gemini-2.5-flash') => {
  return modelName;
};

export const analyzeVisualEvidence = async (
  base64Image: string,
  mimeType: string
): Promise<Partial<AnalysisReport>> => {
  try {
    const modelId = 'gemini-2.5-flash';
    
    const prompt = `
      Perform a Mode A: Visual Audit on this image. 
      1. Identify environmental risks (erosion, wildlife).
      2. Identify infrastructure advantages (roads, grid lines).
      3. Tag every finding as [ARCHIVED_EVIDENCE_ID: <RiskType>].
      
      Return a JSON object with this structure:
      {
        "risks": [
           { "id": "generated_id", "description": "...", "severity": "high|medium|low", "category": "..." }
        ],
        "summary": "Short paragraph analyzing the site visual potential."
      }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    
    return {
      risks: data.risks || [],
      executiveSummary: {
        story: data.summary || "Visual analysis complete.",
        drivers: ["Visual Evidence"],
        systemStatus: "Live Data"
      } as any
    };

  } catch (error) {
    console.error("Visual Audit Error:", error);
    throw error;
  }
};

export const runDeepReasoning = async (
  location: string,
  projectSizeMW: number,
  capex: number,
  realtimeData?: RealtimeWeather
): Promise<AnalysisReport> => {
  try {
    // Use Pro model for reasoning if available, else Flash
    const modelId = 'gemini-2.5-flash'; 

    let weatherContext = "";
    if (realtimeData) {
      weatherContext = `
        LIVE DATA FEED (Source: ${realtimeData.source}):
        - Temp: ${realtimeData.temperature}°C
        - Wind Speed: ${realtimeData.windSpeed} km/h
        - Condition: ${realtimeData.isDay ? 'Daylight' : 'Night'}
        
        NOTE: Use this REAL data for the calculation. Do not simulate weather if this data is present.
      `;
    } else {
      weatherContext = "LIVE DATA OFFLINE. Proceed with Simulation Mode.";
    }

    const prompt = `
      MODE B: DEEP REASONING & ARBITRAGE
      Location: ${location}
      Project Size: ${projectSizeMW} MW
      CapEx: $${capex}

      ${weatherContext}

      TASK:
      1. If live data is present, use it. If not, engage Fail-Safe and simulate.
      2. Calculate financial metrics (NPV, IRR, LCOE) using simulated Pythonic logic.
      3. Perform a Red Team Audit on your own numbers.
      
      OUTPUT JSON format matching the AnalysisReport interface in the code.
      Ensure 'metrics' has numeric values.
      Ensure 'vibeConfig' suggests weather settings based on the data provided.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text) as AnalysisReport;

  } catch (error) {
    console.error("Deep Reasoning Error:", error);
    throw error;
  }
};

export const generatePodcast = async (
  topic: string,
  analysis?: AnalysisReport
): Promise<PodcastScript> => {
  try {
    const context = analysis ? JSON.stringify(analysis.metrics) : "No specific data provided.";
    
    const prompt = `
      MODE D: THE VIBE ENGINE (Podcast Sub-Mode).
      Topic: ${topic}
      Context: ${context}
      
      Generate a script for a debate between an 'Investor (Bull)' and a 'Risk Officer (Bear)'.
      Make it punchy, technical but accessible, and slightly dramatic.
      Return JSON: { "title": "...", "dialogue": [{ "speaker": "...", "text": "..." }] }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    return JSON.parse(response.text || "{}") as PodcastScript;

  } catch (error) {
    console.error("Podcast Gen Error:", error);
    throw error;
  }
};

export const generateComplianceDoc = async (
  analysis: AnalysisReport
): Promise<string> => {
   try {
    const prompt = `
      MODE C: AUTO-COMPLIANCE.
      Based on the following analysis data: ${JSON.stringify(analysis.metrics)}
      
      Generate a Markdown representation of a "Preliminary Environmental & Financial Feasibility Study" form.
      Fill in the fields with the data. Add "Officially Sealed" emojis.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    return response.text || "Compliance generation failed.";
   } catch (error) {
     console.error("Compliance Error:", error);
     throw error;
   }
}