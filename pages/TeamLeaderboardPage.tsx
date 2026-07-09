import React, { useState } from 'react';
import { Team, User } from '../types';
import { TOTAL_GOAL_MILES } from '../constants';
import { Award, Users, TrendingUp, Shield, Crown, Sparkles, ChevronRight, Footprints } from 'lucide-react';

interface TeamLeaderboardPageProps {
  teams: Team[];
  users: User[];
  distanceUnit?: 'mi' | 'km';
}

const TeamLeaderboardPage: React.FC<TeamLeaderboardPageProps> = ({ teams, users, distanceUnit = 'mi' }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const isKm = distanceUnit === 'km';

  // Aggregate team stats
  const teamStats = teams.map(team => {
    const members = users.filter(u => u.teamId === team.id || u.teamName === team.name);
    const totalSteps = members.reduce((acc, m) => acc + (m.steps || 0), 0);
    const totalMiles = totalSteps / 2000;
    const totalDist = isKm ? totalMiles * 1.60934 : totalMiles;
    const avgSteps = members.length > 0 ? Math.round(totalSteps / members.length) : 0;
    const avgMiles = avgSteps / 2000;
    const avgDist = isKm ? avgMiles * 1.60934 : avgMiles;

    // Top contributor in team
    const sortedMembers = [...members].sort((a, b) => (b.steps || 0) - (a.steps || 0));
    const topContributor = sortedMembers[0];

    return {
      ...team,
      members: sortedMembers,
      totalSteps,
      totalMiles,
      totalDist,
      avgSteps,
      avgMiles,
      avgDist,
      topContributor
    };
  }).sort((a, b) => b.totalSteps - a.totalSteps);

  const totalEventSteps = users.reduce((acc, u) => acc + (u.steps || 0), 0);
  const totalEventMiles = totalEventSteps / 2000;

  const getRankBadgeClass = (index: number) => {
    switch (index) {
      case 0: return 'bg-[#FBBC05] text-white shadow-md ring-2 ring-yellow-300'; // Gold
      case 1: return 'bg-[#9AA0A6] text-white shadow-md'; // Silver
      case 2: return 'bg-[#E37400] text-white shadow-md'; // Bronze
      default: return 'bg-gray-100 text-gray-700 font-bold';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-blue-100">
              <Award size={14} /> Official Team Competition
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Team Standings & Leaderboard</h2>
            <p className="text-blue-100 text-sm max-w-xl">
              Track overall team miles, racer averages, and team roster progress towards the 4,195-mile Seattle to NYC goal.
            </p>
          </div>

          <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-4 gap-6 text-center border border-white/20">
            <div>
              <div className="text-2xl font-extrabold">{teams.length}</div>
              <div className="text-[11px] text-blue-200 uppercase font-bold tracking-wider">Active Teams</div>
            </div>
            <div className="border-r border-white/20" />
            <div>
              <div className="text-2xl font-extrabold">{totalEventMiles.toFixed(1)}</div>
              <div className="text-[11px] text-blue-200 uppercase font-bold tracking-wider">Total Team Miles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Standings Main Grid */}
      {teamStats.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-[#4285F4]">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">No Teams Formed Yet</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            The event host hasn't created any teams yet. Check back once teams are configured in the Host Admin Portal!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {teamStats.map((team, index) => {
            const progressPercent = Math.min((team.totalMiles / TOTAL_GOAL_MILES) * 100, 100);
            const isSelected = selectedTeamId === team.id;

            return (
              <div
                key={team.id}
                className={`bg-white rounded-3xl border ${index === 0 ? 'border-amber-200 shadow-md' : 'border-gray-100 shadow-sm'} p-6 md:p-8 space-y-6 transition-all hover:shadow-md`}
              >
                {/* Team Card Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-base ${getRankBadgeClass(index)}`}>
                      #{index + 1}
                    </span>

                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: team.color }} />

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold text-gray-900">{team.name}</h3>
                        {index === 0 && (
                          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Crown size={12} className="text-amber-600" /> #1 Leader
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-2 mt-1">
                        <span><Users size={12} className="inline mr-1" />{team.members.length} Racers</span>
                        <span>•</span>
                        <span>Avg: <strong className="text-gray-700">{team.avgSteps.toLocaleString()} steps ({team.avgMiles.toFixed(1)} mi)</strong> / racer</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right bg-blue-50/60 border border-blue-100 px-5 py-3 rounded-2xl">
                    <div className="text-2xl font-black text-[#4285F4]">
                      {team.totalSteps.toLocaleString()} <span className="text-xs font-bold text-gray-500">steps</span>
                    </div>
                    <div className="text-xs font-bold text-gray-600">
                      {team.totalDist.toFixed(1)} {isKm ? 'km' : 'miles'}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-600">
                    <span>Target Progress</span>
                    <span>{progressPercent.toFixed(2)}% of 35M steps</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200/50">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(progressPercent, 1)}%`,
                        backgroundColor: team.color || '#4285F4'
                      }}
                    />
                  </div>
                </div>

                {/* Team Top Contributor Badge */}
                {team.topContributor && (
                  <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-500" />
                      <span className="font-bold text-gray-700">Top Team Walker:</span>
                      <span className="font-extrabold text-gray-900">{team.topContributor.name}</span>
                    </div>
                    <span className="font-bold text-blue-600">
                      {(team.topContributor.steps || 0).toLocaleString()} steps ({( (team.topContributor.steps || 0) / (isKm ? 1242.74 : 2000) ).toFixed(1)} {isKm ? 'km' : 'mi'})
                    </span>
                  </div>
                )}

                {/* Roster Breakdown Toggle */}
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedTeamId(isSelected ? null : team.id)}
                    className="text-xs font-bold text-[#4285F4] hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    {isSelected ? 'Hide Roster Details' : `View Roster (${team.members.length} members)`}
                    <ChevronRight size={14} className={`transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </button>

                  {isSelected && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
                      {team.members.map((member, mIndex) => {
                        const memberMiles = (member.steps || 0) / 2000;
                        const percentOfTeam = team.totalSteps > 0 ? ((member.steps || 0) / team.totalSteps) * 100 : 0;

                        return (
                          <div key={member.id} className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-extrabold text-gray-400 w-5">#{mIndex + 1}</span>
                              <div>
                                <div className="font-bold text-xs text-gray-900">{member.name}</div>
                                <div className="text-[11px] text-gray-400 font-medium">{percentOfTeam.toFixed(0)}% of team total</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-extrabold text-xs text-gray-800">{(member.steps || 0).toLocaleString()}</div>
                              <div className="text-[10px] font-bold text-blue-600">{memberMiles.toFixed(1)} mi</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamLeaderboardPage;
