import React from 'react';
import { STEPS_PER_MILE, TOTAL_GOAL_STEPS, TOTAL_GOAL_MILES } from '../constants';
import { Users } from 'lucide-react';

interface DashboardStatsProps {
  totalSteps: number;
  activeUserCount: number;
  distanceUnit?: 'mi' | 'km';
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ totalSteps, activeUserCount, distanceUnit = 'mi' }) => {
  const totalMiles = totalSteps / STEPS_PER_MILE;
  const isKm = distanceUnit === 'km';
  const displayDistance = isKm ? (totalMiles * 1.60934).toFixed(1) : totalMiles.toFixed(1);
  const unitLabel = isKm ? 'km' : 'mi';
  const targetDistance = isKm 
    ? (TOTAL_GOAL_MILES * 1.60934).toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' km'
    : TOTAL_GOAL_MILES.toLocaleString() + ' mi';

  const rawProgressPercent = (totalSteps / TOTAL_GOAL_STEPS) * 100;
  const isGoalCrushed = totalSteps >= TOTAL_GOAL_STEPS;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Steps */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Team Steps</h3>
          <p className="text-4xl font-normal text-gray-800 mt-2">{totalSteps.toLocaleString()}</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
             <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
               <Users size={12} />
               {activeUserCount} Racers
             </div>
             <span>contributed</span>
          </div>
        </div>
      </div>

      {/* Miles/KM Covered */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Distance Covered</h3>
        <p className="text-4xl font-normal text-gray-800 mt-2">{displayDistance} <span className="text-xl text-gray-400">{unitLabel}</span></p>
        <div className="mt-2 flex items-center text-sm text-gray-400">
           <span className="text-[#4285F4] font-medium mr-1">Target:</span> {targetDistance}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
        <div className="flex justify-between items-end mb-3">
            <div>
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Race Progress</h3>
              {isGoalCrushed && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  🎉 Goal Crushed!
                </span>
              )}
            </div>
            <span className={`text-3xl font-extrabold ${isGoalCrushed ? 'text-amber-600' : 'text-green-600'}`}>
              {rawProgressPercent.toFixed(1)}%
            </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${isGoalCrushed ? 'bg-gradient-to-r from-amber-400 to-emerald-500' : 'bg-[#34A853]'}`}
            style={{ width: `${Math.min(rawProgressPercent, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;