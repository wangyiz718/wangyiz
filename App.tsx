import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Eye, 
  BrainCircuit, 
  FileCheck, 
  Music, 
  Leaf,
  Settings,
  Wifi,
  WifiOff,
  Activity,
  MapPin,
  Thermometer,
  Wind
} from 'lucide-react';
import { ConsoleLog } from './components/ConsoleLog';
import { VisualAudit } from './components/VisualAudit';
import { DeepReasoning } from './components/DeepReasoning';
import { VibeEngine } from './components/VibeEngine';
import { DigitalGlobe } from './components/DigitalGlobe';
import { Card, Button, Loader } from './components/Shared';
import { generateComplianceDoc } from './services/geminiService';
import { useRealtimeData } from './hooks/useRealtimeData';
import { APP_NAME, NAV_ITEMS, MOCK_LOGS } from './constants';
import { LogEntry, AppMode, AnalysisReport, GeoLocation } from './types';

function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [activeReport, setActiveReport] = useState<AnalysisReport | null>(null);
  const [weather, setWeather] = useState<'sunny' | 'cloudy' | 'windy' | 'stormy'>('sunny');
  const [complianceDoc, setComplianceDoc] = useState<string>('');
  const [complianceLoading, setComplianceLoading] = useState(false);
  const [targetLocation, setTargetLocation] = useState("Mojave Desert");

  // Hook for Mission Control Data
  const { weather: realWeather, loading: weatherLoading, logs: weatherLogs } = useRealtimeData(targetLocation);

  // Sync logs from hook to main console
  useEffect(() => {
    if (weatherLogs.length > 0) {
      setLogs(prev => [...prev, ...weatherLogs]);
    }
  }, [weatherLogs]);

  // Background effects based on weather (only if not in Dashboard mode which uses Globe)
  const bgGradient = 
    weather === 'sunny' ? 'bg-gradient-to-br from-amber-900/10 via-slate-900 to-slate-900' :
    weather === 'windy' ? 'bg-gradient-to-br from-cyan-900/10 via-slate-900 to-slate-900' :
    weather === 'stormy' ? 'bg-gradient-to-br from-indigo-900/20 via-slate-900 to-slate-900' :
    'bg-slate-900';

  const addLog = (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleGlobeSelection = (loc: GeoLocation) => {
     setTargetLocation(loc.display_name);
     addLog({ source: 'USER', message: `Target Acquired: ${loc.display_name}`, type: 'success' });
     // Optional: Auto switch to analysis if user wants, but for now stay in dashboard to see telemetry
  };

  const generateDoc = async () => {
    if (!activeReport) return;
    setComplianceLoading(true);
    addLog({ source: 'SYSTEM', message: 'Generating Official Compliance Documentation...', type: 'info' });
    try {
      const doc = await generateComplianceDoc(activeReport);
      setComplianceDoc(doc);
      addLog({ source: 'SYSTEM', message: 'Compliance Document Sealed & Ready', type: 'success' });
    } catch (e) {
      addLog({ source: 'SYSTEM', message: 'Doc Generation Failed', type: 'error' });
    } finally {
      setComplianceLoading(false);
    }
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden text-slate-100 font-sans ${bgGradient} transition-all duration-1000`}>
      
      {/* Sidebar */}
      <nav className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between hidden md:flex z-20">
        <div>
          <div className="p-6 flex items-center gap-3 text-eco-accent border-b border-slate-800">
            <Leaf size={28} />
            <div>
              <h1 className="font-bold text-lg tracking-wider leading-none">ECOVIBE</h1>
              <span className="text-xs text-slate-500 font-mono tracking-widest">INTELLIGENCE</span>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setMode(item.id as AppMode)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  mode === item.id 
                    ? 'bg-eco-accent text-slate-900 font-bold shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-600 font-mono text-center">
          V.3.1.2 // REAL-TIME
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 h-full">
        
        {/* Mobile Header */}
        <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between z-20 relative">
           <div className="flex items-center gap-2 text-eco-accent">
             <Leaf size={24} />
             <span className="font-bold">EcoVibe</span>
           </div>
           <Settings size={20} className="text-slate-500" />
        </div>

        {/* Dynamic View Area */}
        <div className="flex-1 overflow-hidden relative">
          
          {mode === AppMode.DASHBOARD ? (
             // DASHBOARD MODE: FULL SCREEN GLOBE WITH HUD
             <div className="w-full h-full relative">
                <DigitalGlobe onLocationSelect={handleGlobeSelection} />
                
                {/* HUD Overlay - Telemetry */}
                <div className="absolute top-6 right-6 w-80 pointer-events-none">
                   <Card className="pointer-events-auto bg-slate-950/80 backdrop-blur-md border-eco-highlight/30">
                      <h3 className="font-bold text-slate-400 mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14} /> Live Telemetry
                      </h3>
                      
                      {weatherLoading ? (
                        <div className="flex items-center gap-2 text-slate-500 text-sm"><Loader /> Uplink Established...</div>
                      ) : realWeather ? (
                        <div className="space-y-4">
                          
                          {/* Connection Status */}
                          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                             <div className="flex items-center gap-2">
                               <Wifi size={14} className="text-emerald-500" />
                               <span className="text-xs text-emerald-400">{realWeather.source}</span>
                             </div>
                             <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                               realWeather.source === 'Simulation' ? 'bg-red-900 text-red-400' : 'bg-emerald-900 text-emerald-400'
                             }`}>
                               {realWeather.source === 'Simulation' ? 'SIMULATED' : 'LIVE FEED'}
                             </span>
                          </div>

                          {/* Live Metrics */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-900 p-2 rounded border border-slate-800">
                              <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                                <Thermometer size={12} /> Temp
                              </div>
                              <div className="text-lg font-bold">{realWeather.temperature}°C</div>
                            </div>
                            <div className="bg-slate-900 p-2 rounded border border-slate-800">
                              <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                                <Wind size={12} /> Wind
                              </div>
                              <div className="text-lg font-bold">{realWeather.windSpeed} km/h</div>
                            </div>
                          </div>

                          {/* Lat/Lon Display */}
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono border-t border-slate-800 pt-2">
                             <MapPin size={12} />
                             <span className="truncate">{realWeather.location}</span>
                          </div>

                          <Button 
                            className="w-full text-xs" 
                            variant="primary"
                            onClick={() => setMode(AppMode.DEEP_REASONING)}
                          >
                            Analyze This Site
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-400">
                          <WifiOff size={14} /> Signal Lost
                        </div>
                      )}
                   </Card>
                </div>
             </div>
          ) : (
             // OTHER MODES: STANDARD PADDING LAYOUT
             <div className="h-full p-6 flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                        {NAV_ITEMS.find(n => n.id === mode)?.label}
                        </h2>
                        <p className="text-slate-500 text-sm">
                        {mode === AppMode.DEEP_REASONING ? `Analysing: ${targetLocation}` : 'Active Workspace'}
                        </p>
                    </div>
                 </div>

                 <div className="flex-1 overflow-hidden">
                    {mode === AppMode.VISUAL_AUDIT && (
                    <VisualAudit addLog={addLog} />
                    )}

                    {mode === AppMode.DEEP_REASONING && (
                    <DeepReasoning 
                        addLog={addLog} 
                        initialLocation={targetLocation}
                        onAnalysisComplete={(report) => {
                        setActiveReport(report);
                        if (report.vibeConfig?.weather) {
                            setWeather(report.vibeConfig.weather);
                        }
                        }} 
                    />
                    )}

                    {mode === AppMode.VIBE_ENGINE && (
                    <VibeEngine 
                        currentReport={activeReport} 
                        addLog={addLog} 
                        setAppWeather={setWeather} 
                    />
                    )}

                    {mode === AppMode.AUTO_COMPLIANCE && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full pb-20 overflow-y-auto">
                        <Card>
                        <h3 className="font-bold text-lg mb-4">Compliance Generator</h3>
                        {activeReport ? (
                            <div className="space-y-4">
                            <div className="p-4 bg-slate-800 rounded border border-slate-700">
                                <div className="text-xs text-slate-500 uppercase">Data Source</div>
                                <div className="font-mono text-eco-accent">Active Simulation Data (ID: {Math.random().toString(36).substr(2,6).toUpperCase()})</div>
                            </div>
                            <Button onClick={generateDoc} disabled={complianceLoading} className="w-full">
                                {complianceLoading ? <Loader /> : 'Generate EIA-860 Form'}
                            </Button>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-slate-500">
                            Please run a Deep Reasoning analysis first.
                            </div>
                        )}
                        </Card>
                        <Card className="font-mono text-sm bg-slate-950 text-slate-300">
                        {complianceDoc ? (
                            <pre className="whitespace-pre-wrap">{complianceDoc}</pre>
                        ) : (
                            <div className="flex items-center justify-center h-full opacity-20">
                            <FileCheck size={64} />
                            </div>
                        )}
                        </Card>
                    </div>
                    )}
                 </div>
             </div>
          )}
        </div>

        {/* Console Log Overlay */}
        <ConsoleLog logs={logs} />
      </main>
    </div>
  );
}

export default App;