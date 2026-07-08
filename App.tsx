import React, { useState, useEffect } from 'react';
import { User, Waypoint, Team } from './types';
import { ROUTE_WAYPOINTS, TOTAL_GOAL_STEPS } from './constants';
import RaceMap from './components/RaceMap';
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
import { MapPin, Globe, Navigation, CloudOff, CloudLightning, RefreshCw, AlertTriangle, Loader2, Award, Trophy, LayoutDashboard } from 'lucide-react';
import { api } from './api';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [milestonesReached, setMilestonesReached] = useState<string[]>([]);
  const [activeNotification, setActiveNotification] = useState<Waypoint | null>(null);
  const [mapViewMode, setMapViewMode] = useState<'global' | 'local'>('global');
  
  // Navigation State (GitHub Pages compatible Hash Routing)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'teams' | 'individuals'>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('teams')) return 'teams';
    if (hash.includes('individuals') || hash.includes('racers')) return 'individuals';
    return 'dashboard';
  });

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

    return () => {
      unsubUsers();
      unsubTeams();
    };
  }, []);

  // Hash change routing for Multi-Page GitHub Pages support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('teams')) setActiveTab('teams');
      else if (hash.includes('individuals') || hash.includes('racers')) setActiveTab('individuals');
      else setActiveTab('dashboard');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToTab = (tab: 'dashboard' | 'teams' | 'individuals') => {
    setActiveTab(tab);
    if (tab === 'teams') window.location.hash = '/teams';
    else if (tab === 'individuals') window.location.hash = '/individuals';
    else window.location.hash = '/';
  };

  // Milestone Logic
  useEffect(() => {
    const segmentSize = 1 / (ROUTE_WAYPOINTS.length - 1); 
    
    ROUTE_WAYPOINTS.forEach((wp, index) => {
        const requiredProgress = index * segmentSize; 
        
        if (progressPercentage >= requiredProgress && index > 0 && !milestonesReached.includes(wp.name)) {
             setMilestonesReached(prev => [...prev, wp.name]);
             setActiveNotification(wp);
        }
    });
  }, [progressPercentage, milestonesReached]);

  // Handlers
  const handleRetryConnection = () => {
    setConnectionStatus('connecting');
    api.retryConnection();
  };

  const handleAddSteps = async (userId: string, steps: number, week: number, customDate?: string) => {
    const entryDate = customDate 
      ? (customDate.includes('T') ? customDate : new Date(`${customDate}T12:00:00`).toISOString()) 
      : new Date().toISOString();

    // Optimistic Update
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newTotal = u.steps + steps;
        const updatedWeekly = { ...u.weeklySteps };
        updatedWeekly[week] = (updatedWeekly[week] || 0) + steps;
        
        const newHistory = [...(u.stepHistory || []), { amount: steps, date: entryDate, week }];
        return { ...u, steps: newTotal, weeklySteps: updatedWeekly, stepHistory: newHistory };
      }
      return u;
    }));

    await api.addSteps(userId, steps, week, customDate);
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

  const handleResetRace = async () => {
    const confirmation = window.prompt("DANGER: This will permanently delete ALL teams, racers, and step data.\n\nEnter Admin Password to confirm:");
    
    if (confirmation && confirmation === 'AxGstepathon2026') {
        setIsResetting(true);
        try {
            await api.resetRace();
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
        <header className="flex flex-col md:flex-row justify-between items-center border-b border-gray-200 pb-6 gap-4 bg-white p-6 rounded-3xl shadow-sm border-0">
          <div>
            <h1 className="text-3xl font-normal tracking-tight">
              <span className="text-[#4285F4] font-bold">Tea&O</span> <span className="text-[#EA4335]">Amazing</span> <span className="text-[#FBBC05]">Race</span>
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Seattle to NYC • 4,195 Miles</p>
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
        </header>

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
        </nav>

        {/* Milestone Modal */}
        {activeNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl relative animate-bounce-in border border-gray-100">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#FBBC05] text-white p-3 rounded-full shadow-md">
                <MapPin size={32} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-normal text-center mt-6 text-gray-800">Checkpoint Reached</h2>
              <h3 className="text-xl text-center text-[#4285F4] font-medium mt-1">{activeNotification.name}</h3>
              <p className="text-gray-600 text-center mt-4 text-lg leading-relaxed">
                {activeNotification.fact}
              </p>
              <button 
                onClick={closeNotification}
                className="w-full mt-8 bg-[#4285F4] hover:bg-blue-600 text-white font-medium py-3 rounded-full shadow-md transition-transform active:scale-95"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: RACE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Host & Admin Panel */}
            <HostAdminPanel
              teams={teams}
              users={users}
              onAddTeam={handleAddTeam}
              onDeleteTeam={handleDeleteTeam}
              onAddParticipant={handleAddParticipant}
              onRemoveParticipant={handleRemoveParticipant}
              isAdmin={isAdmin}
              setIsAdmin={setIsAdmin}
            />

            {/* Stats Dashboard */}
            <DashboardStats totalSteps={totalSteps} activeUserCount={users.length} />

            {/* Map */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                     <div>
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Live Route Map</h3>
                        <span className="text-xs text-gray-400">Powered by Leaflet</span>
                     </div>
                     
                     <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setMapViewMode('global')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mapViewMode === 'global' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Globe size={16} />
                            Route View
                        </button>
                        <button 
                            onClick={() => setMapViewMode('local')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mapViewMode === 'local' ? 'bg-white text-[#4285F4] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Navigation size={16} />
                            Local View
                        </button>
                     </div>
                 </div>
                 <RaceMap progressPercentage={progressPercentage} viewMode={mapViewMode} />
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

        {/* TAB 2: TEAM LEADERBOARD PAGE */}
        {activeTab === 'teams' && (
          <TeamLeaderboardPage teams={teams} users={users} />
        )}

        {/* TAB 3: INDIVIDUAL LEADERBOARD PAGE */}
        {activeTab === 'individuals' && (
          <IndividualLeaderboardPage users={users} teams={teams} />
        )}

        {/* Footer Actions */}
        <ReportGenerator users={users} totalSteps={totalSteps} />

        <footer className="text-center text-gray-400 text-sm pt-12 pb-8">
           <p className="mb-4">© 2024 Tea&O • Internal Step Challenge</p>
           
           {/* Danger Zone */}
           <button 
             onClick={handleResetRace}
             disabled={isResetting}
             className="text-red-200 hover:text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mx-auto transition-colors disabled:opacity-50 disabled:cursor-wait"
           >
             {isResetting ? <Loader2 size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
             {isResetting ? 'Wiping Data...' : 'Admin Reset'}
           </button>
        </footer>
      </div>
    </div>
  );
};

export default App;