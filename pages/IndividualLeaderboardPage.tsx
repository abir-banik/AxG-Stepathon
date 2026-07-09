import React, { useState } from 'react';
import { User, Team } from '../types';
import { Trophy, Search, Users, Crown, Medal } from 'lucide-react';

interface IndividualLeaderboardPageProps {
  users: User[];
  teams: Team[];
  distanceUnit?: 'mi' | 'km';
}

const IndividualLeaderboardPage: React.FC<IndividualLeaderboardPageProps> = ({ 
  users, 
  teams, 
  distanceUnit = 'mi' 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('ALL');
  const isKm = distanceUnit === 'km';

  // Filter & Sort Users Overall
  const filteredUsers = users.filter(u => {
    const matchesTeam = selectedTeamId === 'ALL' || u.teamId === selectedTeamId || u.teamName === teams.find(t => t.id === selectedTeamId)?.name;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.teamName && u.teamName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTeam && matchesSearch;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => (b.steps || 0) - (a.steps || 0));

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="inline-flex items-center gap-1 bg-amber-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-sm">🥇 #1</span>;
    if (rank === 2) return <span className="inline-flex items-center gap-1 bg-gray-400 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-sm">🥈 #2</span>;
    if (rank === 3) return <span className="inline-flex items-center gap-1 bg-amber-700 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-sm">🥉 #3</span>;
    return <span className="font-extrabold text-gray-500 text-xs px-2">#{rank}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header & Controls Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">Individual Leaderboard</h2>
            <span className="bg-blue-50 text-[#4285F4] text-xs font-extrabold px-3 py-1 rounded-full border border-blue-100">
              {sortedUsers.length} Racers
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-1">Overall step and distance rankings across all teams.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search racer or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-9 pr-3.5 py-2.5 focus:ring-2 focus:ring-[#4285F4] outline-none font-medium"
            />
          </div>

          {/* Team Filter */}
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="w-full sm:w-auto bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#4285F4] cursor-pointer"
          >
            <option value="ALL">All Teams ({users.length})</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {sortedUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <p className="font-medium">No racers match your search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 bg-gray-50/70 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5 font-bold w-20">Rank</th>
                  <th className="px-6 py-3.5 font-bold">Racer Name</th>
                  <th className="px-6 py-3.5 font-bold">Team</th>
                  <th className="px-6 py-3.5 font-bold">Distance</th>
                  <th className="px-6 py-3.5 font-bold text-right">Total Steps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {sortedUsers.map((user, index) => {
                  const rank = index + 1;
                  const miles = (user.steps || 0) / 2000;
                  const distVal = (isKm ? miles * 1.60934 : miles).toFixed(1);
                  const userTeam = teams.find(t => t.id === user.teamId || t.name === user.teamName);

                  return (
                    <tr 
                      key={user.id} 
                      className={`transition-colors hover:bg-blue-50/40 ${
                        rank === 1 ? 'bg-amber-50/30' :
                        rank === 2 ? 'bg-gray-50/50' :
                        rank === 3 ? 'bg-amber-700/5' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-6 py-4">
                        {getRankBadge(rank)}
                      </td>

                      {/* Racer Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
                            rank === 1 ? 'bg-amber-500 text-white' :
                            rank === 2 ? 'bg-gray-400 text-white' :
                            rank === 3 ? 'bg-amber-700 text-white' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                            {user.name}
                            {rank === 1 && <Crown size={14} className="text-amber-500" />}
                          </span>
                        </div>
                      </td>

                      {/* Team */}
                      <td className="px-6 py-4">
                        {userTeam ? (
                          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-bold">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: userTeam.color || '#4285F4' }} />
                            {userTeam.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Independent</span>
                        )}
                      </td>

                      {/* Distance */}
                      <td className="px-6 py-4 font-bold text-gray-600">
                        {distVal} <span className="text-xs text-gray-400">{isKm ? 'km' : 'mi'}</span>
                      </td>

                      {/* Steps */}
                      <td className="px-6 py-4 text-right font-black text-gray-900 text-base">
                        {(user.steps || 0).toLocaleString()}
                        <span className="text-xs text-gray-400 font-normal ml-1">steps</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default IndividualLeaderboardPage;
