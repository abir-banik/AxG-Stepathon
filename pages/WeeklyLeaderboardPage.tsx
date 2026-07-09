import React, { useState } from 'react';
import { User, Team } from '../types';
import { EVENT_WEEKS, WeekDefinition } from '../constants';
import { Calendar, Trophy, Award, Crown, Users } from 'lucide-react';

interface WeeklyLeaderboardPageProps {
  users: User[];
  teams: Team[];
  distanceUnit?: 'mi' | 'km';
}

const WeeklyLeaderboardPage: React.FC<WeeklyLeaderboardPageProps> = ({ users, teams, distanceUnit = 'mi' }) => {
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const isKm = distanceUnit === 'km';

  const currentWeekInfo = EVENT_WEEKS.find(w => w.weekNumber === selectedWeekNum) || EVENT_WEEKS[0];

  // 1. Calculate Individual Stats for Selected Week
  const individualWeeklyStats = users.map(user => {
    const weeklySteps = user.weeklySteps ? (user.weeklySteps[selectedWeekNum] || 0) : 0;
    const weeklyMiles = weeklySteps / 2000;
    const weeklyDist = isKm ? weeklyMiles * 1.60934 : weeklyMiles;
    return {
      ...user,
      weeklySteps,
      weeklyMiles,
      weeklyDist
    };
  }).sort((a, b) => b.weeklySteps - a.weeklySteps);

  // Top 3 Individuals for Selected Week
  const top3Individuals = individualWeeklyStats.slice(0, 3).filter(u => u.weeklySteps > 0);

  // 2. Calculate Team Stats for Selected Week
  const teamWeeklyStats = teams.map(team => {
    const members = users.filter(u => u.teamId === team.id || u.teamName === team.name);
    const totalWeeklySteps = members.reduce((acc, m) => {
      const mSteps = m.weeklySteps ? (m.weeklySteps[selectedWeekNum] || 0) : 0;
      return acc + mSteps;
    }, 0);
    const totalWeeklyMiles = totalWeeklySteps / 2000;
    const totalWeeklyDist = isKm ? totalWeeklyMiles * 1.60934 : totalWeeklyMiles;
    const avgWeeklySteps = members.length > 0 ? Math.round(totalWeeklySteps / members.length) : 0;

    return {
      ...team,
      members,
      totalWeeklySteps,
      totalWeeklyMiles,
      totalWeeklyDist,
      avgWeeklySteps
    };
  }).sort((a, b) => b.totalWeeklySteps - a.totalWeeklySteps);

  // Top 3 Teams for Selected Week
  const top3Teams = teamWeeklyStats.slice(0, 3).filter(t => t.totalWeeklySteps > 0);

  const getRankBadgeClass = (index: number) => {
    switch (index) {
      case 0: return 'bg-[#FBBC05] text-white shadow-sm ring-2 ring-amber-300'; // Gold
      case 1: return 'bg-[#9AA0A6] text-white shadow-sm'; // Silver
      case 2: return 'bg-[#E37400] text-white shadow-sm'; // Bronze
      default: return 'bg-gray-100 text-gray-700 font-bold';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-purple-100">
              <Calendar size={14} /> 4-Week Challenge (July 13th – August 7th)
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Weekly Leaderboard</h2>
            <p className="text-purple-100 text-sm max-w-xl">
              Select any week to view the top 3 performing teams and top 3 individual leaders.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
            <div className="text-2xl font-black">{currentWeekInfo.label}</div>
            <div className="text-xs font-bold text-purple-200">{currentWeekInfo.startDate} – {currentWeekInfo.endDate}</div>
          </div>
        </div>
      </div>

      {/* WEEK FILTER CONTROLS */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <Calendar size={16} className="text-purple-600" /> Select Week:
        </div>

        <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
          {EVENT_WEEKS.map(w => {
            const isSelected = w.weekNumber === selectedWeekNum;
            return (
              <button
                key={w.weekNumber}
                onClick={() => setSelectedWeekNum(w.weekNumber)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md scale-105'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>{w.label}</span>
                <span className="block text-[10px] opacity-80 font-normal">{w.startDate} - {w.endDate}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TWO TOP CARDS ONLY: TOP 3 TEAMS & TOP 3 INDIVIDUALS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* CARD 1: STRIDE FORCE (TOP 3 TEAMS FOR THIS WEEK) */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-purple-100 shadow-sm space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-3 rounded-2xl text-purple-600">
                <Award size={24} />
              </div>
              <div>
                <h3 className="text-[#xl] font-bold text-gray-900 flex items-center gap-1.5">
                  Stride Force 🏅🤝 <span className="text-sm font-normal text-gray-500">(Top 3 Teams)</span>
                </h3>
                <p className="text-xs text-gray-500">{currentWeekInfo.label} ({currentWeekInfo.startDate} - {currentWeekInfo.endDate})</p>
              </div>
            </div>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">
              {currentWeekInfo.label}
            </span>
          </div>

          {top3Teams.length === 0 ? (
            <p className="text-gray-400 text-center italic py-8 text-sm">No steps logged for teams in {currentWeekInfo.label} yet.</p>
          ) : (
            <div className="space-y-3">
              {top3Teams.map((team, idx) => (
                <div
                  key={team.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    idx === 0 ? 'bg-gradient-to-r from-amber-50 to-orange-50/40 border-amber-200 shadow-sm' : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs ${getRankBadgeClass(idx)}`}>
                      #{idx + 1}
                    </span>
                    <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: team.color }} />
                    <div>
                      <div className="font-bold text-sm text-gray-900 flex items-center gap-1">
                        {team.name}
                        {idx === 0 && <Crown size={14} className="text-amber-500" />}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium">
                        {team.members.length} members • Avg: {team.avgWeeklySteps.toLocaleString()} steps/racer
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-sm text-purple-700">
                      {team.totalWeeklySteps.toLocaleString()} <span className="text-[11px] text-gray-400">steps</span>
                    </div>
                    <div className="text-[11px] font-bold text-gray-500">
                      {team.totalWeeklyDist.toFixed(1)} {isKm ? 'km' : 'mi'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CARD 2: STRIDE STAR (TOP 3 INDIVIDUALS FOR THIS WEEK) */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-blue-100 shadow-sm space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-3 rounded-2xl text-[#4285F4]">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
                  Stride Star 🏅🌟 <span className="text-sm font-normal text-gray-500">(Top 3 Individuals)</span>
                </h3>
                <p className="text-xs text-gray-500">{currentWeekInfo.label} ({currentWeekInfo.startDate} - {currentWeekInfo.endDate})</p>
              </div>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
              {currentWeekInfo.label}
            </span>
          </div>

          {top3Individuals.length === 0 ? (
            <p className="text-gray-400 text-center italic py-8 text-sm">No steps logged for individuals in {currentWeekInfo.label} yet.</p>
          ) : (
            <div className="space-y-3">
              {top3Individuals.map((user, idx) => (
                <div
                  key={user.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    idx === 0 ? 'bg-gradient-to-r from-amber-50 to-yellow-50/40 border-amber-200 shadow-sm' : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs ${getRankBadgeClass(idx)}`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-gray-900 flex items-center gap-1">
                        {user.name}
                        {idx === 0 && <Crown size={14} className="text-amber-500" />}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium">
                        {user.teamName || 'Independent'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-sm text-blue-600">
                      {user.weeklySteps.toLocaleString()} <span className="text-[11px] text-gray-400">steps</span>
                    </div>
                    <div className="text-[11px] font-bold text-gray-500">
                      {user.weeklyDist.toFixed(1)} {isKm ? 'km' : 'mi'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default WeeklyLeaderboardPage;
