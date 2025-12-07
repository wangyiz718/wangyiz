import React, { useState, useEffect, useRef } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { Search, MapPin, Minimize, Maximize } from 'lucide-react';
import { ToggleSwitch, Button, Loader } from './Shared';
import { resolveLocation } from '../services/dataService';
import { GeoLocation } from '../types';

interface DigitalGlobeProps {
  onLocationSelect: (loc: GeoLocation) => void;
}

export const DigitalGlobe: React.FC<DigitalGlobeProps> = ({ onLocationSelect }) => {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'POINT' | 'AREA'>('POINT');
  const [selectedPoint, setSelectedPoint] = useState<{lat: number, lng: number, label: string} | null>(null);
  const [rings, setRings] = useState<any[]>([]);

  // Initialize globe view
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery) return;
    
    setSearching(true);
    try {
      const loc = await resolveLocation(searchQuery);
      
      // Stop rotation and fly to location
      if (globeEl.current) {
        globeEl.current.controls().autoRotate = false;
        globeEl.current.pointOfView({ lat: loc.lat, lng: loc.lon, altitude: 0.5 }, 2000);
      }

      handleSelect(loc.lat, loc.lon, loc.display_name);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setSearching(false);
    }
  };

  const handleGlobeClick = ({ lat, lng }: { lat: number, lng: number }) => {
    if (globeEl.current) {
        globeEl.current.controls().autoRotate = false;
    }
    const label = `Lat: ${lat.toFixed(2)}, Lon: ${lng.toFixed(2)}`;
    handleSelect(lat, lng, label);
  };

  const handleSelect = (lat: number, lon: number, label: string) => {
    setSelectedPoint({ lat, lng: lon, label });
    
    if (selectionMode === 'AREA') {
        // Draw expanding rings for area
        setRings([{ lat, lng: lon, maxR: 10, propagationSpeed: 2, repeatPeriod: 1000 }]);
    } else {
        setRings([]);
    }

    // Propagate up to app
    onLocationSelect({
        lat,
        lon,
        display_name: label
    });
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
      {/* 3D Globe Render */}
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        atmosphereColor="rgba(0,255,200,0.5)"
        atmosphereAltitude={0.2}
        onGlobeClick={handleGlobeClick}
        // Markers (Pins)
        htmlElementsData={selectionMode === 'POINT' && selectedPoint ? [selectedPoint] : []}
        htmlElement={(d: any) => {
          const el = document.createElement('div');
          el.innerHTML = `
            <div style="color: #10b981; transform: translate(-50%, -100%); display: flex; flex-direction: column; items-align: center;">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
          `;
          return el;
        }}
        // Rings (Area)
        ringsData={rings}
        ringColor={() => '#3b82f6'}
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
      />

      {/* Input Overlay */}
      <div className="absolute top-6 left-6 z-10 w-80 space-y-4 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2 mb-3 text-eco-accent font-mono text-sm uppercase tracking-widest">
            <Search size={14} /> Global Target Acquisition
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter location or coords..."
              className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:border-eco-accent outline-none"
            />
            <button 
                type="submit" 
                disabled={searching}
                className="bg-eco-highlight hover:bg-blue-600 text-white p-1.5 rounded"
            >
                {searching ? <Loader /> : <Search size={16} />}
            </button>
          </form>

          <div className="flex justify-between items-center">
            <ToggleSwitch 
                options={[
                    { label: 'POINT', value: 'POINT' },
                    { label: 'AREA', value: 'AREA' }
                ]}
                selected={selectionMode}
                onChange={(val) => setSelectionMode(val as 'POINT' | 'AREA')}
            />
            <div className="text-xs text-slate-500 font-mono">
                {selectedPoint ? 
                    `${selectedPoint.lat.toFixed(2)}, ${selectedPoint.lng.toFixed(2)}` 
                    : 'NO TARGET'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative HUD Elements */}
      <div className="absolute top-6 right-6 z-0 pointer-events-none opacity-50">
         <div className="border border-eco-accent/30 p-2 rounded text-eco-accent font-mono text-xs">
            GLOBE STATUS: ONLINE<br/>
            RENDERER: WEBGL<br/>
            FPS: 60
         </div>
      </div>
    </div>
  );
};