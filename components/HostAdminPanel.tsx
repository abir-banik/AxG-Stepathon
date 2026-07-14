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

  // Unified Multiple Teams & Members Creation State
  interface TeamCreationState {
    id: string;
    name: string;
    color: string;
    officeId: string;
    memberInputs: string[];
  }

  const createInitialTeamState = (): TeamCreationState => ({
    id: `form-team-${Math.random()}`,
    name: '',
    color: TEAM_COLORS[0].hex,
    officeId: ACCENTURE_GLOBAL_OFFICES[0].id,
    memberInputs: ['', '', '', '', ''] // Default 5 rows
  });

  const [teamsToCreate, setTeamsToCreate] = useState<TeamCreationState[]>([
    createInitialTeamState()
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Add Member State for existing teams
  const [addingMemberTeamId, setAddingMemberTeamId] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState<string>('');

  const handleQuickAddMember = async (team: Team) => {
    if (!newMemberName.trim()) return;
    await onAddParticipant(newMemberName.trim(), team.id, team.name, 'smile');
    setNewMemberName('');
    setAddingMemberTeamId(null);
  };

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

  const handleAddTeamForm = () => {
    if (teamsToCreate.length >= 5) {
      alert("You can create up to 5 teams at a time.");
      return;
    }
    setTeamsToCreate(prev => [...prev, createInitialTeamState()]);
  };

  const handleRemoveTeamForm = (index: number) => {
    if (teamsToCreate.length <= 1) return;
    setTeamsToCreate(prev => prev.filter((_, i) => i !== index));
  };

  const handleTeamFieldChange = (index: number, field: keyof TeamCreationState, value: any) => {
    setTeamsToCreate(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddMemberRow = (teamIndex: number) => {
    setTeamsToCreate(prev => {
      const updated = [...prev];
      updated[teamIndex] = {
        ...updated[teamIndex],
        memberInputs: [...updated[teamIndex].memberInputs, '']
      };
      return updated;
    });
  };

  const handleRemoveMemberRow = (teamIndex: number, memberIndex: number) => {
    setTeamsToCreate(prev => {
      const updated = [...prev];
      if (updated[teamIndex].memberInputs.length <= 1) return prev;
      updated[teamIndex] = {
        ...updated[teamIndex],
        memberInputs: updated[teamIndex].memberInputs.filter((_, i) => i !== memberIndex)
      };
      return updated;
    });
  };

  const handleMemberInputChange = (teamIndex: number, memberIndex: number, value: string) => {
    setTeamsToCreate(prev => {
      const updated = [...prev];
      const memberInputs = [...updated[teamIndex].memberInputs];
      memberInputs[memberIndex] = value;
      updated[teamIndex] = {
        ...updated[teamIndex],
        memberInputs
      };
      return updated;
    });
  };

  const handleBatchCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const validTeams = teamsToCreate.filter(t => t.name.trim().length > 0);
    if (validTeams.length === 0) return;

    setIsSubmitting(true);
    try {
      for (const teamForm of validTeams) {
        const office = ACCENTURE_GLOBAL_OFFICES.find(o => o.id === teamForm.officeId) || ACCENTURE_GLOBAL_OFFICES[0];
        
        // 1. Create Team with Office Location Coordinates
        const createdTeam = await onAddTeam(
          teamForm.name.trim(), 
          teamForm.color, 
          'trophy', 
          office.displayName, 
          office.lat, 
          office.lng
        );
        const teamId = createdTeam?.id || `team-${Date.now()}`;
        const actualTeamName = createdTeam?.name || teamForm.name.trim();

        // 2. Add all non-empty members to the created team at once
        const validMembers = teamForm.memberInputs.map(m => m.trim()).filter(m => m.length > 0);
        for (const memberName of validMembers) {
          await onAddParticipant(memberName, teamId, actualTeamName, 'smile');
        }
      }

      // Reset form
      setTeamsToCreate([createInitialTeamState()]);
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

        <div className="space-y-6">
          {teamsToCreate.map((teamForm, teamIdx) => (
            <div key={teamForm.id} className="relative bg-[#f8f9fa] border border-blue-100 rounded-2xl p-5 space-y-4 shadow-sm">
              {teamsToCreate.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveTeamForm(teamIdx)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors text-xs font-bold flex items-center gap-1 border border-red-100 bg-white"
                  title="Remove Team Config"
                >
                  <X size={14} /> Remove Team #{teamIdx + 1}
                </button>
              )}
              
              <div className="text-xs font-black text-[#4285F4] uppercase tracking-wider">
                🏷️ Team #{teamIdx + 1} Setup
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Team Name & Color & Office location */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 mb-1.5 uppercase tracking-wider">
                      Team Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Boba Striders"
                      value={teamForm.name}
                      onChange={(e) => handleTeamFieldChange(teamIdx, 'name', e.target.value)}
                      className="w-full bg-white border border-gray-200 text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium"
                      required={teamIdx === 0}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 mb-2 uppercase tracking-wider">
                      Badge Color
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {TEAM_COLORS.map(c => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => handleTeamFieldChange(teamIdx, 'color', c.hex)}
                          className={`w-7 h-7 rounded-full transition-all ${c.bg} ${teamForm.color === c.hex ? 'ring-4 ring-blue-300 scale-110 shadow' : 'opacity-80 hover:opacity-100'}`}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                      <MapPin size={13} className="text-[#4285F4]" /> Accenture Office Location
                    </label>
                    <select
                      value={teamForm.officeId}
                      onChange={(e) => handleTeamFieldChange(teamIdx, 'officeId', e.target.value)}
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
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                      Team Members
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddMemberRow(teamIdx)}
                      className="text-[10px] font-bold text-[#4285F4] hover:text-blue-700 flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-blue-200 shadow-sm transition-all"
                    >
                      <Plus size={12} /> Add Member Slot
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {teamForm.memberInputs.map((val, memberIdx) => (
                      <div key={memberIdx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-5 text-right">{memberIdx + 1}.</span>
                        <input
                          type="text"
                          placeholder={`Member ${memberIdx + 1} Name...`}
                          value={val}
                          onChange={(e) => handleMemberInputChange(teamIdx, memberIdx, e.target.value)}
                          className="flex-1 bg-white border border-gray-200 text-sm rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-medium shadow-sm"
                        />
                        {teamForm.memberInputs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMemberRow(teamIdx, memberIdx)}
                            className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove row"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Another Team Form Button */}
        {teamsToCreate.length < 5 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddTeamForm}
              className="w-full border-2 border-dashed border-[#4285F4]/30 hover:border-[#4285F4] text-[#4285F4] hover:bg-blue-50/50 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} /> Add Another Team to Batch ({teamsToCreate.length}/5)
            </button>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-blue-100">
          <button
            type="submit"
            disabled={isSubmitting || !teamsToCreate.some(t => t.name.trim().length > 0)}
            className="w-full bg-[#4285F4] hover:bg-blue-600 text-white font-bold text-sm py-3.5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus size={18} /> {isSubmitting ? 'Creating Teams & Assigning Members...' : 'Create Batch of Teams & Add Members'}
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

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      {members.length} Assigned Member{members.length === 1 ? '' : 's'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingMemberTeamId(addingMemberTeamId === team.id ? null : team.id);
                        setNewMemberName('');
                      }}
                      className="text-[11px] font-bold text-[#4285F4] hover:text-blue-700 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Plus size={12} /> Add Member
                    </button>
                  </div>

                  {addingMemberTeamId === team.id && (
                    <div className="flex items-center gap-1.5 bg-blue-50/70 p-2 rounded-xl border border-blue-100 shadow-sm animate-fade-in">
                      <input
                        type="text"
                        placeholder="Member Name..."
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQuickAddMember(team);
                          }
                        }}
                        className="flex-1 bg-white border border-gray-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleQuickAddMember(team)}
                        disabled={!newMemberName.trim()}
                        className="bg-[#4285F4] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingMemberTeamId(null);
                          setNewMemberName('');
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

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
