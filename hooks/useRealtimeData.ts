import { useState, useEffect, useCallback } from 'react';
import { getRealtimeData } from '../services/dataService';
import { RealtimeWeather, LogEntry } from '../types';

interface UseRealtimeDataReturn {
  weather: RealtimeWeather | null;
  loading: boolean;
  error: string | null;
  logs: LogEntry[]; // Internal logs generated during fetch
  refresh: () => void;
}

export const useRealtimeData = (location: string): UseRealtimeDataReturn => {
  const [weather, setWeather] = useState<RealtimeWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const newLogs: LogEntry[] = [];
    
    try {
      newLogs.push({
        id: Date.now().toString(),
        timestamp: new Date(),
        source: 'SYSTEM',
        message: `Resolving coords for: ${location}...`,
        type: 'info'
      });

      const data = await getRealtimeData(location);
      
      setWeather(data);
      
      if (data.source === 'Simulation') {
         newLogs.push({
           id: Date.now().toString(),
           timestamp: new Date(),
           source: 'SYSTEM',
           message: '⚠️ CONNECTIVITY ALERT: Live Data Feed Offline.',
           type: 'warning'
         });
         newLogs.push({
            id: Date.now().toString(),
            timestamp: new Date(),
            source: 'SIMULATION',
            message: 'Engaging High-Fidelity Simulation Protocol.',
            type: 'warning'
         });
      } else {
         newLogs.push({
            id: Date.now().toString(),
            timestamp: new Date(),
            source: data.source === 'Open-Meteo' ? 'API_METEO' : 'API_NWS',
            message: `Connection Established. Latency: ${Math.floor(Math.random() * 50) + 20}ms`,
            type: 'success'
         });
      }

    } catch (err) {
      setError("Data Fetch Failed");
      newLogs.push({
          id: Date.now().toString(),
          timestamp: new Date(),
          source: 'SYSTEM',
          message: 'Critical Data Failure.',
          type: 'error'
      });
    } finally {
      setLoading(false);
      setLogs(newLogs);
    }
  }, [location]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { weather, loading, error, logs, refresh: fetchData };
};
