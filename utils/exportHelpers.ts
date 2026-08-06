import { User, Team, AnnouncementBanner } from '../types';
import { ACCENTURE_GLOBAL_OFFICES } from '../constants';

/**
 * Escapes values for safe inclusion in CSV files.
 */
export const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Triggers a browser download of a text/blob file.
 */
export const downloadFile = (content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const getOfficeDisplayName = (locationId?: string): string => {
  if (!locationId || locationId === 'na') return 'N/A';
  const found = ACCENTURE_GLOBAL_OFFICES.find(o => o.id === locationId);
  return found ? found.displayName : locationId;
};

const getTimestampString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 1. Master Participant Roster & Weekly Breakdown (CSV)
 */
export const generateMasterRosterCSV = (users: User[], teams: Team[]): string => {
  const headers = [
    'Overall Rank',
    'Participant Name',
    'Team Name',
    'Office Location',
    'Week 1 Steps (Jul 13-19)',
    'Week 2 Steps (Jul 20-26)',
    'Week 3 Steps (Jul 27-Aug 2)',
    'Week 4 Steps (Aug 3-5)',
    'Total Cumulative Steps',
    'Total Distance (Miles)',
    'Total Distance (KM)',
    'Days Logged',
    'Avg Steps / Active Day'
  ];

  const sortedUsers = [...users].sort((a, b) => (b.steps || 0) - (a.steps || 0));

  const rows = sortedUsers.map((user, index) => {
    const team = teams.find(t => t.id === user.teamId || t.name === user.teamName);
    const officeName = getOfficeDisplayName(team?.location);

    const w1 = user.weeklySteps?.['1'] ?? user.weeklySteps?.[1] ?? 0;
    const w2 = user.weeklySteps?.['2'] ?? user.weeklySteps?.[2] ?? 0;
    const w3 = user.weeklySteps?.['3'] ?? user.weeklySteps?.[3] ?? 0;
    const w4 = user.weeklySteps?.['4'] ?? user.weeklySteps?.[4] ?? 0;

    const totalSteps = user.steps || 0;
    const totalMiles = (totalSteps / 2000).toFixed(2);
    const totalKm = ((totalSteps / 2000) * 1.60934).toFixed(2);

    const daysLogged = Array.isArray(user.stepHistory) ? user.stepHistory.length : 0;
    const avgPerDay = daysLogged > 0 ? Math.round(totalSteps / daysLogged) : 0;

    return [
      index + 1,
      escapeCSV(user.name),
      escapeCSV(user.teamName || team?.name || 'Independent / Unassigned'),
      escapeCSV(officeName),
      w1,
      w2,
      w3,
      w4,
      totalSteps,
      totalMiles,
      totalKm,
      daysLogged,
      avgPerDay
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

/**
 * 2. Team Standings & Summary (CSV)
 */
export const generateTeamSummaryCSV = (users: User[], teams: Team[]): string => {
  const headers = [
    'Team Rank',
    'Team Name',
    'Office Location',
    'Total Members',
    'Total Team Steps',
    'Total Miles',
    'Total Kilometers',
    'Avg Steps / Racer',
    'Top Contributor Name',
    'Top Contributor Steps',
    'Team Member Roster'
  ];

  const teamData = teams.map(team => {
    const members = users.filter(u => u.teamId === team.id || u.teamName === team.name);
    const totalTeamSteps = members.reduce((sum, m) => sum + (m.steps || 0), 0);
    const totalMiles = (totalTeamSteps / 2000).toFixed(2);
    const totalKm = ((totalTeamSteps / 2000) * 1.60934).toFixed(2);
    const avgStepsPerRacer = members.length > 0 ? Math.round(totalTeamSteps / members.length) : 0;

    const sortedMembers = [...members].sort((a, b) => (b.steps || 0) - (a.steps || 0));
    const topContributor = sortedMembers[0];
    const topContributorName = topContributor ? topContributor.name : 'N/A';
    const topContributorSteps = topContributor ? (topContributor.steps || 0) : 0;
    const memberRoster = members.map(m => m.name).join('; ');

    return {
      team,
      totalTeamSteps,
      totalMiles,
      totalKm,
      avgStepsPerRacer,
      memberCount: members.length,
      topContributorName,
      topContributorSteps,
      memberRoster
    };
  }).sort((a, b) => b.totalTeamSteps - a.totalTeamSteps);

  const rows = teamData.map((item, index) => {
    const officeName = getOfficeDisplayName(item.team.location);
    return [
      index + 1,
      escapeCSV(item.team.name),
      escapeCSV(officeName),
      item.memberCount,
      item.totalTeamSteps,
      item.totalMiles,
      item.totalKm,
      item.avgStepsPerRacer,
      escapeCSV(item.topContributorName),
      item.topContributorSteps,
      escapeCSV(item.memberRoster)
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

/**
 * 3. Granular Daily Step Activity Log (CSV)
 */
export const generateDailyActivityLogCSV = (users: User[], teams: Team[]): string => {
  const headers = [
    'Log Date (YYYY-MM-DD)',
    'Challenge Week',
    'Participant Name',
    'Team Name',
    'Office Location',
    'Daily Steps Logged',
    'Miles Equivalent',
    'Submission Timestamp (UTC)'
  ];

  interface FlatLogEntry {
    date: string;
    week: number;
    userName: string;
    teamName: string;
    officeName: string;
    steps: number;
    miles: string;
    submittedAt: string;
  }

  const entries: FlatLogEntry[] = [];

  users.forEach(user => {
    const team = teams.find(t => t.id === user.teamId || t.name === user.teamName);
    const officeName = getOfficeDisplayName(team?.location);
    const teamName = user.teamName || team?.name || 'Independent';

    if (Array.isArray(user.stepHistory) && user.stepHistory.length > 0) {
      user.stepHistory.forEach(historyItem => {
        const steps = Number(historyItem.amount) || 0;
        entries.push({
          date: historyItem.date || 'N/A',
          week: historyItem.week || 1,
          userName: user.name,
          teamName,
          officeName,
          steps,
          miles: (steps / 2000).toFixed(2),
          submittedAt: historyItem.submittedAt || 'N/A'
        });
      });
    }
  });

  // Sort logs by date descending, then participant name
  entries.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return a.userName.localeCompare(b.userName);
  });

  const rows = entries.map(entry => [
    escapeCSV(entry.date),
    entry.week,
    escapeCSV(entry.userName),
    escapeCSV(entry.teamName),
    escapeCSV(entry.officeName),
    entry.steps,
    entry.miles,
    escapeCSV(entry.submittedAt)
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
};

/**
 * 4. Complete Raw JSON Backup
 */
export const generateRawJSONBackup = (users: User[], teams: Team[], announcement?: AnnouncementBanner | null): string => {
  const totalEventSteps = users.reduce((sum, u) => sum + (u.steps || 0), 0);
  const payload = {
    exportedAt: new Date().toISOString(),
    event: "2nd Annual Global Step-a-Thon",
    summary: {
      totalParticipants: users.length,
      totalTeams: teams.length,
      totalSteps: totalEventSteps,
      totalMiles: Number((totalEventSteps / 2000).toFixed(2))
    },
    teams,
    users,
    announcement: announcement || null
  };

  return JSON.stringify(payload, null, 2);
};

/**
 * High-level Download Handlers
 */
export const downloadMasterRosterCSV = (users: User[], teams: Team[]) => {
  const content = generateMasterRosterCSV(users, teams);
  const dateStr = getTimestampString();
  downloadFile(content, `stepathon_2026_master_roster_${dateStr}.csv`);
};

export const downloadTeamSummaryCSV = (users: User[], teams: Team[]) => {
  const content = generateTeamSummaryCSV(users, teams);
  const dateStr = getTimestampString();
  downloadFile(content, `stepathon_2026_team_standings_${dateStr}.csv`);
};

export const downloadDailyActivityLogCSV = (users: User[], teams: Team[]) => {
  const content = generateDailyActivityLogCSV(users, teams);
  const dateStr = getTimestampString();
  downloadFile(content, `stepathon_2026_daily_activity_log_${dateStr}.csv`);
};

export const downloadRawJSONBackup = (users: User[], teams: Team[], announcement?: AnnouncementBanner | null) => {
  const content = generateRawJSONBackup(users, teams, announcement);
  const dateStr = getTimestampString();
  downloadFile(content, `stepathon_2026_complete_backup_${dateStr}.json`, 'application/json;charset=utf-8;');
};
