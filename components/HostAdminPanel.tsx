import React, { useState, useEffect } from 'react';
import { Team, User, AnnouncementBanner } from '../types';
import { ACCENTURE_GLOBAL_OFFICES } from '../constants';
import { 
  ShieldCheck, Plus, Trash2, Users, UserPlus, 
  Sparkles, Check, X, Lock, Unlock, Layers, MapPin,
  Megaphone, Bell, AlertTriangle, Send, CheckCircle2, Flame,
  Footprints, Calendar, Zap, Search, UserCheck, Download,
  FileSpreadsheet, FileText, Database, Award
} from 'lucide-react';
import { 
  downloadMasterRosterCSV, 
  downloadTeamSummaryCSV, 
  downloadDailyActivityLogCSV, 
  downloadRawJSONBackup 
} from '../utils/exportHelpers';

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
  announcement?: AnnouncementBanner | null;
  onAddTeam: (name: string, color: string, iconId: string, location?: string, lat?: number, lng?: number) => Promise<Team | null>;
  onDeleteTeam: (teamId: string) => Promise<void>;
  onAddParticipant: (name: string, teamId: string, teamName: string, iconId: string) => Promise<void>;
  onRemoveParticipant: (participantId: string) => Promise<void>;
  onAddSteps?: (userId: string, steps: number, week: number, customDate?: string, bypassMaxLimit?: boolean) => Promise<void>;
  onHealData?: () => Promise<{ success: boolean; healedCount: number }>;
  onUpdateAnnouncement?: (announcement: AnnouncementBanner) => Promise<void>;
  isAdmin: boolean;
  setIsAdmin: (status: boolean) => void;
}

