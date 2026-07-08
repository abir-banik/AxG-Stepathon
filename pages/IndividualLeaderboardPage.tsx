import React, { useState } from 'react';
import { User, Team } from '../types';
import { Trophy, Medal, Search, Flame, Calendar, Footprints, Users, Sparkles, Award } from 'lucide-react';
import { TOTAL_WEEKS } from '../constants';

interface IndividualLeaderboardPageProps {
  users: User[];
  teams: Team[];
}

const IndividualLeaderboardPage: React.FC<IndividualLeaderboardPageProps> = ({ users, teams }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('ALL');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  // Filter & Sort Users Overall
  const filteredUsers = users.filter(u => {
    const matchesTeam = selectedTeamId === 'ALL' || u.teamId === selectedTeamId || u.teamName === teams.find(t => t.id === selectedTeamId)?.name;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.teamName && u.teamName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTeam && matchesSearch;
  });

  const sortedUsersOverall = [...filteredUsers].sort((a, b) => (b.steps || 0) - (a.steps || 0));

  // Sort Users by Selected Week
  const sortedUsersByWeek = [...filteredUsers].sort((a, b) => {
    const stepsA = a.weeklySteps ? (a.weeklySteps[selectedWeek] || 0) : 0;
    const stepsB = b.weeklySteps ? (b.weeklySteps[selectedWeek] || 0) : 0;
    return stepsB - stepsA;
  });

  const top3 = sortedUsersOverall.slice(0, 3);
  const weeksArray = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-100">
              <Trophy size={14} /> Individual Walker Standings
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Top Walkers & Momentum</h2>
            <p className="text-amber-100 text-sm max-w-xl">
              Celebrate top individual step achievers, weekly movers, and personal milestones across all participating teams.
            </p>
          </div>

          <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-4 gap-6 text-center border border-white/20">
            <div>
              <div className="text-2xl font-extrabold">{users.length}</div>
              <div className="text-[11px] text-amber-200 uppercase font-bold tracking-wider">Total Racers</div>
            </div>
            <div className="border-r border-white/20" />
            <div>
              <div className="text-2xl font-extrabold">
                {users.length > 0 ? (users.reduce((a, b) => a + (b.steps || 0), 0) / users.length / 2000).toFixed(1) : 0}
              </div>
              <div className="text-[11px] text-amber-200 uppercase font-bold tracking-wider">Avg Miles / Racer</div>
            </div>
          </div>
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* #2 Silver */}
          {top3[1] && (
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col items-center text-center space-y-3 relative overflow-hidden order-2 md:order-1">
              <div className="w-12 h-12 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-extrabold text-lg shadow-inner">
                🥈 #2
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{top3[1].name}</h4>
                <p className="text-xs text-gray-500 font-medium">{top3[1].teamName || 'Independent'}</p>
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                <span className="text-lg font-black text-gray-800">{(top3[1].steps || 0).toLocaleString()}</span>
                <span className="text-xs text-gray-500 font-bold ml-1">steps</span>
              </div>
            </div>
          )}

          {/* #1 Gold */}
          {top3[0] && (
            <div className="bg-gradient-to-b from-amber-500/10 to-amber-50/50 rounded-3xl p-6 border-2 border-amber-300 shadow-md flex flex-col items-center text-center space-y-3 relative overflow-hidden order-1 md:order-2">
              <div className="absolute top-2 right-2 bg-amber-500 text-white p-1.5 rounded-full shadow-sm">
                <Trophy size={16} />
              </div>
              <div className="w-14 h-14 bg-amber-500 text-white rounded-full flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-amber-200">
                🥇 #1
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-xl">{top3[0].name}</h4>
                <p className="text-xs text-amber-700 font-bold">{top3[0].teamName || 'Independent'}</p>
              </div>
              <div className="bg-amber-500 text-white px-5 py-2.5 rounded-2xl shadow-sm">
                <span className="text-xl font-black">{(top3[0].steps || 0).toLocaleString()}</span>
                <span className="text-xs font-bold ml-1">steps ({((top3[0].steps || 0) / 2000).toFixed(1)} mi)</span>
              </div>
            </div>
          )}

          {/* #3 Bronze */}
          {top3[2] && (
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col items-center text-center space-y-3 relative overflow-hidden order-3">
              <div className="w-12 h-12 bg-amber-700/20 text-amber-800 rounded-full flex items-center justify-center font-extrabold text-lg shadow-inner">
                🥉 #3
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{top3[2].name}</h4>
                <p className="text-xs text-gray-500 font-medium">{top3[2].teamName || 'Independent'}</p>
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                <span className="text-lg font-black text-gray-800">{(top3[2].steps || 0).toLocaleString()}</span>
                <span className="text-xs text-gray-500 font-bold ml-1">steps</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEARCH & TEAM FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search walker or team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-amber-500 outline-none font-medium"
          />
        </div>

        {/* Team Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Filter Team:</span>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer w-full sm:w-auto"
          >
            <option value="ALL">All Teams ({users.length})</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* OVERALL INDIVIDUAL STANDINGS TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Footprints size={20} className="text-amber-500" />
            <h3 className="text-xl font-bold text-gray-800">Overall Walker Rankings</h3>
          </div>
          <span className="text-xs font-bold text-gray-400">{sortedUsersOverall.length} Racers</span>
        </div>

        {sortedUsersOverall.length === 0 ? (
          <p className="text-gray-400 text-center italic py-8 text-sm">No racers match your search criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 bg-gray-50 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 font-bold">Rank</th>
                  <th className="px-6 py-3 font-bold">Racer Name</th>
                  <th className="px-6 py-3 font-bold">Team</th>
                  <th className="px-6 py-3 font-bold">Miles</th>
                  <th className="px-6 py-3 font-bold text-right">Total Steps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {sortedUsersOverall.map((user, index) => {
                  const miles = ((user.steps || 0) / 2000).toFixed(1);
                  return (
                    <tr key={user.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                          index === 0 ? 'bg-amber-400 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-700 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-bold">
                          {user.teamName || 'Independent'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-amber-600">
                        {miles} mi
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-gray-900 text-base">
                        {(user.steps || 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* WEEKLY MOMENTUM SECTION */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-orange-500" />
            <div>
              <h3 className="text-xl font-bold text-gray-800">Weekly Momentum Leaderboard</h3>
              <p className="text-xs text-gray-500">Filter by week to see who had the highest weekly step count</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Select Week:</span>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              className="bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {weeksArray.map(w => (
                <option key={w} value={w}>Week {w}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedUsersByWeek.map((user, index) => {
            const weekSteps = user.weeklySteps ? (user.weeklySteps[selectedWeek] || 0) : 0;
            const weekMiles = (weekSteps / 2000).toFixed(1);

            return (
              <div key={user.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-gray-400 w-5">#{index + 1}</span>
                  <div>
                    <div className="font-bold text-sm text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-400 font-medium">{user.teamName || 'Independent'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-sm text-orange-600">+{weekSteps.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400 font-bold">{weekMiles} mi in W{selectedWeek}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IndividualLeaderboardPage;
