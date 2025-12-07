import React, { useState, useRef } from 'react';
import { Upload, AlertTriangle, CheckCircle, Camera } from 'lucide-react';
import { Card, Button, Loader, Badge } from './Shared';
import { analyzeVisualEvidence } from '../services/geminiService';
import { LogEntry, VisualRisk } from '../types';

interface VisualAuditProps {
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
}

export const VisualAudit: React.FC<VisualAuditProps> = ({ addLog }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<{risks: VisualRisk[], summary: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResults(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!image) return;
    
    setAnalyzing(true);
    addLog({ source: 'SYSTEM', message: 'Initiating Visual Analysis Protocol...', type: 'info' });
    
    try {
      const base64 = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      
      const response = await analyzeVisualEvidence(base64, mimeType);
      
      if (response.risks && response.executiveSummary) {
        setResults({
            risks: response.risks,
            summary: response.executiveSummary.story
        });
        addLog({ source: 'SYSTEM', message: `Analysis Complete: ${response.risks.length} Vectors Identified`, type: 'success' });
      }
    } catch (error) {
      addLog({ source: 'SYSTEM', message: 'Visual Analysis Failed', type: 'error' });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <div className="space-y-6">
        <Card className="h-96 flex flex-col items-center justify-center border-dashed border-2 border-slate-600 hover:border-eco-accent transition-colors relative overflow-hidden group">
          {image ? (
            <img src={image} alt="Site Survey" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          ) : (
            <div className="text-center p-8">
              <Camera size={48} className="mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400 mb-4">Upload Satellite or Drone Imagery</p>
            </div>
          )}
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
              {image ? 'Replace Image' : 'Select Evidence'}
            </Button>
          </div>
        </Card>

        <Button 
          onClick={runAnalysis} 
          disabled={!image || analyzing} 
          className="w-full h-12 text-lg"
        >
          {analyzing ? <><Loader /> Scanning Pattern...</> : 'Execute Visual Audit'}
        </Button>
      </div>

      <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
        {results ? (
          <>
             <Card>
                <h3 className="text-eco-accent font-bold uppercase tracking-wider mb-2">Executive Summary</h3>
                <p className="text-slate-300 leading-relaxed">{results.summary}</p>
             </Card>

             <div className="space-y-3">
                <h3 className="text-slate-400 font-mono text-sm uppercase">Identified Vectors</h3>
                {results.risks.map((risk, idx) => (
                  <div key={idx} className="bg-slate-800 p-4 rounded-lg border-l-4 border-eco-warn flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={14} className="text-eco-warn" />
                        <span className="font-bold text-white text-sm">{risk.category.toUpperCase()}</span>
                        <span className="text-xs text-slate-500 font-mono">ID: {risk.id || `RISK-${idx}`}</span>
                      </div>
                      <p className="text-slate-300 text-sm">{risk.description}</p>
                    </div>
                    <Badge type={risk.severity === 'high' ? 'danger' : 'warn'}>
                      {risk.severity}
                    </Badge>
                  </div>
                ))}
             </div>
          </>
        ) : (
          <Card className="h-full flex flex-col items-center justify-center text-slate-500">
             <div className="animate-pulse-fast mb-4 text-eco-accent opacity-20">
               <Upload size={64} />
             </div>
             <p>Awaiting Visual Input Stream...</p>
          </Card>
        )}
      </div>
    </div>
  );
};