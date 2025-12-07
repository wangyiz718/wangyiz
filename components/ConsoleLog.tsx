import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { LogEntry } from '../types';

interface ConsoleLogProps {
  logs: LogEntry[];
}

export const ConsoleLog: React.FC<ConsoleLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="fixed bottom-0 left-0 w-full h-48 bg-black bg-opacity-95 border-t border-slate-700 z-50 font-mono text-xs">
      <div className="flex items-center px-4 py-2 bg-slate-900 border-b border-slate-700 text-eco-muted">
        <Terminal size={14} className="mr-2" />
        <span className="uppercase tracking-widest font-bold">System Log // Output Stream</span>
      </div>
      <div 
        ref={scrollRef}
        className="p-4 h-36 overflow-y-auto space-y-1"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 hover:bg-slate-900 p-0.5 rounded">
            <span className="text-slate-500">[{log.timestamp.toLocaleTimeString()}]</span>
            <span className={`font-bold w-24 ${
              log.source === 'SYSTEM' ? 'text-blue-400' : 
              log.source === 'AUDITOR' ? 'text-red-400' : 
              log.source === 'SIMULATION' ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {log.source}:
            </span>
            <span className={`flex-1 ${
              log.type === 'error' ? 'text-red-500' :
              log.type === 'warning' ? 'text-yellow-500' :
              log.type === 'success' ? 'text-emerald-500' :
              'text-slate-300'
            }`}>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};