import React from 'react';
import {
  STEPS_PER_MILE,
  TOTAL_GOAL_MILES,
  EVENT_START_DATE,
  EVENT_END_DATE,
  EVENT_WEEKS,
  computeWeekFromDate
} from '../constants';
import { Users, Calendar, Clock, Award, Footprints } from 'lucide-react';

interface DashboardStatsProps {
  totalSteps: number;
  activeUserCount: number;
  teamCount?: number;
  distanceUnit?: 'mi' | 'km';
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalSteps,
  activeUserCount,
  teamCount = 0,
  distanceUnit = 'mi'
}) => {
  const totalMiles = totalSteps / STEPS_PER_MILE;
  const isKm = distanceUnit === 'km';
  const displayDistance = isKm
    ? (totalMiles * 1.60934).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : totalMiles.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const unitLabel = isKm ? 'km' : 'mi';
  const targetDistance = isKm
    ? (TOTAL_GOAL_MILES * 1.60934).toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' km'
    : TOTAL_GOAL_MILES.toLocaleString() + ' mi';

  const avgStepsPerRacer = activeUserCount > 0 ? Math.round(totalSteps / activeUserCount) : 0;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isPreEvent = todayStr < EVENT_START_DATE;
  const isPostEvent = todayStr > EVENT_END_DATE;
  const activeWeekNum = computeWeekFromDate(todayStr);
  const activeWeekObj = EVENT_WEEKS.find(w => w.weekNumber === activeWeekNum) || EVENT_WEEKS[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Total Global Steps & Distance Covered */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Team Steps</h3>
            <span className="bg-blue-50 text-[#4285F4] p-2 rounded-xl">
              <Footprints size={16} />
            </span>
          </div>
          <p className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">{totalSteps.toLocaleString()}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
            <span className="bg-emerald-50 text-[#34A853] px-2.5 py-0.5 rounded-full font-bold">
              {displayDistance} {unitLabel} covered
            </span>
            <span>• Target: {targetDistance}</span>
          </div>
        </div>
      </div>

      {/* Card 2: Active Teams, Racers & Average per Steppers */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Community Pace</h3>
          <span className="bg-amber-50 text-[#FBBC05] p-2 rounded-xl">
            <Users size={16} />
          </span>
        </div>
        <p className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
          {avgStepsPerRacer.toLocaleString()} <span className="text-sm font-bold text-gray-400">avg steps/racer</span>
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
          <span className="inline-flex items-center gap-1 bg-blue-50 text-[#4285F4] px-2.5 py-0.5 rounded-full font-bold">
            <Users size={12} /> {activeUserCount} Racers
          </span>
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full font-bold">
            <Award size={12} /> {teamCount} Teams
          </span>
        </div>
      </div>

      {/* Card 3: Current Challenge Phase & Next Cutoff */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Challenge Schedule</h3>
          <span className="bg-purple-50 text-purple-600 p-2 rounded-xl">
            <Calendar size={16} />
          </span>
        </div>

        {isPreEvent ? (
          <>
            <p className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">
              Starts Oct 19
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
              <span className="bg-amber-50 text-amber-800 border border-amber-200/60 px-2.5 py-0.5 rounded-full font-bold">
                📝 Sign-Up: Oct 7 – Oct 15
              </span>
              <span>• 4-Week Challenge</span>
            </div>
          </>
        ) : isPostEvent ? (
          <>
            <p className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">
              Challenge Complete
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 font-medium">
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                🏆 Winners: Nov 20, 2026
              </span>
            </div>
          </>
        ) : (
          <>
            <p className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">
              {activeWeekObj.label} <span className="text-sm font-bold text-purple-600">({activeWeekObj.shortRange})</span>
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Clock size={13} className="text-purple-600 shrink-0" />
              <span>
                Cutoff: <strong className="text-gray-800">{activeWeekNum === 4 ? 'Wed Nov 18 @ Midnight PST' : 'Mon @ Midnight PST'}</strong>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardStats;