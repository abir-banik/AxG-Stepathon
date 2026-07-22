export interface StepEntry {
  id?: string;
  amount: number;
  date: string; // Plain YYYY-MM-DD string
  week?: number; // Optional week association (1-12)
  submittedAt?: string; // UTC ISO timestamp of when entry was submitted
  participantId?: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  iconId: string;
  location?: string;
  lat?: number;
  lng?: number;
  totalSteps?: number;
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  teamId?: string;
  teamName?: string; 
  steps: number; // Total cumulative steps
  weeklySteps?: Record<string, number>; // Map of "1": 5000, "2": 10000
  stepHistory?: StepEntry[]; 
  iconId: string;
}

export interface Participant extends User {
  teamId?: string;
}

export interface Waypoint {
  name: string;
  lat: number;
  lng: number;
  fact: string;
  cumulativeDist?: number; 
}

export interface RaceState {
  users: User[];
  teams: Team[];
  milestonesReached: string[];
}

export interface AnnouncementBanner {
  id?: string;
  message: string;
  type?: 'info' | 'warning' | 'celebration' | 'alert';
  active: boolean;
  updatedAt?: string;
}