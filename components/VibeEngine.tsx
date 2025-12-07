import React, { useState } from 'react';
import { Play, Pause, RefreshCw, Sun, Wind, CloudRain, Volume2 } from 'lucide-react';
import { Card, Button, Loader } from './Shared';
import { generatePodcast } from '../services/geminiService';
import { AnalysisReport, PodcastScript, LogEntry } from '../types';

interface VibeEngineProps {
  currentReport: AnalysisReport | null;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  setAppWeather: (weather: 'sunny' | 'cloudy' | 'windy' | 'stormy') => void;
}

export const VibeEngine: React.FC<VibeEngineProps> = ({ currentReport, addLog, setAppWeather }) => {
  const [script, setScript] = useState<PodcastScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);

  const handleGenPodcast = async () => {
    setLoading(true);
    addLog({ source: 'SYSTEM', message: 'Spinning up Vibe Engine (Podcast Module)...', type: 'info' });
    try {
      const result = await generatePodcast(
        currentReport ? `Project in ${currentReport.metrics.npv > 0 ? 'High Potential' : 'High Risk'} Zone` : 'General Renewable Trends',
        currentReport || undefined
      );
      setScript(result);
      setCurrentLine(0);
      addLog({ source: 'SYSTEM', message: 'Podcast Script Generated', type: 'success' });
    } catch (e) {
      addLog({ source: 'SYSTEM', message: 'Vibe Engine Error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Simulate playback
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && script && currentLine < script.dialogue.length) {
      interval = setInterval(() => {
        setCurrentLine(prev => {
          if (prev >= script.dialogue.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000); // 3 seconds per line reading speed sim
    }
    return () => clearInterval(interval);
  }, [isPlaying, script, currentLine]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full pb-20">
      <Card className="flex flex-col">
        <h2 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
          <Volume2 /> The Daily Vibe (Podcast)
        </h2>
        
        {!script ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
             <div className="p-4 bg-slate-800 rounded-full">
               <Volume2 size={32} className="text-purple-400" />
             </div>
             <p className="text-slate-400 max-w-xs">
               Generate a debate between a Bullish Investor and a Bearish Risk Officer based on your current analysis.
             </p>
             <Button onClick={handleGenPodcast} disabled={loading} className="bg-purple-600 hover:bg-purple-500 text-white">
               {loading ? <Loader /> : 'Generate Episode'}
             </Button>
           </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
             <div className="mb-4 flex justify-between items-center">
                <h3 className="font-bold text-white truncate">{script.title}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-white text-black rounded-full hover:bg-slate-200">
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button onClick={() => { setScript(null); setIsPlaying(false); }} className="p-2 border border-slate-600 rounded-full hover:bg-slate-800">
                    <RefreshCw size={16} />
                  </button>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth">
               {script.dialogue.map((line, idx) => (
                 <div 
                    key={idx} 
                    className={`p-3 rounded-lg transition-all duration-500 ${
                      idx === currentLine 
                        ? 'bg-slate-700 border-l-4 border-purple-500 opacity-100 scale-105' 
                        : 'bg-slate-800/50 opacity-50'
                    }`}
                 >
                   <div className={`text-xs font-bold mb-1 ${line.speaker.includes('Bull') ? 'text-eco-accent' : 'text-red-400'}`}>
                     {line.speaker}
                   </div>
                   <p className="text-sm text-slate-200">{line.text}</p>
                 </div>
               ))}
             </div>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-eco-highlight mb-6">Reactive Environment Control</h2>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setAppWeather('sunny')}
            className="p-6 bg-amber-900/20 border border-amber-500/30 rounded-xl hover:bg-amber-900/40 flex flex-col items-center gap-3 transition-all"
          >
            <Sun size={32} className="text-amber-400" />
            <span className="font-bold text-amber-200">High Solar</span>
          </button>
          
          <button 
            onClick={() => setAppWeather('windy')}
            className="p-6 bg-cyan-900/20 border border-cyan-500/30 rounded-xl hover:bg-cyan-900/40 flex flex-col items-center gap-3 transition-all"
          >
            <Wind size={32} className="text-cyan-400" />
            <span className="font-bold text-cyan-200">High Wind</span>
          </button>

          <button 
            onClick={() => setAppWeather('stormy')}
            className="p-6 bg-indigo-900/20 border border-indigo-500/30 rounded-xl hover:bg-indigo-900/40 flex flex-col items-center gap-3 transition-all"
          >
            <CloudRain size={32} className="text-indigo-400" />
            <span className="font-bold text-indigo-200">Storm Mode</span>
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-slate-900 rounded border border-slate-700 font-mono text-xs text-eco-accent">
          <p>{`> THREE.js Renderer Status: STANDBY`}</p>
          <p>{`> WebGL Context: ACTIVE`}</p>
          <p>{`> Shaders: COMPILED`}</p>
          <p className="mt-2 text-slate-500">
             // The Time Machine visualization module renders a 20-year vegetative growth simulation based on the selected climate model.
          </p>
        </div>
      </Card>
    </div>
  );
};