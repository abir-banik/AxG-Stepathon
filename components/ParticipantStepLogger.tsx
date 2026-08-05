import React, { useState } from 'react';
import { User, Team } from '../types';
import { TOTAL_WEEKS } from '../constants';
import { 
  Plus, Check, X, Trash2, Calendar, History, 
  Users, Award, Search, Sparkles, Footprints, ChevronRight
} from 'lucide-react';

interface ParticipantStepLoggerProps {
  users: User[];
  teams: Team[];
  onAddSteps: (userId: string, steps: number, week: number, customDate?: string) => Promise<void>;
  onDeleteStep: (userId: string, entryIndex: number) => Promise<void>;
}

const ParticipantStepLogger: React.FC<ParticipantStepLoggerProps> = ({
  users,
  teams,
  onAddSteps,
  onDeleteStep
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'name-asc' | 'name-desc'>('name-asc');
  const [historySortOrder, setHistorySortOrder] = useState<'date-desc' | 'date-asc' | 'updated-desc'>('date-desc');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const EVENT_START_DATE = '2026-07-13';
  const EVENT_END_DATE = '2026-08-05';

  const computeWeekFromDate = (dateStr: string): number => {
    if (!dateStr || dateStr <= '2026-07-19') return 1;
    if (dateStr <= '2026-07-26') return 2;
    if (dateStr <= '2026-08-02') return 3;
    return 4;
  };

  // Form States
  const [stepInput, setStepInput] = useState('');
  const getLocalTodayStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayStr = getLocalTodayStr();
  const initialDate = todayStr < EVENT_START_DATE ? EVENT_START_DATE : (todayStr > EVENT_END_DATE ? EVENT_END_DATE : todayStr);
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [selectedWeek, setSelectedWeek] = useState<number>(computeWeekFromDate(initialDate));

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    let finalDate = val;
    if (val < EVENT_START_DATE) {
      alert("Steps can only be logged starting from July 13th, 2026.");
      finalDate = EVENT_START_DATE;
    } else if (val > EVENT_END_DATE) {
      alert("Steps can only be logged up to August 5th, 2026.");
      finalDate = EVENT_END_DATE;
    } else if (val > todayStr) {
      alert("You can only log steps for today or a past date.");
      finalDate = todayStr < EVENT_START_DATE ? EVENT_START_DATE : (todayStr > EVENT_END_DATE ? EVENT_END_DATE : todayStr);
    }
    setSelectedDate(finalDate);
    setSelectedWeek(computeWeekFromDate(finalDate));
  };

  const weeksArray = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

  // Filter & Sort Users by Team, Search, and A-Z / Z-A Order
  const filteredUsers = users
    .filter(u => {
      const matchesTeam = selectedTeamId === 'ALL' || u.teamId === selectedTeamId || u.teamName === teams.find(t => t.id === selectedTeamId)?.name;
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (u.teamName && u.teamName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTeam && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);
      return a.name.localeCompare(b.name);
    });

  const selectedUser = users.find(u => u.id === selectedUserId);

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId && stepInput) {
      const val = parseInt(stepInput, 10);
      if (val > 0) {
        await onAddSteps(selectedUserId, val, selectedWeek, selectedDate);
        setStepInput('');
      }
    }
  };

  const formatEntryDate = (dateStr: string) => {
    if (!dateStr) return '';
    const datePart = dateStr.substring(0, 10);
    if (datePart.length === 10 && datePart.includes('-')) {
      const [year, month, day] = datePart.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm mt-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 gap-4">
        <div>
          <h3 className="text-2xl font-normal text-gray-800">Roster & Daily Step Logger</h3>
          <p className="text-gray-500 text-sm mt-1">
            Select your pre-assigned name to log daily or weekly steps.
          </p>
        </div>

        {selectedUserId && (
          <button
            onClick={() => setSelectedUserId(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 bg-gray-100 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            <X size={16} /> Switch Participant
          </button>
        )}
      </div>

      {/* STEP LOGGING FORM (If Participant Selected) */}
      {selectedUser ? (
        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-6 animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-blue-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#4285F4] text-white flex items-center justify-center font-bold text-xl shadow-sm">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">{selectedUser.name}</h4>
                <p className="text-xs text-blue-600 font-bold">
                  {selectedUser.teamName ? `Team: ${selectedUser.teamName}` : 'Participant'} • {(selectedUser.steps || 0).toLocaleString()} total steps
                </p>
              </div>
            </div>

            <div className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-gray-600 border border-blue-100 shadow-sm">
              Current Miles: <span className="text-blue-600 text-sm font-extrabold">{((selectedUser.steps || 0) / 2000).toFixed(1)} mi</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleStepSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Date Picker (First) */}
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={EVENT_START_DATE}
                  max={EVENT_END_DATE}
                  className="h-full bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl px-3.5 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer"
                  title="Select date of steps (July 13 to August 5 only)"
                />
              </div>

              {/* Week Display (Auto-computed, Disabled) */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
                <select
                  value={selectedWeek}
                  disabled
                  className="h-full bg-gray-100 border border-gray-200 text-gray-500 text-sm font-bold rounded-xl pl-10 pr-8 py-3.5 outline-none shadow-sm cursor-not-allowed appearance-none"
                  title="Week is automatically calculated based on selected date"
                >
                  {weeksArray.map(w => (
                    <option key={w} value={w}>Week {w}</option>
                  ))}
                </select>
              </div>

              {/* Step Input */}
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={stepInput}
                  onChange={(e) => setStepInput(e.target.value)}
                  placeholder="Enter steps (e.g. 5000)..."
                  className="w-full bg-white border border-gray-200 text-lg rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium"
                  required
                  min="1"
                  max="30000"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="bg-[#4285F4] hover:bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Check size={20} /> Log Steps
              </button>
            </div>
          </form>

          {/* HISTORY LOG TABLE */}
          <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
            <div className="px-4 py-2.5 bg-blue-100/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-blue-100">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wide flex items-center gap-1.5">
                <History size={14} /> Step History for {selectedUser.name} ({selectedUser.stepHistory?.length || 0} entries)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-blue-700">Sort by:</span>
                <select
                  aria-label="Sort step history"
                  value={historySortOrder}
                  onChange={(e) => setHistorySortOrder(e.target.value as any)}
                  className="bg-white border border-blue-200 text-xs font-bold text-gray-700 rounded-lg px-2.5 py-1 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                >
                  <option value="date-desc">Newest Date First (Default)</option>
                  <option value="date-asc">Oldest Date First</option>
                  <option value="updated-desc">Recently Added First</option>
                </select>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto">
              {(!selectedUser.stepHistory || selectedUser.stepHistory.length === 0) ? (
                <div className="p-4 text-center text-gray-400 italic text-xs">No step history logged yet.</div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-gray-400 bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2 font-medium">Date</th>
                      <th className="px-4 py-2 font-medium">Week</th>
                      <th className="px-4 py-2 font-medium">Amount</th>
                      <th className="px-4 py-2 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(selectedUser.stepHistory || [])
                      .map((entry, originalIndex) => ({ entry, originalIndex }))
                      .sort((a, b) => {
                        if (historySortOrder === 'date-desc') {
                          return b.entry.date.localeCompare(a.entry.date);
                        }
                        if (historySortOrder === 'date-asc') {
                          return a.entry.date.localeCompare(b.entry.date);
                        }
                        if (historySortOrder === 'updated-desc') {
                          const timeA = a.entry.submittedAt ? new Date(a.entry.submittedAt).getTime() : a.originalIndex;
                          const timeB = b.entry.submittedAt ? new Date(b.entry.submittedAt).getTime() : b.originalIndex;
                          return timeB - timeA;
                        }
                        return 0;
                      })
                      .map(({ entry, originalIndex }) => (
                        <tr key={originalIndex} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-2.5 text-gray-500">
                            {formatEntryDate(entry.date)}
                          </td>
                          <td className="px-4 py-2.5 text-gray-600 font-bold">Week {entry.week || 1}</td>
                          <td className="px-4 py-2.5 font-bold text-gray-900">+{(entry.amount || 0).toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => onDeleteStep(selectedUser.id, originalIndex)}
                              className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                              title="Delete entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ROSTER EXPLORER (Select Participant) */
        <div className="space-y-6">
          {/* Filters, Sorting & Search Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {/* Filter by Team Dropdown */}
              <div className="relative">
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="bg-white border border-gray-200 text-xs font-bold text-gray-700 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                >
                  <option value="ALL">Filter by Team: All Teams ({users.length})</option>
                  {[...teams]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(team => {
                      const count = users.filter(u => u.teamId === team.id || u.teamName === team.name).length;
                      return (
                        <option key={team.id} value={team.id}>
                          {team.name} ({count})
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="bg-white border border-gray-200 text-xs font-bold text-gray-700 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                >
                  <option value="name-asc">Sort: Name (A – Z)</option>
                  <option value="name-desc">Sort: Name (Z – A)</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search participant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          {/* PARTICIPANT CARDS */}
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p>No pre-assigned participants found.</p>
              <p className="text-xs text-gray-400 mt-1">If you don't see your name, ask your event host to add you to a team!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className="group bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md rounded-2xl p-4 flex flex-col items-center text-center gap-2.5 transition-all duration-200 relative overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center font-bold text-lg transition-colors shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="w-full">
                    <h5 className="font-bold text-gray-800 text-sm truncate w-full px-1" title={user.name}>{user.name}</h5>
                    {user.teamName && (
                      <span className="text-[11px] text-gray-400 block truncate font-medium mt-0.5" title={user.teamName}>{user.teamName}</span>
                    )}
                    <span className="inline-block mt-2 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {(user.steps || 0).toLocaleString()} steps
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParticipantStepLogger;
