import React from 'react';
import type { Restroom } from '../lib/supabase';
import type { Coordinates } from '../lib/geolocation';

interface MapViewProps {
  restrooms: Restroom[];
  userLocation: Coordinates | null;
  onRestroomSelect: (restroom: Restroom) => void;
}

export function MapView({ restrooms, userLocation, onRestroomSelect }: MapViewProps) {
  const mapBounds = {
    minLat: Math.min(...restrooms.map(r => r.latitude), userLocation?.latitude || 0) - 0.01,
    maxLat: Math.max(...restrooms.map(r => r.latitude), userLocation?.latitude || 0) + 0.01,
    minLon: Math.min(...restrooms.map(r => r.longitude), userLocation?.longitude || 0) - 0.01,
    maxLon: Math.max(...restrooms.map(r => r.longitude), userLocation?.longitude || 0) + 0.01,
  };

  const latRange = mapBounds.maxLat - mapBounds.minLat;
  const lonRange = mapBounds.maxLon - mapBounds.minLon;

  const getPosition = (lat: number, lon: number) => {
    const x = ((lon - mapBounds.minLon) / lonRange) * 100;
    const y = ((mapBounds.maxLat - lat) / latRange) * 100;
    return { x: `${x}%`, y: `${y}%` };
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-emerald-50 via-sky-50 to-cyan-50 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        {[...Array(10)].map((_, i) => (
          <div key={`h-${i}`} className="absolute w-full border-t border-gray-300" style={{ top: `${i * 10}%` }} />
        ))}
        {[...Array(10)].map((_, i) => (
          <div key={`v-${i}`} className="absolute h-full border-l border-gray-300" style={{ left: `${i * 10}%` }} />
        ))}
      </div>

      {restrooms.map((restroom) => {
        const pos = getPosition(restroom.latitude, restroom.longitude);
        return (
          <button
            key={restroom.id}
            onClick={() => onRestroomSelect(restroom)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 hover:scale-125 transition-transform"
            style={{ left: pos.x, top: pos.y }}
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 shadow-lg flex items-center justify-center text-white font-bold text-xs border-2 border-white">
                {restroom.rating >= 4.5 ? '⭐' : '🚽'}
              </div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-sky-500" />
            </div>
          </button>
        );
      })}

      {userLocation && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{
            left: getPosition(userLocation.latitude, userLocation.longitude).x,
            top: getPosition(userLocation.latitude, userLocation.longitude).y
          }}
        >
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping" />
          </div>
        </div>
      )}

      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
        {restrooms.length} restrooms nearby
      </div>
    </div>
  );
}
