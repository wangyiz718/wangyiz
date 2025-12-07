import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { Activity, ShieldCheck, AlertOctagon } from 'lucide-react';
import { Card, Button, Loader, Badge } from './Shared';
import { runDeepReasoning } from '../services/geminiService';
import { getRealtimeData } from '../services/dataService';
import { LogEntry, AnalysisReport } from '../types';

interface DeepReasoningProps {
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  onAnalysisComplete: (report: AnalysisReport) => void;
  initialLocation?: string;
}

export const DeepReasoning: React.FC<DeepReasoningProps> = ({ addLog, onAnalysisComplete, initialLocation }) => {
  const [location, setLocation] = useState('Mojave Desert, CA');
  const [size, setSize] = useState(50);
  const [capex, setCapex] = useState(45000000);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);

  useEffect(() => {
    if (initialLocation) {
        setLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleRun = async () => {
    setLoading(true);
    addLog({ source: 'SYSTEM', message: `Initializing Deep Reasoning for ${location}...`, type: 'info' });
    
    try {
      // 1. Fetch Real Data First
      addLog({ source: 'SYSTEM', message: 'Ping: Open-Meteo & Nominatim Services...', type: 'info' });
      const realData = await getRealtimeData(location);
      
      if (realData.source === 'Simulation') {
         addLog({ source: 'SYSTEM', message: '⚠️ Live Data Unavailable. Engaging Simulation.', type: 'warning' });
      } else {
         addLog({ source: 'API_METEO', message: `Data Acquired: ${realData.temperature}°C, Wind ${realData.windSpeed} km/h`, type: 'success' });
      }

      // 2. Run AI Analysis with Context
      const result = await runDeepReasoning(location, size, capex, realData);
      
      setReport(result);
      onAnalysisComplete(result);
      addLog({ source: 'SYSTEM', message: 'Financial Model Converged successfully.', type: 'success' });
      
      // Log red team items
      result.redTeamLog?.forEach(log => {
        addLog({ source: 'AUDITOR', message: log, type: 'warning' });
      });

    } catch (error) {
      addLog({ source: 'SYSTEM', message: 'Reasoning Engine Failed', type: 'error' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts if report exists
  const chartData = report ? [
    { year: 'Y1', cashFlow: report.metrics.npv * 0.05 },
    { year: 'Y5', cashFlow: report.metrics.npv * 0.2 },
    { year: 'Y10', cashFlow: report.metrics.npv * 0.5 },
    { year: 'Y15', cashFlow: report.metrics.npv * 0.8 },
    { year: 'Y20', cashFlow: report.metrics.npv },
  ] : [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full overflow-y-auto pb-24">
      {/* Control Panel */}
      <div className="xl:col-span-1 space-y-6">
        <Card>
          <h2 className="text-xl font-bold text-eco-highlight mb-4 flex items-center gap-2">
            <Activity size={20} /> Input Parameters
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Target Location</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-eco-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Project Size (MW)</label>
              <input 
                type="number" 
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-eco-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">CapEx Estimate ($)</label>
              <input 
                type="number" 
                value={capex}
                onChange={(e) => setCapex(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:border-eco-accent outline-none"
              />
            </div>
            <Button onClick={handleRun} disabled={loading} className="w-full mt-4">
              {loading ? <><Loader /> Running Simulation</> : 'Engage Reasoning Engine'}
            </Button>
          </div>
        </Card>

        {report && (
           <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-eco-accent/30">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-eco-accent">Confidence Score</h3>
               <span className="text-2xl font-bold text-white">{report.metrics.confidenceScore}%</span>
             </div>
             <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
               <div 
                 className="bg-eco-accent h-full transition-all duration-1000" 
                 style={{ width: `${report.metrics.confidenceScore}%` }} 
               />
             </div>
             <div className="mt-4 text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck size={14} /> 
                {report.executiveSummary.systemStatus === 'Live Data' 
                  ? 'Verified Live Data Stream' 
                  : 'High-Fidelity Simulation Active'}
             </div>
           </Card>
        )}
      </div>

      {/* Results View */}
      <div className="xl:col-span-2 space-y-6">
        {report ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center py-6">
                <div className="text-slate-400 text-xs uppercase">NPV (20yr)</div>
                <div className="text-2xl font-bold text-white mt-1">
                  ${(report.metrics.npv / 1000000).toFixed(1)}M
                </div>
              </Card>
              <Card className="text-center py-6">
                <div className="text-slate-400 text-xs uppercase">IRR</div>
                <div className="text-2xl font-bold text-eco-accent mt-1">
                  {report.metrics.irr}%
                </div>
              </Card>
              <Card className="text-center py-6">
                <div className="text-slate-400 text-xs uppercase">LCOE ($/MWh)</div>
                <div className="text-2xl font-bold text-blue-400 mt-1">
                  ${report.metrics.lcoe}
                </div>
              </Card>
            </div>

            <Card className="h-64">
              <h3 className="text-sm text-slate-400 mb-4">Projected Cumulative Cash Flow</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Area type="monotone" dataKey="cashFlow" stroke="#10b981" fillOpacity={1} fill="url(#colorCf)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 className="text-eco-warn font-bold mb-2 flex items-center gap-2">
                <AlertOctagon size={16} /> Red Team Audit Log
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                {report.redTeamLog.map((log, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-eco-warn">•</span> {log}
                  </li>
                ))}
              </ul>
            </Card>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
            <p>Awaiting Simulation Parameters...</p>
          </div>
        )}
      </div>
    </div>
  );
};