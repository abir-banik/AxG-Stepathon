import React, { useState } from 'react';
import { Team, User } from '../types';
import { ACCENTURE_GLOBAL_OFFICES } from '../constants';
import { 
  ShieldCheck, Plus, Trash2, Users, UserPlus, 
  Sparkles, Check, X, Lock, Unlock, Layers, MapPin
} from 'lucide-react';

const TEAM_COLORS = [
  { name: 'Google Blue', hex: '#4285F4', bg: 'bg-[#4285F4]' },
  { name: 'Google Red', hex: '#EA4335', bg: 'bg-[#EA4335]' },
  { name: 'Google Yellow', hex: '#FBBC05', bg: 'bg-[#FBBC05]' },
  { name: 'Google Green', hex: '#34A853', bg: 'bg-[#34A853]' },
  { name: 'Purple', hex: '#8E24AA', bg: 'bg-[#8E24AA]' },
  { name: 'Orange', hex: '#F4511E', bg: 'bg-[#F4511E]' },
  { name: 'Teal', hex: '#00897B', bg: 'bg-[#00897B]' },
  { name: 'Indigo', hex: '#3949AB', bg: 'bg-[#3949AB]' }
];

interface HostAdminPanelProps {
  teams: Team[];
  users: User[];
  onAddTeam: (name: string, color: string, iconId: string, location?: string, lat?: number, lng?: number) => Promise<Team | null>;
  onDeleteTeam: (teamId: string) => Promise<void>;
  onAddParticipant: (name: string, teamId: string, teamName: string, iconId: string) => Promise<void>;
  onRemoveParticipant: (participantId: string) => Promise<void>;
  isAdmin: boolean;
  setIsAdmin: (status: boolean) => void;
}

