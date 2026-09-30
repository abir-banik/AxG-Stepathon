export const IS_EVENT_CONCLUDED = false; // Toggle true after event ends to show Thank You landing page
export const SITE_ACCESS_PASSWORD = 'STEPATHON2026'; // Shared participant password to access the site
export const HOST_ADMIN_PASSCODE = 'AxGstepathon2026'; // Host admin portal passcode
export const SITE_AUTH_STORAGE_KEY = 'stepathon_v3_site_auth';

export const EVENT_START_DATE = '2026-07-13';
export const EVENT_END_DATE = '2026-08-05';

export const GLOBAL_STEP_GOAL = 35000000; // 35,000,000 Global Step Target
export const TOTAL_GOAL_STEPS = GLOBAL_STEP_GOAL;
export const STEPS_PER_MILE = 2000;
export const TOTAL_GOAL_MILES = GLOBAL_STEP_GOAL / STEPS_PER_MILE;
export const MAX_USERS = 200;
export const MAX_PARTICIPANT_STEPS_PER_ENTRY = 30000;
export const MAX_HOST_OVERRIDE_STEPS_PER_ENTRY = 200000;
export const TOTAL_WEEKS = 4; // 4-Week Challenge (July 13th - Aug 5th)

export interface WeekDefinition {
  weekNumber: number;
  label: string;
  startDate: string;
  endDate: string;
  shortRange: string;
  startIso: string;
  endIso: string;
  deadlineUtc: string;
}

export const EVENT_WEEKS: WeekDefinition[] = [
  {
    weekNumber: 1,
    label: "Week 1",
    startDate: "July 13",
    endDate: "July 19",
    shortRange: "Jul 13-19",
    startIso: "2026-07-13",
    endIso: "2026-07-19",
    deadlineUtc: "2026-07-21T00:00:00.000Z" // Monday July 20 @ 8:00 PM ET
  },
  {
    weekNumber: 2,
    label: "Week 2",
    startDate: "July 20",
    endDate: "July 26",
    shortRange: "Jul 20-26",
    startIso: "2026-07-20",
    endIso: "2026-07-26",
    deadlineUtc: "2026-07-28T00:00:00.000Z" // Monday July 27 @ 8:00 PM ET
  },
  {
    weekNumber: 3,
    label: "Week 3",
    startDate: "July 27",
    endDate: "August 2",
    shortRange: "Jul 27-Aug 2",
    startIso: "2026-07-27",
    endIso: "2026-08-02",
    deadlineUtc: "2026-08-04T00:00:00.000Z" // Monday August 3 @ 8:00 PM ET
  },
  {
    weekNumber: 4,
    label: "Week 4",
    startDate: "August 3",
    endDate: "August 5",
    shortRange: "Aug 3-5",
    startIso: "2026-08-03",
    endIso: "2026-08-05",
    deadlineUtc: "2026-08-06T14:00:00.000Z" // Thursday August 6 @ 9:00 AM EST
  }
];

export const WEEKLY_DEADLINES: Record<number, string> = Object.fromEntries(
  EVENT_WEEKS.map(w => [w.weekNumber, w.deadlineUtc])
);

export const computeWeekFromDate = (dateStr: string): number => {
  if (!dateStr) return 1;
  const cleanDate = dateStr.substring(0, 10);
  for (let i = EVENT_WEEKS.length - 1; i >= 0; i--) {
    if (cleanDate >= EVENT_WEEKS[i].startIso) {
      return EVENT_WEEKS[i].weekNumber;
    }
  }
  return 1;
};

export interface AccentureOffice {
  id: string;
  city: string;
  country: string;
  displayName: string;
  lat: number;
  lng: number;
}

export const ACCENTURE_GLOBAL_OFFICES: AccentureOffice[] = [
  { id: 'na', city: 'N/A', country: 'N/A', displayName: 'N/A', lat: 0, lng: 0 },
  { id: 'manila', city: 'Manila', country: 'Philippines', displayName: 'Manila, Philippines', lat: 14.5547, lng: 121.0244 },
  { id: 'chicago', city: 'Chicago, IL', country: 'United States', displayName: 'Chicago, IL (US)', lat: 41.8781, lng: -87.6298 },
  { id: 'bangalore', city: 'Bangalore', country: 'India', displayName: 'Bangalore, India', lat: 12.9716, lng: 77.5946 },
  { id: 'kuala_lumpur', city: 'Kuala Lumpur', country: 'Malaysia', displayName: 'Kuala Lumpur, Malaysia', lat: 3.1390, lng: 101.6869 },
  { id: 'austin', city: 'Austin, TX', country: 'United States', displayName: 'Austin, TX (US)', lat: 30.2672, lng: -97.7431 },
  { id: 'dublin', city: 'Dublin', country: 'Ireland', displayName: 'Dublin, Ireland', lat: 53.3498, lng: -6.2603 },
  { id: 'london', city: 'London', country: 'United Kingdom', displayName: 'London, UK', lat: 51.5074, lng: -0.1278 },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', displayName: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { id: 'sydney', city: 'Sydney', country: 'Australia', displayName: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
  { id: 'singapore', city: 'Singapore', country: 'Singapore', displayName: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { id: 'madrid', city: 'Madrid', country: 'Spain', displayName: 'Madrid, Spain', lat: 40.4168, lng: -3.7038 },
  { id: 'buenos_aires', city: 'Buenos Aires', country: 'Argentina', displayName: 'Buenos Aires, Argentina', lat: -34.6037, lng: -58.3816 },
  { id: 'toronto', city: 'Toronto', country: 'Canada', displayName: 'Toronto, Canada', lat: 43.6532, lng: -79.3832 },
  { id: 'san_francisco', city: 'San Francisco, CA', country: 'United States', displayName: 'San Francisco, CA (US)', lat: 37.7749, lng: -122.4194 },
  { id: 'new_york', city: 'New York, NY', country: 'United States', displayName: 'New York, NY (US)', lat: 40.7128, lng: -74.0060 }
];

export const INITIAL_USERS = [];