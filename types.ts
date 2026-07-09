export interface StepEntry {
  id?: string;
  amount: number;
  date: string; // ISO Date String (or YYYY-MM-DD)
  week?: number; // Optional week association (1-12)
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