const HostAdminPanel: React.FC<HostAdminPanelProps> = ({
  teams,
  users,
  onAddTeam,
  onDeleteTeam,
  onAddParticipant,
  onRemoveParticipant,
  isAdmin,
  setIsAdmin
}) => {
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState(false);

  // Unified Team & Members Creation State
  const [teamName, setTeamName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TEAM_COLORS[0].hex);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(ACCENTURE_GLOBAL_OFFICES[0].id);
  const [memberInputs, setMemberInputs] = useState<string[]>(['', '']); // Default 2 rows
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === 'AxGstepathon2026') {
      setIsAdmin(true);
      setPassError(false);
      setPasscode('');
    } else {
      setPassError(true);
    }
  };

  const handleAddMemberRow = () => {
    setMemberInputs(prev => [...prev, '']);
  };

  const handleRemoveMemberRow = (index: number) => {
    if (memberInputs.length <= 1) return;
    setMemberInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleMemberInputChange = (index: number, value: string) => {
    setMemberInputs(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleBatchCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setIsSubmitting(true);
    try {
      const office = ACCENTURE_GLOBAL_OFFICES.find(o => o.id === selectedOfficeId) || ACCENTURE_GLOBAL_OFFICES[0];
      
      // 1. Create Team with Office Location Coordinates
      const createdTeam = await onAddTeam(
        teamName.trim(), 
        selectedColor, 
        'trophy', 
        office.displayName, 
        office.lat, 
        office.lng
      );
      const teamId = createdTeam?.id || `team-${Date.now()}`;
      const actualTeamName = createdTeam?.name || teamName.trim();

      // 2. Add all non-empty members to the created team at once
      const validMembers = memberInputs.map(m => m.trim()).filter(m => m.length > 0);
      for (const memberName of validMembers) {
        await onAddParticipant(memberName, teamId, actualTeamName, 'smile');
      }

      // Reset form
      setTeamName('');
      setMemberInputs(['', '']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-3 rounded-2xl text-[#4285F4]">
            <Lock size={20} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">Host & Admin Portal</h4>
            <p className="text-xs text-gray-500 font-medium">Event hosts can create teams and pre-assign members.</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="password"
            placeholder="Enter Passcode..."
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className={`bg-gray-50 border ${passError ? 'border-red-400' : 'border-gray-200'} text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-44 font-medium`}
          />
          <button
            type="submit"
            className="bg-[#4285F4] hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
          >
            <Unlock size={14} /> Unlock
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-3 rounded-2xl text-[#4285F4]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Host Admin Dashboard</h3>
            <p className="text-gray-500 text-xs">Create teams and add all team members simultaneously.</p>
          </div>
        </div>

        <button
          onClick={() => setIsAdmin(false)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
        >
          Close Admin Mode
        </button>
      </div>

      {/* UNIFIED TEAM & MEMBERS BATCH CREATOR */}
      <form onSubmit={handleBatchCreateTeam} className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-blue-100 pb-3">
          <div className="flex items-center gap-2 text-[#4285F4] font-bold text-sm">
            <Sparkles size={18} /> Create Team & Add All Members At Once
          </div>
          <span className="text-xs text-gray-400 font-medium">Host Only</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Team Name & Color */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                1. Team Name
              </label>
              <input
                type="text"
                placeholder="e.g. Boba Striders"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-white border border-gray-200 text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                2. Team Badge Color
              </label>
              <div className="flex flex-wrap gap-2.5">
                {TEAM_COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    className={`w-8 h-8 rounded-full transition-all ${c.bg} ${selectedColor === c.hex ? 'ring-4 ring-blue-300 scale-110 shadow' : 'opacity-80 hover:opacity-100'}`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                <MapPin size={14} className="text-[#4285F4]" /> 3. Accenture Office Location (Map Pin)
              </label>
              <select
                value={selectedOfficeId}
                onChange={(e) => setSelectedOfficeId(e.target.value)}
                className="w-full bg-white border border-gray-200 text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium"
              >
                {ACCENTURE_GLOBAL_OFFICES.map(office => (
                  <option key={office.id} value={office.id}>
                    📍 {office.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Batch Member List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                4. Team Members (Add all at once)
              </label>
              <button
                type="button"
                onClick={handleAddMemberRow}
                className="text-xs font-bold text-[#4285F4] hover:text-blue-700 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-sm transition-all"
              >
                <Plus size={14} /> Add Member
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {memberInputs.map((val, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-5 text-right">{idx + 1}.</span>
                  <input
                    type="text"
                    placeholder={`Member ${idx + 1} Name...`}
                    value={val}
                    onChange={(e) => handleMemberInputChange(idx, e.target.value)}
                    className="flex-1 bg-white border border-gray-200 text-sm rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-medium shadow-sm"
                  />
                  {memberInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMemberRow(idx)}
                      className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove row"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !teamName.trim()}
            className="w-full bg-[#4285F4] hover:bg-blue-600 text-white font-bold text-sm py-3.5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus size={18} /> {isSubmitting ? 'Creating Team & Assigning Members...' : 'Create Team & Add All Members'}
          </button>
        </div>
      </form>

      {/* EXISTING TEAMS & ROSTER OVERVIEW */}
      <div className="border-t border-gray-100 pt-6">
        <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={16} className="text-[#4285F4]" /> Pre-Configured Teams & Members ({teams.length} Teams, {users.length} Participants)
        </h4>

        {teams.length === 0 ? (
          <p className="text-gray-400 text-sm italic text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            No teams configured yet. Use the form above to add your first team and members.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => {
              const members = users.filter(u => u.teamId === team.id || u.teamName === team.name);
              return (
                <div key={team.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: team.color }} />
                      <span className="font-bold text-sm text-gray-900">{team.name}</span>
                    </div>
                    <button
                      onClick={() => onDeleteTeam(team.id)}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Team"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    {members.length} Assigned Member{members.length === 1 ? '' : 's'}
                  </div>

                  <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                    {members.map(m => (
                      <li key={m.id} className="flex justify-between items-center bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700">
                        <span>{m.name}</span>
                        <button
                          onClick={() => onRemoveParticipant(m.id)}
                          className="text-red-400 hover:text-red-600 text-[11px] font-bold"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                    {members.length === 0 && (
                      <li className="text-gray-400 text-xs italic py-1">No members assigned yet</li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostAdminPanel;
