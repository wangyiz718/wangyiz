import { GeoLocation, RealtimeWeather } from '../types';

// GEOCODING SERVICE
export const resolveLocation = async (query: string): Promise<GeoLocation> => {
  try {
    // Primary: OpenStreetMap Nominatim
    // Added User-Agent to comply with Nominatim policy to avoid blocks
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
        headers: {
            'User-Agent': 'EcoVibe360-Demo/1.0'
        }
    });
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    throw new Error("Location not found");
  } catch (error) {
    console.error("Geocoding failed:", error);
    // Fallback coordinates (Mojave Desert) if geocoding fails completely
    return { lat: 35.0116, lon: -115.4734, display_name: "Mojave Desert (Fallback)" };
  }
};

// HELPER: Get rough bounding box for visualization (Simulated 50km radius box)
export const getBoundingBox = (lat: number, lon: number, radiusKm: number = 50) => {
    // 1 deg lat ~ 111km
    // 1 deg lon ~ 111km * cos(lat)
    const deltaLat = radiusKm / 111;
    const deltaLon = radiusKm / (111 * Math.cos(lat * (Math.PI / 180)));
    
    return {
        minLat: lat - deltaLat,
        maxLat: lat + deltaLat,
        minLon: lon - deltaLon,
        maxLon: lon + deltaLon
    };
};

// WEATHER SERVICE - WATERFALL STRATEGY
export const fetchRealtimeWeather = async (loc: GeoLocation): Promise<RealtimeWeather> => {
  // 1. PRIMARY: OPEN-METEO
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,wind_speed_10m,is_day`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Open-Meteo Unreachable");
    
    const data = await response.json();
    const current = data.current;
    
    return {
      temperature: current.temperature_2m,
      windSpeed: current.wind_speed_10m,
      isDay: current.is_day === 1,
      timestamp: new Date().toISOString(),
      source: 'Open-Meteo',
      location: loc.display_name
    };
  } catch (err) {
    console.warn("Primary API Failed, attempting Secondary...", err);
  }

  // 2. SECONDARY: NWS (USA Only, complex but good backup)
  try {
    // Note: NWS requires User-Agent. Browsers send one, but sometimes it blocks generic ones.
    const pointUrl = `https://api.weather.gov/points/${loc.lat},${loc.lon}`;
    const pointRes = await fetch(pointUrl);
    if (!pointRes.ok) throw new Error("NWS Point Lookup Failed");
    
    const pointData = await pointRes.json();
    const forecastUrl = pointData.properties.forecast;
    
    const forecastRes = await fetch(forecastUrl);
    if (!forecastRes.ok) throw new Error("NWS Forecast Failed");
    
    const forecastData = await forecastRes.json();
    const currentPeriod = forecastData.properties.periods[0];

    return {
      temperature: currentPeriod.temperature,
      windSpeed: parseInt(currentPeriod.windSpeed) || 10, // Parse "10 mph"
      isDay: currentPeriod.isDaytime,
      timestamp: new Date().toISOString(),
      source: 'NWS',
      location: loc.display_name
    };
  } catch (err) {
    console.warn("Secondary API Failed, engaging Simulation Protocol...", err);
  }

  // 3. FINAL FALLBACK: SIMULATION
  // Generate realistic data based on location lat/lon logic
  const isDesert = Math.abs(loc.lat) < 35;
  return {
    temperature: isDesert ? 32 : 15,
    windSpeed: isDesert ? 12 : 25,
    isDay: true,
    timestamp: new Date().toISOString(),
    source: 'Simulation',
    location: loc.display_name
  };
};

export const getRealtimeData = async (locationQuery: string): Promise<RealtimeWeather> => {
  const loc = await resolveLocation(locationQuery);
  return await fetchRealtimeWeather(loc);
};