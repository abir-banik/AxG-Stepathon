import { describe, it, expect, vi } from 'vitest';
import { 
  escapeCSV, 
  generateMasterRosterCSV, 
  generateTeamSummaryCSV, 
  generateDailyActivityLogCSV, 
  generateRawJSONBackup 
} from '../utils/exportHelpers';
import { User, Team, AnnouncementBanner } from '../types';

const mockTeams: Team[] = [
  { id: 'team-1', name: 'Boba Walkers, Inc.', color: '#4285F4', iconId: 'trophy', location: 'chicago' },
  { id: 'team-2', name: 'Trailblazers', color: '#34A853', iconId: 'flame', location: 'manila' }
];

const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alice "The Runner" Smith',
    teamId: 'team-1',
    teamName: 'Boba Walkers, Inc.',
    steps: 25000,
    weeklySteps: { '1': 10000, '2': 15000 },
    stepHistory: [
      { date: '2026-07-15', amount: 10000, week: 1, submittedAt: '2026-07-15T18:00:00.000Z' },
      { date: '2026-07-22', amount: 15000, week: 2, submittedAt: '2026-07-22T19:30:00.000Z' }
    ],
    iconId: 'smile'
  },
  {
    id: 'user-2',
    name: 'Bob Jones',
    teamId: 'team-1',
    teamName: 'Boba Walkers, Inc.',
    steps: 15000,
    weeklySteps: { '1': 5000, '2': 10000 },
    stepHistory: [
      { date: '2026-07-16', amount: 5000, week: 1, submittedAt: '2026-07-16T10:00:00.000Z' },
      { date: '2026-07-23', amount: 10000, week: 2, submittedAt: '2026-07-23T12:00:00.000Z' }
    ],
    iconId: 'cat'
  },
  {
    id: 'user-3',
    name: 'Charlie Brown',
    teamId: 'team-2',
    teamName: 'Trailblazers',
    steps: 30000,
    weeklySteps: { '1': 12000, '2': 18000 },
    stepHistory: [
      { date: '2026-07-14', amount: 12000, week: 1, submittedAt: '2026-07-14T08:00:00.000Z' },
      { date: '2026-07-21', amount: 18000, week: 2, submittedAt: '2026-07-21T09:00:00.000Z' }
    ],
    iconId: 'dog'
  }
];

describe('Export Helpers Utility', () => {
  it('escapes strings with commas, quotes, and newlines in CSVs', () => {
    expect(escapeCSV('Simple')).toBe('Simple');
    expect(escapeCSV('Hello, World')).toBe('"Hello, World"');
    expect(escapeCSV('Alice "The Great"')).toBe('"Alice ""The Great"""');
    expect(escapeCSV('Line 1\nLine 2')).toBe('"Line 1\nLine 2"');
    expect(escapeCSV(null)).toBe('');
    expect(escapeCSV(undefined)).toBe('');
  });

  it('generates Master Participant Roster CSV with rankings and weekly steps', () => {
    const csv = generateMasterRosterCSV(mockUsers, mockTeams);
    const lines = csv.split('\n');

    // Header validation
    expect(lines[0]).toContain('Overall Rank,Participant Name,Team Name,Office Location');
    expect(lines[0]).toContain('Week 1 Steps (Jul 13-19)');
    expect(lines[0]).toContain('Total Cumulative Steps');

    // Top participant should be Charlie Brown (30,000 steps)
    expect(lines[1]).toContain('1,Charlie Brown,Trailblazers');
    expect(lines[1]).toContain('30000');

    // Second participant should be Alice (25,000 steps with escaped quotes)
    expect(lines[2]).toContain('2,"Alice ""The Runner"" Smith","Boba Walkers, Inc."');
    expect(lines[2]).toContain('25000');

    // Third participant should be Bob (15,000 steps)
    expect(lines[3]).toContain('3,Bob Jones,"Boba Walkers, Inc."');
    expect(lines[3]).toContain('15000');
  });

  it('generates Team Standings Summary CSV with aggregate rankings', () => {
    const csv = generateTeamSummaryCSV(mockUsers, mockTeams);
    const lines = csv.split('\n');

    // Header validation
    expect(lines[0]).toContain('Team Rank,Team Name,Office Location,Total Members,Total Team Steps');

    // Team 1: Boba Walkers (Alice 25k + Bob 15k = 40,000 steps)
    // Team 2: Trailblazers (Charlie 30k = 30,000 steps)
    expect(lines[1]).toContain('1,"Boba Walkers, Inc."');
    expect(lines[1]).toContain('40000');
    expect(lines[1]).toContain('20.00'); // 40000 / 2000 = 20.00 miles
    expect(lines[1]).toContain('20000'); // avg per racer: 40000 / 2 = 20000

    expect(lines[2]).toContain('2,Trailblazers');
    expect(lines[2]).toContain('30000');
  });

  it('generates Granular Daily Activity Log CSV for audit trail', () => {
    const csv = generateDailyActivityLogCSV(mockUsers, mockTeams);
    const lines = csv.split('\n');

    expect(lines[0]).toContain('Log Date (YYYY-MM-DD),Challenge Week,Participant Name,Team Name');

    // Total entries across 3 users = 6 rows
    expect(lines.length).toBe(7); // 1 header + 6 rows
    expect(csv).toContain('2026-07-23');
    expect(csv).toContain('2026-07-22');
    expect(csv).toContain('2026-07-21');
  });

  it('generates complete Raw JSON Database Backup', () => {
    const mockAnnouncement: AnnouncementBanner = {
      message: 'Test message',
      type: 'info',
      active: true
    };

    const jsonStr = generateRawJSONBackup(mockUsers, mockTeams, mockAnnouncement);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.event).toBe('2nd Annual Global Step-a-Thon');
    expect(parsed.summary.totalParticipants).toBe(3);
    expect(parsed.summary.totalTeams).toBe(2);
    expect(parsed.summary.totalSteps).toBe(70000); // 25k + 15k + 30k
    expect(parsed.teams.length).toBe(2);
    expect(parsed.users.length).toBe(3);
    expect(parsed.announcement.message).toBe('Test message');
  });
});
