export const IS_EVENT_CONCLUDED = false; // Toggle true after event ends to show Thank You landing page
export const SITE_ACCESS_PASSWORD_HASH = '9288e4c434fcac2d09d7583509e538394f7eadebc6a59dc066c6323de236c59d'; // Salted SHA-256 hash for participant access
export const HOST_ADMIN_PASSCODE_HASH = '866744bd0951e7dd830fdd96910f9756daa9c3fd9083e0c1bdfe7a99d42fc9c1'; // Salted SHA-256 hash for host admin portal
export const SITE_AUTH_STORAGE_KEY = 'stepathon_v4_site_auth_hash';

export const EVENT_START_DATE = '2026-10-19';
export const EVENT_END_DATE = '2026-11-18';

export const GLOBAL_STEP_GOAL = 35000000; // 35,000,000 Global Step Target
export const TOTAL_GOAL_STEPS = GLOBAL_STEP_GOAL;
export const STEPS_PER_MILE = 2000;
export const TOTAL_GOAL_MILES = GLOBAL_STEP_GOAL / STEPS_PER_MILE;
export const MAX_USERS = 200;
export const MAX_TEAM_MEMBERS = 8;
export const MAX_PARTICIPANT_STEPS_PER_ENTRY = 30000;
export const MAX_HOST_OVERRIDE_STEPS_PER_ENTRY = 200000;
export const TOTAL_WEEKS = 4; // 4-Week Challenge (October 19 – November 18, 2026)

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
    startDate: "October 19",
    endDate: "October 25",
    shortRange: "Oct 19-25",
    startIso: "2026-10-19",
    endIso: "2026-10-25",
    deadlineUtc: "2026-10-27T08:00:00.000Z" // Monday Oct 26 @ Midnight PST (3:00 AM EST)
  },
  {
    weekNumber: 2,
    label: "Week 2",
    startDate: "October 26",
    endDate: "November 1",
    shortRange: "Oct 26-Nov 1",
    startIso: "2026-10-26",
    endIso: "2026-11-01",
    deadlineUtc: "2026-11-03T08:00:00.000Z" // Monday Nov 2 @ Midnight PST (3:00 AM EST)
  },
  {
    weekNumber: 3,
    label: "Week 3",
    startDate: "November 2",
    endDate: "November 8",
    shortRange: "Nov 2-8",
    startIso: "2026-11-02",
    endIso: "2026-11-08",
    deadlineUtc: "2026-11-10T08:00:00.000Z" // Monday Nov 9 @ Midnight PST (3:00 AM EST)
  },
  {
    weekNumber: 4,
    label: "Week 4",
    startDate: "November 9",
    endDate: "November 18",
    shortRange: "Nov 9-18",
    startIso: "2026-11-09",
    endIso: "2026-11-18",
    deadlineUtc: "2026-11-19T08:00:00.000Z" // Wednesday Nov 18 @ Midnight PST (Final submission deadline)
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

/**
 * Computes the default week tab for the Weekly Leaderboard.
 * On cutoff Mondays (the first day of Weeks 2, 3, and 4), participants have until
 * Monday @ Midnight PST to finish logging the previous week's steps, so the
 * Weekly Leaderboard stays defaulted to the closing week all day Monday and
 * advances to the new week on Tuesday.
 */
export const computeLeaderboardDefaultWeek = (dateStr: string): number => {
  if (!dateStr) return 1;
  const cleanDate = dateStr.substring(0, 10);
  for (let i = EVENT_WEEKS.length - 1; i >= 0; i--) {
    if (cleanDate >= EVENT_WEEKS[i].startIso) {
      if (i > 0 && cleanDate === EVENT_WEEKS[i].startIso) {
        return EVENT_WEEKS[i - 1].weekNumber;
      }
      return EVENT_WEEKS[i].weekNumber;
    }
  }
  return 1;
};

export interface PhotoChallengePromptOption {
  emoji: string;
  title: string;
  description: string;
  isFeatured?: boolean;
}

export interface WeeklyPhotoChallengeConfig {
  weekNumber: number; // 0 for pre-event teaser, 1-5 for event weeks
  badgeLabel: string;
  themeTitle: string;
  dateRangeLabel: string;
  startIso: string;
  endIso: string;
  prompts: PhotoChallengePromptOption[];
  photoIdeas?: string[];
  callToAction?: string;
}

export const PRE_EVENT_PHOTO_CHALLENGE: WeeklyPhotoChallengeConfig = {
  weekNumber: 0,
  badgeLabel: "Weekly Photo Challenge • Unlocks Oct 19",
  themeTitle: "Something Exciting is Brewing... Lace Up & Warm Up Your Camera! 👟📸",
  dateRangeLabel: "Countdown to October 19",
  startIso: "2026-01-01",
  endIso: "2026-10-18",
  prompts: [
    {
      emoji: "🕵️‍♂️",
      title: "Top-Secret Weekly Themes Incoming",
      description: "Every Monday starting October 19, a brand-new themed photo challenge will unlock right here! Snap a photo during your walk and share it in the group chat for a chance to be crowned Photo Challenge Champion.",
      isFeatured: true
    }
  ]
};

export const WEEKLY_PHOTO_CHALLENGES: WeeklyPhotoChallengeConfig[] = [
  {
    weekNumber: 1,
    badgeLabel: "Week 1 Photo Challenge",
    themeTitle: "Wear Pink for Breast Cancer Awareness",
    dateRangeLabel: "October 19 – October 23",
    startIso: "2026-10-19",
    endIso: "2026-10-25",
    prompts: [
      {
        emoji: "🌸",
        title: "Find Something Pink",
        description: "While you're out walking, snap a photo of something pink you discover along the way—from a flower, sign, mural, or building to something unexpected!",
        isFeatured: true
      },
      {
        emoji: "💗",
        title: "Pink in Motion",
        description: "Take a selfie wearing pink while on your walk and let's see AxG turn PINK this week!"
      }
    ],
    photoIdeas: [
      "🌷 A pink flower",
      "🎨 A mural or piece of art",
      "🏙️ A sign or building",
      "👟 Something you're wearing",
      "💡 Or something totally unexpected!"
    ],
    callToAction: "Share your 📸 photo + a short caption in the Teams channel for a chance to be our Week 1 Photo Challenge Winner! 🏆"
  },
  {
    weekNumber: 2,
    badgeLabel: "Week 2 Photo Challenge",
    themeTitle: "Mindful Moments for Men’s Mental Health Awareness",
    dateRangeLabel: "October 26 – October 30",
    startIso: "2026-10-26",
    endIso: "2026-11-01",
    prompts: [
      {
        emoji: "🧘",
        title: "Mindful Moment",
        description: "With Men’s Mental Health Awareness Month coming up in November, we’re getting a head start by encouraging everyone to make time for mindfulness and mental well-being. While you're out walking, snap a photo of a view that made you pause, take a breath, and appreciate the moment!",
        isFeatured: true
      }
    ],
    photoIdeas: [
      "🌅 A beautiful sunrise or sunset",
      "🌳 A tree or peaceful trail",
      "🌊 A beach or waterfront",
      "🌼 A park or garden",
      "✨ Or any view that brought you a moment of calm!"
    ],
    callToAction: "Share your 📸 photo + a short caption in the Teams channel for a chance to be our Week 2 Photo Challenge Winner! 🏆"
  },
  {
    weekNumber: 3,
    badgeLabel: "Week 3 Photo Challenge",
    themeTitle: "Celebrating Diwali: Find the Light",
    dateRangeLabel: "November 2 – November 6",
    startIso: "2026-11-02",
    endIso: "2026-11-08",
    prompts: [
      {
        emoji: "🪔",
        title: "Find the Light",
        description: "This week, we’re celebrating Diwali with a photo challenge inspired by light, color, and brightness! While you're out walking, snap a photo of something bright, colorful, or illuminating that catches your eye!",
        isFeatured: true
      }
    ],
    photoIdeas: [
      "🌅 A colorful sunrise or sunset",
      "✨ Sparkling or decorative lights",
      "🌸 Bright flowers or colorful scenery",
      "🎨 Vibrant art, murals, or decorations",
      "💡 Or something totally unexpected that lights up your walk!"
    ],
    callToAction: "Share your 📸 photo + a short caption in the Teams channel for a chance to be our Week 3 Photo Challenge Winner! 🏆"
  },
  {
    weekNumber: 4,
    badgeLabel: "Week 4 Photo Challenge",
    themeTitle: "Movember Men’s Health: Walk With Someone You Appreciate",
    dateRangeLabel: "November 9 – November 13",
    startIso: "2026-11-09",
    endIso: "2026-11-15",
    prompts: [
      {
        emoji: "🙌",
        title: "Walk With Someone You Appreciate",
        description: "This week, we’re recognizing Movember and men’s health by celebrating the men who make a difference in our lives. While you're out getting your steps in, invite men you appreciate to join you and snap a photo together!",
        isFeatured: true
      }
    ],
    photoIdeas: [
      "👨‍👦 A family member",
      "🤝 A friend",
      "👥 A coworker",
      "🏃 A walking or workout buddy",
      "💙 Or any man in your life you appreciate!"
    ],
    callToAction: "Share your 📸 photo + a short caption in the Teams channel telling us who you're walking with and why you appreciate them for a chance to be our Week 4 Photo Challenge Winner! 🏆"
  },
  {
    weekNumber: 5,
    badgeLabel: "Week 5 Photo Challenge",
    themeTitle: "Gratitude, Community & Connection",
    dateRangeLabel: "November 16 – November 20",
    startIso: "2026-11-16",
    endIso: "2026-12-31",
    prompts: [
      {
        emoji: "❤️",
        title: "Grateful for This",
        description: "For our final week of the AxG Global Stepathon, we’re taking a moment to celebrate gratitude and the people, places, and little things that make our journeys meaningful. While you're out walking, snap a photo of something you encounter that you're thankful for!",
        isFeatured: true
      }
    ],
    photoIdeas: [
      "🌳 A favorite place or beautiful view",
      "👨‍👩‍👧‍👦 Friends, family, or your walking crew",
      "🐾 A furry companion joining your steps",
      "🌅 A peaceful moment in nature",
      "❤️ Or anything that reminds you of something you're grateful for!"
    ],
    callToAction: "Share your 📸 photo + a short caption in the Teams channel telling us why you're grateful for it for a chance to be our Week 5 Photo Challenge Winner! 🏆"
  }
];

export const getActivePhotoChallenge = (dateStr?: string): WeeklyPhotoChallengeConfig => {
  const now = new Date();
  const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const cleanDate = (dateStr || localToday).substring(0, 10);

  if (cleanDate < EVENT_START_DATE) {
    return PRE_EVENT_PHOTO_CHALLENGE;
  }

  for (let i = WEEKLY_PHOTO_CHALLENGES.length - 1; i >= 0; i--) {
    if (cleanDate >= WEEKLY_PHOTO_CHALLENGES[i].startIso) {
      return WEEKLY_PHOTO_CHALLENGES[i];
    }
  }

  return PRE_EVENT_PHOTO_CHALLENGE;
};

export interface GlobalOffice {
  id: string;
  city: string;
  country: string;
  displayName: string;
  lat: number;
  lng: number;
}

export const GLOBAL_OFFICES: GlobalOffice[] = [
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