const HostAdminPanel: React.FC<HostAdminPanelProps> = ({
  teams,
  users,
  announcement,
  onAddTeam,
  onDeleteTeam,
  onAddParticipant,
  onRemoveParticipant,
  onAddSteps,
  onHealData,
  onUpdateAnnouncement,
  isAdmin,
  setIsAdmin
}) => {
  const [isHealing, setIsHealing] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState(false);
  const [exportedItem, setExportedItem] = useState<string | null>(null);

  const handleExportNotify = (type: string) => {
    setExportedItem(type);
    setTimeout(() => setExportedItem(null), 2500);
  };

  // Searchable Autocomplete & Multi-Entry Host Step Override State
  const [participantSearchQuery, setParticipantSearchQuery] = useState<string>('');
  const [selectedOverrideUser, setSelectedOverrideUser] = useState<User | null>(null);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState<boolean>(false);

  interface OverrideEntryRow {
    id: string;
    date: string;
    week: number;
    steps: string;
  }

  const computeWeekFromDate = (dateStr: string): number => {
    if (!dateStr) return 1;
    if (dateStr >= '2026-08-03') return 4;
    if (dateStr >= '2026-07-27') return 3;
    if (dateStr >= '2026-07-20') return 2;
    return 1;
  };

  const createInitialOverrideRow = (): OverrideEntryRow => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return {
      id: `override-row-${Math.random()}`,
      date: todayStr,
      week: computeWeekFromDate(todayStr),
      steps: ''
    };
  };

  const [overrideRows, setOverrideRows] = useState<OverrideEntryRow[]>([
    createInitialOverrideRow()
  ]);
  const [isSubmittingOverride, setIsSubmittingOverride] = useState<boolean>(false);
  const [overrideSuccessMsg, setOverrideSuccessMsg] = useState<string | null>(null);

  const handleAddOverrideRow = () => {
    setOverrideRows(prev => [...prev, createInitialOverrideRow()]);
  };

  const handleRemoveOverrideRow = (index: number) => {
    setOverrideRows(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleOverrideRowChange = (index: number, field: keyof OverrideEntryRow, value: any) => {
    setOverrideRows(prev => {
      const updated = [...prev];
      if (field === 'date') {
        const week = computeWeekFromDate(value);
        updated[index] = { ...updated[index], date: value, week };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleHostOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddSteps || !selectedOverrideUser) return;

    const validRows = overrideRows.filter(r => {
      const val = parseInt(r.steps, 10);
      return !isNaN(val) && val > 0 && r.date;
    });

    if (validRows.length === 0) return;

    setIsSubmittingOverride(true);
    try {
      let totalStepsLogged = 0;
      for (const row of validRows) {
        const stepCount = parseInt(row.steps, 10);
        await onAddSteps(selectedOverrideUser.id, stepCount, row.week, row.date, true);
        totalStepsLogged += stepCount;
      }

      setOverrideSuccessMsg(`Logged ${validRows.length} entry/entries totaling ${totalStepsLogged.toLocaleString()} steps for ${selectedOverrideUser.name}!`);
      setOverrideRows([createInitialOverrideRow()]);
      setSelectedOverrideUser(null);
      setParticipantSearchQuery('');
      setTimeout(() => setOverrideSuccessMsg(null), 5000);
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const filteredOverrideUsers = users.filter(u => {
    if (!participantSearchQuery.trim()) return true;
    const q = participantSearchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || (u.teamName && u.teamName.toLowerCase().includes(q));
  });

  // Announcement Form State
  const [announcementMsg, setAnnouncementMsg] = useState(announcement?.message || '');
  const [announcementType, setAnnouncementType] = useState<'info' | 'warning' | 'celebration' | 'alert'>(announcement?.type || 'info');
  const [announcementActive, setAnnouncementActive] = useState<boolean>(announcement?.active ?? false);
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
  const [announcementSavedSuccess, setAnnouncementSavedSuccess] = useState(false);

  useEffect(() => {
    if (announcement) {
      setAnnouncementMsg(announcement.message || '');
      setAnnouncementType(announcement.type || 'info');
      setAnnouncementActive(announcement.active ?? false);
    }
  }, [announcement]);

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

        <div className="flex items-center gap-2">
          {onHealData && (
            <button
              type="button"
              disabled={isHealing}
              onClick={async () => {
                setIsHealing(true);
                try {
                  const res = await onHealData();
                  alert(`Data sync & healing complete! Healed ${res.healedCount} racer record(s).`);
                } finally {
                  setIsHealing(false);
                }
              }}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles size={14} /> {isHealing ? 'Healing Data...' : 'Sync & Heal Data'}
            </button>
          )}
          <button
            onClick={() => setIsAdmin(false)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
          >
            Close Admin Mode
          </button>
        </div>
      </div>

      {/* DATA EXPORT & COMPETITION REPORTS */}
      <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/70 to-cyan-50/70 border border-emerald-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-emerald-200/80 pb-3 gap-2">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
            <Download size={18} className="text-emerald-700" /> Competition Data Export & Reports
          </div>
          <span className="text-xs text-emerald-800 font-medium">
            1-Click CSVs for Excel / Google Sheets & JSON Backup
          </span>
        </div>

        <p className="text-xs text-gray-600 font-medium">
          Download formatted competition standings, weekly step breakdowns, and full audit logs for executive updates, awards calculation, and record archiving.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {/* Card 1: Master Participant Roster CSV */}
          <div className="bg-white border border-emerald-100 p-4 rounded-xl shadow-2xs flex flex-col justify-between space-y-3 hover:border-emerald-300 transition-all">
            <div>
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <FileSpreadsheet size={16} className="text-emerald-600 flex-shrink-0" /> Master Roster (CSV)
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Individual rankings, Week 1–4 step totals, miles, km, and active days logged.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                downloadMasterRosterCSV(users, teams);
                handleExportNotify('master');
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {exportedItem === 'master' ? <Check size={14} /> : <Download size={14} />}
              {exportedItem === 'master' ? 'Downloaded Roster!' : 'Export Roster (.csv)'}
            </button>
          </div>

          {/* Card 2: Team Standings Summary CSV */}
          <div className="bg-white border border-emerald-100 p-4 rounded-xl shadow-2xs flex flex-col justify-between space-y-3 hover:border-emerald-300 transition-all">
            <div>
              <div className="flex items-center gap-2 text-teal-900 font-bold text-xs">
                <Award size={16} className="text-teal-600 flex-shrink-0" /> Team Standings (CSV)
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Official team ranks, total steps, miles, avg/racer, and top contributor metrics.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                downloadTeamSummaryCSV(users, teams);
                handleExportNotify('teams');
              }}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {exportedItem === 'teams' ? <Check size={14} /> : <Download size={14} />}
              {exportedItem === 'teams' ? 'Downloaded Teams!' : 'Export Teams (.csv)'}
            </button>
          </div>

          {/* Card 3: Granular Daily Activity Log CSV */}
          <div className="bg-white border border-emerald-100 p-4 rounded-xl shadow-2xs flex flex-col justify-between space-y-3 hover:border-emerald-300 transition-all">
            <div>
              <div className="flex items-center gap-2 text-cyan-900 font-bold text-xs">
                <FileText size={16} className="text-cyan-600 flex-shrink-0" /> Daily Activity Log (CSV)
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Full granular audit trail of every step submission with UTC timestamps.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                downloadDailyActivityLogCSV(users, teams);
                handleExportNotify('daily');
              }}
              className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {exportedItem === 'daily' ? <Check size={14} /> : <Download size={14} />}
              {exportedItem === 'daily' ? 'Downloaded Logs!' : 'Export Activity (.csv)'}
            </button>
          </div>

          {/* Card 4: Complete Raw JSON Database Backup */}
          <div className="bg-white border border-emerald-100 p-4 rounded-xl shadow-2xs flex flex-col justify-between space-y-3 hover:border-emerald-300 transition-all">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Database size={16} className="text-slate-600 flex-shrink-0" /> Raw JSON Backup
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Complete structured JSON database snapshot for archive, backup, or migrations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                downloadRawJSONBackup(users, teams, announcement);
                handleExportNotify('json');
              }}
              className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {exportedItem === 'json' ? <Check size={14} /> : <Download size={14} />}
              {exportedItem === 'json' ? 'Downloaded JSON!' : 'Download JSON (.json)'}
            </button>
          </div>
        </div>
      </div>

      {/* EVENT ANNOUNCEMENT & REMINDER BANNER SETUP */}
      {onUpdateAnnouncement && (
        <form 
          onSubmit={async (e) => {
            e.preventDefault();
            setIsSavingAnnouncement(true);
            try {
              await onUpdateAnnouncement({
                message: announcementMsg.trim(),
                type: announcementType,
                active: announcementActive
              });
              setAnnouncementSavedSuccess(true);
              setTimeout(() => setAnnouncementSavedSuccess(false), 2500);
            } finally {
              setIsSavingAnnouncement(false);
            }
          }}
          className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Megaphone size={18} className="text-amber-600" /> Host Announcement & Reminder Banner
            </div>
            <span className="text-xs text-amber-700 font-medium">Shows on Home Page Top</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold text-gray-600 mb-1.5 uppercase tracking-wider">
                Announcement Message
              </label>
              <textarea
                rows={2}
                placeholder="e.g. 🕗 Reminder: Log all Week 1 steps by Monday 8:00 PM ET! Post your walking selfies in team chat!"
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
                className="w-full bg-white border border-gray-200 text-sm rounded-xl p-3 focus:ring-2 focus:ring-amber-500 outline-none shadow-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-gray-600 mb-2 uppercase tracking-wider">
                  Banner Category / Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAnnouncementType('info')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      announcementType === 'info' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Megaphone size={14} /> 📢 Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncementType('warning')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      announcementType === 'warning' 
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <AlertTriangle size={14} /> ⚠️ Warning
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncementType('celebration')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      announcementType === 'celebration' 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Sparkles size={14} /> 🎉 Celebration
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncementType('alert')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      announcementType === 'alert' 
                        ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Flame size={14} /> 🚨 Alert
                  </button>
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <label className="block text-[11px] font-extrabold text-gray-600 mb-2 uppercase tracking-wider">
                  Visibility Status
                </label>
                <label className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 cursor-pointer shadow-sm">
                  <input
                    type="checkbox"
                    checked={announcementActive}
                    onChange={(e) => setAnnouncementActive(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    {announcementActive ? '🟢 Active (Visible on Home Page)' : '⚪ Inactive (Hidden)'}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSavingAnnouncement || !announcementMsg.trim()}
                className="w-full sm:flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 px-5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {announcementSavedSuccess ? (
                  <>
                    <CheckCircle2 size={16} /> Saved & Published!
                  </>
                ) : (
                  <>
                    <Send size={15} /> {isSavingAnnouncement ? 'Publishing...' : 'Save & Publish Announcement'}
                  </>
                )}
              </button>

              {announcementActive && (
                <button
                  type="button"
                  onClick={async () => {
                    setAnnouncementActive(false);
                    setIsSavingAnnouncement(true);
                    try {
                      await onUpdateAnnouncement({
                        message: announcementMsg,
                        type: announcementType,
                        active: false
                      });
                    } finally {
                      setIsSavingAnnouncement(false);
                    }
                  }}
                  className="w-full sm:w-auto bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
                >
                  Turn Off Banner
                </button>
              )}
            </div>
          </div>
        </form>
      )}

      {/* HOST MANUAL STEP ENTRY & PROOF OVERRIDE (>30K ALLOWED) */}
      {onAddSteps && (
        <form onSubmit={handleHostOverrideSubmit} className="bg-gradient-to-r from-purple-50/70 via-indigo-50/70 to-blue-50/70 border border-purple-200/80 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-purple-200/80 pb-3 gap-2">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
              <Zap size={18} className="text-purple-600" /> Host Manual Step Entry & Proof Override
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-100/80 border border-purple-200 px-3 py-1 rounded-full">
              <Footprints size={13} /> Bypasses 30k Step Limit (&gt;30,000 allowed with proof)
            </span>
          </div>

          {overrideSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>{overrideSuccessMsg}</span>
            </div>
          )}

          {/* STEP 1: PARTICIPANT AUTOCOMPLETE SEARCH */}
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wider">
              1. Type Participant Name to Search & Select
            </label>

            {!selectedOverrideUser ? (
              <div className="relative">
                <div className="relative flex items-center">
                  <Search size={16} className="absolute left-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    aria-label="Select Participant"
                    placeholder="Type participant name or team (e.g. Alice)..."
                    value={participantSearchQuery}
                    onChange={(e) => {
                      setParticipantSearchQuery(e.target.value);
                      setIsSearchDropdownOpen(true);
                    }}
                    onFocus={() => setIsSearchDropdownOpen(true)}
                    className="w-full bg-white border border-gray-200 text-xs rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none shadow-sm font-medium"
                  />
                  {participantSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setParticipantSearchQuery('')}
                      className="absolute right-3 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown List */}
                {isSearchDropdownOpen && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-purple-100 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-gray-100 animate-fade-in">
                    {filteredOverrideUsers.length === 0 ? (
                      <div className="p-3 text-xs text-gray-400 italic text-center">
                        No matching participants found.
                      </div>
                    ) : (
                      filteredOverrideUsers.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setSelectedOverrideUser(u);
                            setParticipantSearchQuery(u.name);
                            setIsSearchDropdownOpen(false);
                          }}
                          className="w-full text-left p-3 hover:bg-purple-50/80 transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900 group-hover:text-purple-700">{u.name}</div>
                              <div className="text-[10px] text-gray-500 font-medium">{u.teamName || 'Unassigned Team'}</div>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                            {(u.steps || 0).toLocaleString()} steps
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Selected Participant Chip */
              <div className="flex items-center justify-between bg-white border border-purple-200 p-3.5 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {selectedOverrideUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                      <span>{selectedOverrideUser.name}</span>
                      <UserCheck size={14} className="text-emerald-600" />
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium">
                      Team: <span className="font-bold text-gray-700">{selectedOverrideUser.teamName || 'No Team'}</span> • Current Total: <span className="font-bold text-purple-700">{(selectedOverrideUser.steps || 0).toLocaleString()} steps</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOverrideUser(null);
                    setParticipantSearchQuery('');
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-gray-200"
                >
                  <X size={13} /> Switch Participant
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: MULTIPLE ENTRY ROWS (WHEN PARTICIPANT IS SELECTED) */}
          {selectedOverrideUser && (
            <div className="space-y-4 pt-2 border-t border-purple-200/60 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wider">
                  2. Add Step Entries for {selectedOverrideUser.name} ({overrideRows.length} Entry Row{overrideRows.length === 1 ? '' : 's'})
                </label>
                <button
                  type="button"
                  onClick={handleAddOverrideRow}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-white hover:bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs transition-all flex items-center gap-1"
                >
                  <Plus size={14} /> Add Another Entry
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {overrideRows.map((row, rowIdx) => (
                  <div key={row.id} className="relative bg-white border border-purple-100 rounded-xl p-4 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
                    <span className="text-xs font-black text-purple-600 w-5 text-center hidden sm:inline-block">
                      #{rowIdx + 1}
                    </span>

                    {/* Date Picker */}
                    <div className="flex-1">
                      <label className="block text-[10px] font-extrabold text-gray-500 mb-1 uppercase tracking-wider">
                        Entry Date
                      </label>
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => handleOverrideRowChange(rowIdx, 'date', e.target.value)}
                        className="w-full bg-gray-50/70 border border-gray-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-purple-500 outline-none font-medium shadow-2xs"
                        required
                      />
                    </div>

                    {/* Week Selector */}
                    <div className="w-full sm:w-28">
                      <label className="block text-[10px] font-extrabold text-gray-500 mb-1 uppercase tracking-wider">
                        Week
                      </label>
                      <select
                        value={row.week}
                        onChange={(e) => handleOverrideRowChange(rowIdx, 'week', Number(e.target.value))}
                        className="w-full bg-gray-50/70 border border-gray-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-purple-500 outline-none font-medium shadow-2xs"
                      >
                        <option value={1}>Week 1</option>
                        <option value={2}>Week 2</option>
                        <option value={3}>Week 3</option>
                        <option value={4}>Week 4</option>
                      </select>
                    </div>

                    {/* Step Count */}
                    <div className="flex-1">
                      <label className="block text-[10px] font-extrabold text-gray-500 mb-1 uppercase tracking-wider">
                        Step Count (&gt;30k allowed)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 45000"
                        value={row.steps}
                        onChange={(e) => handleOverrideRowChange(rowIdx, 'steps', e.target.value)}
                        className="w-full bg-gray-50/70 border border-gray-200 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-purple-500 outline-none font-medium shadow-2xs"
                        min="1"
                        max="200000"
                        required
                      />
                    </div>

                    {/* Remove Row Button */}
                    {overrideRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOverrideRow(rowIdx)}
                        className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors self-end sm:self-center"
                        title="Remove Entry Row"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddOverrideRow}
                  className="w-full sm:w-auto border-2 border-dashed border-purple-300 hover:border-purple-500 text-purple-700 hover:bg-purple-50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus size={15} /> Add Another Entry Row
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingOverride || overrideRows.every(r => !r.steps.trim())}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap size={15} /> {isSubmittingOverride ? 'Saving All Entries...' : `Save All (${overrideRows.length}) Step Overrides`}
                </button>
              </div>
            </div>
          )}
        </form>
      )}

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
