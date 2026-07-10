import { Waypoint } from './types';

export const GLOBAL_STEP_GOAL = 35000000; // 35,000,000 Global Step Target
export const TOTAL_GOAL_STEPS = GLOBAL_STEP_GOAL;
export const STEPS_PER_MILE = 2000;
export const TOTAL_GOAL_MILES = GLOBAL_STEP_GOAL / STEPS_PER_MILE;
export const MAX_USERS = 200;
export const TOTAL_WEEKS = 4; // 4-Week Challenge (July 13th - Aug 7th)

export interface WeekDefinition {
  weekNumber: number;
  label: string;
  startDate: string;
  endDate: string;
}

export const EVENT_WEEKS: WeekDefinition[] = [
  { weekNumber: 1, label: "Week 1", startDate: "July 13", endDate: "July 19" },
  { weekNumber: 2, label: "Week 2", startDate: "July 20", endDate: "July 26" },
  { weekNumber: 3, label: "Week 3", startDate: "July 27", endDate: "August 2" },
  { weekNumber: 4, label: "Week 4", startDate: "August 3", endDate: "August 5" }
];

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

// Route: Seattle -> SF -> LA -> Vegas -> Moab -> Denver -> Chicago -> Philly -> NYC
export const ROUTE_WAYPOINTS: Waypoint[] = [
  {
    name: "Seattle, WA",
    lat: 47.6062,
    lng: -122.3321,
    fact: "Start Line! Did you know Seattle has a troll living under the Aurora Bridge?"
  },
  {
    name: "San Francisco, CA",
    lat: 37.7749,
    lng: -122.4194,
    fact: "The Golden Gate Bridge's color is officially called 'International Orange'."
  },
  {
    name: "Los Angeles, CA",
    lat: 34.0522,
    lng: -118.2437,
    fact: "LA's full name is 'El Pueblo de Nuestra Señora la Reina de los Ángeles del Río Porciúncula'."
  },
  {
    name: "Las Vegas, NV",
    lat: 36.1699,
    lng: -115.1398,
    fact: "The Luxor Las Vegas Sky Beam is the brightest light beam in the world."
  },
  {
    name: "Moab, UT",
    lat: 38.5733,
    lng: -109.5498,
    fact: "Moab is home to the stunning arches of Arches National Park."
  },
  {
    name: "Denver, CO",
    lat: 39.7392,
    lng: -104.9903,
    fact: "The 13th step of the State Capitol building is exactly one mile above sea level."
  },
  {
    name: "Chicago, IL",
    lat: 41.8781,
    lng: -87.6298,
    fact: "The Chicago River is the only river in the world that flows backwards."
  },
  {
    name: "Philadelphia, PA",
    lat: 39.9526,
    lng: -75.1652,
    fact: "Philadelphia is home to America's first zoo and first hospital."
  },
  {
    name: "New York City, NY",
    lat: 40.7128,
    lng: -74.0060,
    fact: "Finish Line! NYC has more than 800 languages spoken, making it the most linguistically diverse city."
  }
];

export const INITIAL_USERS = [];