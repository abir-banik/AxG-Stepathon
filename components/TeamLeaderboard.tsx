import React from 'react';
import { Team, User } from '../types';
import { TOTAL_GOAL_MILES } from '../constants';
import { Award, Users, TrendingUp, Shield } from 'lucide-react';

interface TeamLeaderboardProps {
  teams: Team[];
  users: User[];
}

const TeamLeaderboard: React.FC<TeamLeaderboardProps> = ({ teams, users }) => {
  // Aggregate team stats
  const teamStats = teams.map(team => {
    const members = users.filter(u => u.teamId === team.id || u.teamName === team.name);
    const totalSteps = members.reduce((acc, m) => acc + (m.steps || 0), 0);
    const totalMiles = totalSteps / 2000;
    const avgSteps = members.length > 0 ? Math.round(totalSteps / members.length) : 0;

    return {
      ...team,
      members,
      totalSteps,
      totalMiles,
      avgSteps
    };
  }).sort((a, b) => b.totalSteps - a.totalSteps);

  const getRankBadgeClass = (index: number) => {
    switch (index) {
      case 0: return 'bg-[#FBBC05] text-white'; // Gold
      case 1: return 'bg-[#9AA0A6] text-white'; // Silver
      case 2: return 'bg-[#E37400] text-white'; // Bronze
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="bg-[#4285F4]/10 p-3 rounded-2xl text-[#4285F4]">
          <Award size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-normal text-gray-800">Team Standings</h3>
          <p className="text-gray-500 text-xs">Official Leaderboard ranked by Total Team Distance</p>
        </div>
      </div>

      {teamStats.length === 0 ? (
        <p className="text-gray-400 text-center italic py-8 text-sm">Waiting for host to create teams...</p>
      ) : (
        <div className="space-y-4">
          {teamStats.map((team, index) => {
            const progressPercent = Math.min((team.totalMiles / TOTAL_GOAL_MILES) * 100, 100);
            return (
              <div
                key={team.id}
                className="bg-gray-50/70 hover:bg-white border border-gray-200/80 hover:border-blue-200 rounded-2xl p-5 transition-all shadow-sm space-y-3"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadgeClass(index)}`}>
                      {index + 1}
                    </span>
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: team.color }} />
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg leading-tight">{team.name}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Users size={12} /> {team.members.length} Racer{team.members.length === 1 ? '' : 's'} • Avg: {team.avgSteps.toLocaleString()} steps/racer
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xl font-extrabold text-[#4285F4]">
                      {team.totalSteps.toLocaleString()} <span className="text-xs font-normal text-gray-500">steps</span>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {team.totalMiles.toFixed(1)} miles covered
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${Math.max(progressPercent, 1)}%`,
                        backgroundColor: team.color || '#4285F4'
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400 font-medium px-0.5">
                    <span>{progressPercent.toFixed(1)}% of 4,195 mi</span>
                    <span>{team.members.length > 0 ? team.members.map(m => m.name).join(', ') : 'No members'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamLeaderboard;
