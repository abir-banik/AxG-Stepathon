import React, { useState, useEffect } from 'react';
import { User, Waypoint, Team, AnnouncementBanner } from './types';
import { ROUTE_WAYPOINTS, TOTAL_GOAL_STEPS } from './constants';
import RaceMap from './components/RaceMap';
import GlobalOfficeMap from './components/GlobalOfficeMap';
import DashboardStats from './components/DashboardStats';
import Leaderboard from './components/Leaderboard';
import TimeBasedLeaderboard from './components/TimeBasedLeaderboard';
import WeeklyAnalytics from './components/WeeklyAnalytics';
import ReportGenerator from './components/ReportGenerator';
import HostAdminPanel from './components/HostAdminPanel';
import ParticipantStepLogger from './components/ParticipantStepLogger';
import TeamLeaderboard from './components/TeamLeaderboard';
import TeamLeaderboardPage from './pages/TeamLeaderboardPage';
import IndividualLeaderboardPage from './pages/IndividualLeaderboardPage';
import WeeklyLeaderboardPage from './pages/WeeklyLeaderboardPage';
import FaqPage from './components/FaqPage';
import AnnouncementBannerView from './components/AnnouncementBannerView';
import { MapPin, Globe, Navigation, CloudOff, CloudLightning, RefreshCw, AlertTriangle, Loader2, Award, Trophy, LayoutDashboard, Calendar, HelpCircle } from 'lucide-react';
import { api } from './api';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [announcement, setAnnouncement] = useState<AnnouncementBanner | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [milestonesReached, setMilestonesReached] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tea_o_milestones_reached');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeNotification, setActiveNotification] = useState<Waypoint | null>(null);
  const [mapViewMode, setMapViewMode] = useState<'global' | 'local'>('global');
  
  // Navigation State (GitHub Pages compatible Hash Routing)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'weekly' | 'teams' | 'individuals' | 'faq'>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('weekly')) return 'weekly';
    if (hash.includes('teams')) return 'teams';
    if (hash.includes('individuals') || hash.includes('racers')) return 'individuals';
    if (hash.includes('faq') || hash.includes('guide')) return 'faq';
    return 'dashboard';
  });

  // Unit Preference (Miles vs Kilometers)
  const [distanceUnit, setDistanceUnit] = useState<'mi' | 'km'>(() => {
    const saved = localStorage.getItem('tea_o_distance_unit');
    return (saved === 'km' || saved === 'mi') ? saved : 'mi';
  });

  const handleToggleUnit = (unit: 'mi' | 'km') => {
    setDistanceUnit(unit);
    localStorage.setItem('tea_o_distance_unit', unit);
  };

  // Status State
  const [isOffline, setIsOffline] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'live' | 'local'>('connecting');
  const [isResetting, setIsResetting] = useState(false);

  // Derived State
  const totalSteps = users.reduce((acc, user) => acc + (Number(user.steps) || 0), 0);
  const progressPercentage = Math.min(totalSteps / TOTAL_GOAL_STEPS, 1);

  // --- API INTEGRATION ---
  useEffect(() => {
    const unsubUsers = api.subscribeToUsers((data, isOnline) => {
       setUsers(data);
       if (isOnline) {
         setConnectionStatus('live');
         setIsOffline(false);
       } else {
         setConnectionStatus('local');
         setIsOffline(true);
       }
    });

    const unsubTeams = api.subscribeToTeams((teamData) => {
       setTeams(teamData);
    });

    const unsubAnnouncement = api.subscribeToAnnouncement((announcementData) => {
       setAnnouncement(announcementData);
    });

    return () => {
      unsubUsers();
      unsubTeams();
      unsubAnnouncement();
    };
  }, []);

  // Hash change routing for Multi-Page GitHub Pages support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('weekly')) setActiveTab('weekly');
      else if (hash.includes('teams')) setActiveTab('teams');
      else if (hash.includes('individuals') || hash.includes('racers')) setActiveTab('individuals');
      else if (hash.includes('faq') || hash.includes('guide')) setActiveTab('faq');
      else setActiveTab('dashboard');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToTab = (tab: 'dashboard' | 'weekly' | 'teams' | 'individuals' | 'faq') => {
    setActiveTab(tab);
    if (tab === 'weekly') window.location.hash = '/weekly';
    else if (tab === 'teams') window.location.hash = '/teams';
    else if (tab === 'individuals') window.location.hash = '/individuals';
    else if (tab === 'faq') window.location.hash = '/faq';
    else window.location.hash = '/';
  };

  // Milestone Logic
  useEffect(() => {
    const segmentSize = 1 / (ROUTE_WAYPOINTS.length - 1); 
    
    ROUTE_WAYPOINTS.forEach((wp, index) => {
        const requiredProgress = index * segmentSize; 
        
        if (progressPercentage >= requiredProgress && index > 0 && !milestonesReached.includes(wp.name)) {
             setMilestonesReached(prev => {
               const updated = [...prev, wp.name];
               localStorage.setItem('tea_o_milestones_reached', JSON.stringify(updated));
               return updated;
             });
        }
    });
  }, [progressPercentage, milestonesReached]);

  // Handlers
  const handleRetryConnection = () => {
    setConnectionStatus('connecting');
    api.retryConnection();
  };

  const handleAddSteps = async (userId: string, steps: number, week: number, customDate?: string, bypassMaxLimit: boolean = false) => {
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const entryDate = customDate ? customDate.substring(0, 10) : localToday;
    const submittedAt = now.toISOString();

    // Optimistic Update with Date Override Logic
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const currentHistory = Array.isArray(u.stepHistory) ? u.stepHistory : [];
        const historyWithoutSameDate = currentHistory.filter(e => e.date !== entryDate);
        const newHistory = [...historyWithoutSameDate, { amount: steps, date: entryDate, week, submittedAt }];
        
        const newTotal = newHistory.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const updatedWeekly: Record<string, number> = {};
        newHistory.forEach(e => {
          const wk = String(e.week || 1);
          updatedWeekly[wk] = (updatedWeekly[wk] || 0) + (Number(e.amount) || 0);
        });

        return { ...u, steps: newTotal, weeklySteps: updatedWeekly, stepHistory: newHistory };
      }
      return u;
    }));

    await api.addSteps(userId, steps, week, customDate, bypassMaxLimit);
  };

  const handleDeleteStep = async (userId: string, entryIndex: number) => {
     setUsers(prev => prev.map(u => {
        if (u.id === userId && u.stepHistory && u.stepHistory[entryIndex]) {
            const removedAmount = u.stepHistory[entryIndex].amount || 0;
            const removedWeek = u.stepHistory[entryIndex].week || 1;
            
            const newHistory = u.stepHistory.filter((_, idx) => idx !== entryIndex);
            const newTotal = Math.max(0, u.steps - removedAmount);
            
            const updatedWeekly = { ...u.weeklySteps };
            if (updatedWeekly[removedWeek]) {
                updatedWeekly[removedWeek] = Math.max(0, updatedWeekly[removedWeek] - removedAmount);
            }

            return { ...u, steps: newTotal, weeklySteps: updatedWeekly, stepHistory: newHistory };
        }
        return u;
     }));

     await api.removeStepEntry(userId, entryIndex);
  };

  const handleAddTeam = async (name: string, color: string, iconId: string) => {
    return await api.addTeam(name, color, iconId);
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm("Delete this team? Participants will remain but lose team association.")) return;
    await api.deleteTeam(teamId);
  };

  const handleAddParticipant = async (name: string, teamId: string, teamName: string, iconId: string) => {
    await api.addUser(name, teamName, iconId, teamId);
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!window.confirm("Remove this participant?")) return;
    await api.deleteUser(participantId);
  };

  const handleUpdateAnnouncement = async (announcementData: AnnouncementBanner) => {
    await api.updateAnnouncement(announcementData);
  };

  const handleResetRace = async () => {
    const confirmation = window.prompt("DANGER: This will permanently delete ALL teams, racers, and step data.\n\nEnter Admin Password to confirm:");
    
    if (confirmation && confirmation === 'AxGstepathon2026') {
        setIsResetting(true);
        try {
            await api.resetRace();
            localStorage.removeItem('tea_o_milestones_reached');
            setUsers([]);
            setTeams([]);
            setTimeout(() => {
                window.location.reload(); 
            }, 500);
        } catch(e) {
            alert("Reset failed. Check console.");
            setIsResetting(false);
        }
    }
  };

  const closeNotification = () => setActiveNotification(null);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 p-4 md:p-8 pb-32 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Connection Error Toast */}
        {isOffline && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-bounce-in border border-gray-700">
             <CloudOff size={20} className="text-gray-400" />
             <span className="text-sm">Offline Mode</span>
             <button 
                onClick={handleRetryConnection}
                className="ml-2 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1"
             >
                <RefreshCw size={12} /> RETRY
             </button>
          </div>
        )}

        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 gap-4 bg-white p-6 rounded-3xl shadow-sm border-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="text-[#4285F4]">2nd</span>{" "}
              <span className="text-[#EA4335]">Annual</span>{" "}
              <span className="text-[#FBBC05]">Global</span>{" "}
              <span className="text-[#34A853]">Stepathon</span>
            </h1>
            <p className="text-gray-500 mt-1 font-bold text-xs uppercase tracking-wider">
              Inclusion & Diversity + Care • July 13 – August 7, 2026
            </p>
            <div className="mt-2.5 inline-flex flex-wrap items-center gap-2 text-xs font-bold text-gray-600 bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-100">
              <span>🌍 10+ Countries</span>
              <span className="text-gray-300">•</span>
              <span>🏆 39+ Teams</span>
              <span className="text-gray-300">•</span>
              <span>👟 135+ Participants</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Unit Preference Toggle (Miles vs Kilometers) */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl border border-gray-200">
              <button
                onClick={() => handleToggleUnit('mi')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  distanceUnit === 'mi'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Miles (mi)
              </button>
              <button
                onClick={() => handleToggleUnit('km')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  distanceUnit === 'km'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Kilometers (km)
              </button>
            </div>

            {/* Status Badge */}
            {connectionStatus === 'live' && (
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100 transition-colors">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-bold text-[#34A853]">LIVE SYNC</span>
              </div>
            )}
            
            {connectionStatus === 'local' && (
               <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200 transition-colors">
                <CloudOff size={16} className="text-gray-500" />
                <span className="text-sm font-bold text-gray-500">OFFLINE</span>
              </div>
            )}

             {connectionStatus === 'connecting' && (
               <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 transition-colors">
                <CloudLightning size={16} className="text-blue-500 animate-pulse" />
                <span className="text-sm font-bold text-blue-500">CONNECTING...</span>
              </div>
            )}
          </div>
        </header>

        {/* EVENT ANNOUNCEMENT BANNER */}
        <AnnouncementBannerView announcement={announcement} />

        {/* MULTI-PAGE NAVIGATION TABS (GitHub Pages & SPA compatible) */}
        <nav className="flex flex-col sm:flex-row bg-white p-2 rounded-2xl border border-gray-100 shadow-sm gap-2">
          <button
            onClick={() => navigateToTab('dashboard')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#4285F4] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard size={18} /> Race Dashboard
          </button>

          <button
            onClick={() => navigateToTab('weekly')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'weekly'
                ? 'bg-[#4285F4] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Calendar size={18} /> Weekly Leaderboard
          </button>

          <button
            onClick={() => navigateToTab('teams')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'teams'
                ? 'bg-[#4285F4] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Award size={18} /> Team Leaderboard
          </button>

          <button
            onClick={() => navigateToTab('individuals')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'individuals'
                ? 'bg-[#4285F4] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Trophy size={18} /> Individual Leaderboard
          </button>

          <button
            onClick={() => navigateToTab('faq')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'faq'
                ? 'bg-[#4285F4] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <HelpCircle size={18} /> FAQ & Guide
          </button>
        </nav>

        {/* TAB 1: RACE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Host & Admin Panel */}
            <HostAdminPanel
              teams={teams}
              users={users}
              announcement={announcement}
              onAddTeam={handleAddTeam}
              onDeleteTeam={handleDeleteTeam}
              onAddParticipant={handleAddParticipant}
              onRemoveParticipant={handleRemoveParticipant}
              onAddSteps={handleAddSteps}
              onHealData={api.healAllRacerData}
              onUpdateAnnouncement={handleUpdateAnnouncement}
              isAdmin={isAdmin}
              setIsAdmin={setIsAdmin}
            />

            {/* Stats Dashboard */}
            <DashboardStats totalSteps={totalSteps} activeUserCount={users.length} distanceUnit={distanceUnit} />

            {/* 35M Global Step Goal Progress Bar */}
            <GlobalOfficeMap teams={teams} users={users} distanceUnit={distanceUnit} />

            {/* Community Photo & Selfie Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-amber-100 text-xl">
                  📸
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">Share Your Walking Selfies & Team Pictures!</h4>
                  <p className="text-amber-100 text-xs mt-0.5">
                    Post your photos in team chat for bonus points, weekly shoutouts, and a chance to win extra prizes.
                  </p>
                </div>
              </div>
              <div className="bg-white text-gray-900 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm whitespace-nowrap">
                🌟 Bonus Points & Shoutouts
              </div>
            </div>

            {/* Participant Step Logger */}
            <ParticipantStepLogger
              users={users}
              teams={teams}
              onAddSteps={handleAddSteps}
              onDeleteStep={handleDeleteStep}
            />
          </div>
        )}

        {/* TAB 2: WEEKLY LEADERBOARD PAGE */}
        {activeTab === 'weekly' && (
          <WeeklyLeaderboardPage users={users} teams={teams} distanceUnit={distanceUnit} />
        )}

        {/* TAB 3: TEAM LEADERBOARD PAGE */}
        {activeTab === 'teams' && (
          <TeamLeaderboardPage teams={teams} users={users} distanceUnit={distanceUnit} />
        )}

        {/* TAB 4: INDIVIDUAL LEADERBOARD PAGE */}
        {activeTab === 'individuals' && (
          <IndividualLeaderboardPage users={users} teams={teams} distanceUnit={distanceUnit} />
        )}

        {/* TAB 5: FAQ & GUIDE PAGE */}
        {activeTab === 'faq' && (
          <FaqPage />
        )}

        {/* Footer Actions */}
        <ReportGenerator users={users} totalSteps={totalSteps} />

        <footer className="text-center text-gray-400 text-sm pt-12 pb-8 space-y-3">
           <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-500">
             <span>Spotted a bug or have an idea?</span>
             <a
               href="https://forms.office.com/r/Zg03YymPPq"
               target="_blank"
               rel="noopener noreferrer"
               className="text-[#4285F4] hover:text-blue-700 underline font-bold transition-colors inline-flex items-center gap-1"
             >
               ✨ Help us improve the site
             </a>
           </div>

           <p className="font-medium text-gray-500 text-xs">© 2026 Inclusion & Diversity + Care • Stepathon</p>
           
           {/* Danger Zone */}
           <button 
             onClick={handleResetRace}
             disabled={isResetting}
             className="text-red-200 hover:text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 mx-auto transition-colors disabled:opacity-50 disabled:cursor-wait"
           >
             {isResetting ? <Loader2 size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
             {isResetting ? 'Wiping Data...' : 'Admin Reset'}
           </button>
        </footer>

        {/* FLOATING FEEDBACK PILL (Option 1 - Bottom Right) */}
        <aside aria-label="Feedback link" className="fixed bottom-6 right-6 z-40">
          <a
            href="https://forms.office.com/r/Zg03YymPPq"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 bg-white/95 backdrop-blur-md text-gray-800 hover:text-[#4285F4] border border-gray-200/90 hover:border-blue-300 px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 text-xs font-bold"
            title="Help us improve the Stepathon site! (Feedback & Bug Reports)"
          >
            <span className="w-6 h-6 rounded-full bg-blue-50 text-[#4285F4] group-hover:bg-[#4285F4] group-hover:text-white flex items-center justify-center transition-colors text-xs shadow-xs">
              ✨
            </span>
            <span className="hidden sm:inline font-bold">Help improve the site</span>
            <span className="sm:hidden font-bold">Feedback</span>
          </a>
        </aside>
      </div>
    </div>
  );
};

export default App;