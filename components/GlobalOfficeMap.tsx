import React from 'react';
import { Team, User } from '../types';
import { GLOBAL_STEP_GOAL, STEPS_PER_MILE } from '../constants';
import { Sparkles } from 'lucide-react';

interface GlobalOfficeMapProps {
  teams: Team[];
  users: User[];
  distanceUnit?: 'mi' | 'km';
}

const GlobalOfficeMap: React.FC<GlobalOfficeMapProps> = ({ 
  users, 
  distanceUnit = 'mi' 
}) => {
  const totalGlobalSteps = users.reduce((acc, u) => acc + (Number(u.steps) || 0), 0);
  const totalGlobalMiles = totalGlobalSteps / STEPS_PER_MILE;
  const totalGlobalKm = totalGlobalMiles * 1.60934;
  const globalProgressPercentage = Math.min((totalGlobalSteps / GLOBAL_STEP_GOAL) * 100, 100);

  return (
    <div className="w-full">
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
    </div>
  );
};

export default GlobalOfficeMap;
