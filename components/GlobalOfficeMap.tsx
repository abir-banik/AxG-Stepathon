import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import { Team, User } from '../types';
import { GLOBAL_STEP_GOAL, STEPS_PER_MILE, ACCENTURE_GLOBAL_OFFICES } from '../constants';
import { Globe, Users, Trophy, MapPin, Sparkles, X, ChevronRight } from 'lucide-react';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json";

interface GlobalOfficeMapProps {
  teams: Team[];
  users: User[];
  distanceUnit?: 'mi' | 'km';
}

const GlobalOfficeMap: React.FC<GlobalOfficeMapProps> = ({ 
  teams, 
  users, 
  distanceUnit = 'mi' 
}) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const isKm = distanceUnit === 'km';

  const totalGlobalSteps = users.reduce((acc, u) => acc + (Number(u.steps) || 0), 0);
  const totalGlobalMiles = totalGlobalSteps / STEPS_PER_MILE;
  const totalGlobalKm = totalGlobalMiles * 1.60934;
  const globalProgressPercentage = Math.min((totalGlobalSteps / GLOBAL_STEP_GOAL) * 100, 100);

  // Ensure ALL teams have valid lat/lng and location for pins
  const processedTeams = teams.map((team, idx) => {
    if (typeof team.lat === 'number' && typeof team.lng === 'number') {
      return team;
    }

    const matchedOffice = ACCENTURE_GLOBAL_OFFICES.find(o => 
      team.location && (o.displayName.toLowerCase().includes(team.location.toLowerCase()) || 
      team.location.toLowerCase().includes(o.city.toLowerCase()))
    );

    const fallbackOffice = matchedOffice || ACCENTURE_GLOBAL_OFFICES[idx % ACCENTURE_GLOBAL_OFFICES.length];

    return {
      ...team,
      location: team.location || fallbackOffice.displayName,
      lat: fallbackOffice.lat,
      lng: fallbackOffice.lng
    };
  });

  const uniqueLocationsCount = new Set(processedTeams.map(t => t.location)).size;

  // Add small spiral offset for teams sharing exact same office location
  const locationCounts: Record<string, number> = {};

  return (
    <div className="space-y-6">
      {/* 35M GLOBAL STEP GOAL PROGRESS BAR */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-100 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full">
              <Sparkles size={14} /> Global Stepathon Milestone
            </div>
            <span className="text-xs font-bold text-blue-100">
              Goal: 35,000,000 Total Steps
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {totalGlobalSteps.toLocaleString()} <span className="text-lg font-bold opacity-80">steps logged</span>
              </h2>
              <p className="text-xs text-blue-100 mt-1">
                Equal to {totalGlobalMiles.toLocaleString(undefined, { maximumFractionDigits: 1 })} miles ({totalGlobalKm.toLocaleString(undefined, { maximumFractionDigits: 1 })} km) walked globally!
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-amber-300">
                {globalProgressPercentage.toFixed(1)}%
              </div>
              <span className="text-xs text-blue-200">of 35M Goal</span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full bg-black/20 backdrop-blur-sm h-4 rounded-full overflow-hidden p-0.5 border border-white/20">
            <div
              className="bg-gradient-to-r from-amber-300 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${Math.max(globalProgressPercentage, 2)}%` }}
            />
          </div>
        </div>
      </div>

      {/* REACT-SIMPLE-MAPS SVG WORLD MAP */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Globe size={20} className="text-blue-600" /> Accenture Global Office Map
            </h3>
            <p className="text-xs text-gray-500">
              Teams pinned by their Accenture office location worldwide. Click any pin to view team stats.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-gray-600 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-1.5">
              <Trophy size={14} className="text-purple-600" />
              <span>{teams.length} Teams</span>
            </div>
            <div className="w-px h-3 bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-red-500" />
              <span>{uniqueLocationsCount} Office Hubs</span>
            </div>
          </div>
        </div>

        {/* SVG Map Canvas Container */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner h-[420px] flex items-center justify-center">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 120,
              center: [0, 20]
            }}
            className="w-full h-full"
          >
            <ZoomableGroup zoom={1} maxZoom={5}>
              {/* World Landmass SVG */}
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#1E293B"
                      stroke="#334155"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#334155", outline: "none" },
                        pressed: { outline: "none" }
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Team Office Pins */}
              {processedTeams.map((team) => {
                if (team.lat === undefined || team.lng === undefined) return null;

                const locKey = `${team.lat.toFixed(3)},${team.lng.toFixed(3)}`;
                const countAtLoc = locationCounts[locKey] || 0;
                locationCounts[locKey] = countAtLoc + 1;

                let markerLat = team.lat;
                let markerLng = team.lng;
                if (countAtLoc > 0) {
                  const angle = countAtLoc * 1.3;
                  const radius = 1.2 * countAtLoc;
                  markerLat += radius * Math.cos(angle);
                  markerLng += radius * Math.sin(angle);
                }

                const teamMembers = users.filter(u => u.teamId === team.id || u.teamName === team.name);
                const teamSteps = teamMembers.reduce((sum, m) => sum + (Number(m.steps) || 0), 0);
                const teamColor = team.color || '#4285F4';
                const isSelected = selectedTeam?.id === team.id;

                return (
                  <Marker
                    key={team.id}
                    coordinates={[markerLng, markerLat]}
                    onClick={() => setSelectedTeam(team)}
                  >
                    <g className="cursor-pointer group">
                      {/* Pulse Ring */}
                      <circle
                        r={isSelected ? 14 : 9}
                        fill={teamColor}
                        opacity={0.4}
                        className="animate-ping"
                      />
                      
                      {/* Outer Ring */}
                      <circle
                        r={isSelected ? 10 : 7}
                        fill={teamColor}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                        className="transition-all group-hover:scale-125"
                      />

                      {/* Inner Dot */}
                      <circle
                        r={2.5}
                        fill="#FFFFFF"
                      />
                    </g>
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>

          {/* TEAM DETAILS POPUP MODAL (If Pin Clicked) */}
          {selectedTeam && (() => {
            const teamMembers = users.filter(u => u.teamId === selectedTeam.id || u.teamName === selectedTeam.name);
            const teamSteps = teamMembers.reduce((sum, m) => sum + (Number(m.steps) || 0), 0);
            const teamMiles = teamSteps / STEPS_PER_MILE;
            const teamDistVal = isKm ? teamMiles * 1.60934 : teamMiles;
            const teamColor = selectedTeam.color || '#4285F4';

            return (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-white/95 backdrop-blur-md border border-gray-200 p-5 rounded-2xl shadow-xl max-w-sm animate-fade-in text-gray-900 z-20">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: teamColor }} />
                    <h4 className="font-extrabold text-base text-gray-900">{selectedTeam.name}</h4>
                  </div>
                  <button 
                    onClick={() => setSelectedTeam(null)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="text-xs text-[#4285F4] font-bold flex items-center gap-1 mb-3">
                  <MapPin size={14} /> {selectedTeam.location || 'Accenture Global Office'}
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-3 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">Total Steps</div>
                    <div className="text-lg font-black text-gray-900">
                      {teamSteps.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 font-bold uppercase">Distance</div>
                    <div className="text-sm font-extrabold text-blue-600">
                      {teamDistVal.toFixed(1)} {isKm ? 'km' : 'mi'}
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold text-gray-500">
                  👥 {teamMembers.length} racers in team
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default GlobalOfficeMap;
