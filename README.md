# 🏃 Tea&O Amazing Race — Global Step-a-thon Platform

[![React](https://img.shields.io/badge/React-18.2-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)

An interactive, real-time web application designed to host global corporate and team step challenges. Participants track their daily steps as their team races across a 4,195-mile route from **Seattle, WA to New York City, NY**.

---

## 🌟 Executive Summary & Key Features

* **🛡️ Host & Admin Portal**: Pre-configure teams, pick custom badge colors, and batch-assign participants before race kickoff. Protected by admin passcode.
* **👟 Participant Step Logger**: 3-tap step entry with quick-add presets (`+2,000`, `+5,000`, `+10,000`), retroactive date picker for missed days, and entry deletion.
* **🗺️ Interactive Route Map**: Powered by Leaflet, visualizing team progress along major US milestones from Seattle to NYC in real time.
* **🏆 Multi-Page Leaderboards**: Dedicated **Team Standings** (team totals, racer averages, top walker highlights) and **Individual Rankings** (podium, search/filter, weekly momentum).
* **⚡ Hybrid Real-time & Offline Resilience**: Powered by Firebase Cloud Firestore with automatic LocalStorage fallback for low-connectivity environments.
* **🔒 Game Integrity & Fraud Prevention**: Enforces a 50,000 step cap per entry and input sanitization.

---

## 🏗️ Architecture & Technology Stack

```
                           +---------------------------+
                           |  React 18 + TypeScript    |
                           +-------------+-------------+
                                         |
                                         v
                         +---------------+---------------+
                         |   Vite Build System & HMR     |
                         +---------------+---------------+
                                         |
               +-------------------------+-------------------------+
               |                                                   |
               v                                                   v
+--------------+--------------+                   +----------------+--------------+
|  Firebase Cloud Firestore   |                   |    Browser LocalStorage       |
|  (Real-time Live Sync)      |                   |    (Offline Backup Fallback)  |
+-----------------------------+                   +-------------------------------+
```

* **Core**: React 18, TypeScript, Vite
* **Styling**: Vanilla CSS + Tailwind CSS, Outfit & Roboto Google Fonts
* **Mapping**: Leaflet.js (OpenStreetMap Tiles)
* **Icons**: Lucide React
* **Database & Sync**: Cloud Firestore & Web LocalStorage

---

## 📂 Project Directory Structure

```
step-a-thon/
├── components/                 # Reusable UI Components
│   ├── HostAdminPanel.tsx       # Batch team creation & participant assignment
│   ├── ParticipantStepLogger.tsx# Step entry form, date picker, & log history
│   ├── TeamLeaderboard.tsx     # Overview team standings card
│   ├── DashboardStats.tsx      # Top-level metric cards
│   ├── RaceMap.tsx             # Interactive Leaflet route map
│   ├── Leaderboard.tsx          # Individual walker rankings
│   ├── TimeBasedLeaderboard.tsx # Weekly/monthly momentum rankings
│   ├── WeeklyAnalytics.tsx     # Step progression charts
│   └── ReportGenerator.tsx     # Export race summary reports
├── pages/                      # Dedicated Multi-Page Views
│   ├── TeamLeaderboardPage.tsx  # Full team standings & roster breakdown page
│   └── IndividualLeaderboardPage.tsx # Full individual walker rankings & podium
├── legacy_code/                # Legacy single-file backup (gitignored)
├── App.tsx                     # Main application shell & router
├── api.ts                      # Firebase & LocalStorage data access layer
├── constants.ts                # Route waypoints & milestone definitions
├── types.ts                    # TypeScript interface definitions (User, Team, StepEntry)
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite build & base path configuration
└── package.json                # Project dependencies and scripts
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/connorjseale17/Tea-O-Amazing-Race.git
   cd step-a-thon
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open **`http://localhost:5173`** (or `http://localhost:3000`) in your browser.

---

## 📦 Building & Production Deployment

### Production Build
To compile the application into static assets for production:

```bash
npm run build
```

The output will be generated in the `dist/` directory.

### Deploying to GitHub Pages

1. Ensure `base` in [`vite.config.ts`](vite.config.ts) matches your repository name:
   ```typescript
   export default defineConfig({
     base: '/Tea-O-Amazing-Race/',
     plugins: [react()],
   });
   ```

2. Build and deploy to the `gh-pages` branch:
   ```bash
   npm run build
   npx gh-pages -d dist
   ```

*(Note: The application uses Hash Routing `/#/teams` and `/#/individuals` for 100% compatibility with GitHub Pages without requiring server-side 404 redirects).*

---

## 🔒 Security & Data Integrity

* **Step Input Capping**: Enforces a maximum cap of **50,000 steps (~25 miles)** per entry to prevent accidental or malicious score inflation.
* **Timezone Preservation**: Custom dates selected via the date picker are anchored at **12:00:00 (noon)** local time, preventing UTC offsets from shifting dates to the previous day in western timezones.
* **Firestore Security Rules**: Recommended rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /racers/{racerId} {
      allow read: if true;
      allow create: if request.resource.data.steps == 0;
      allow update: if request.resource.data.steps - resource.data.steps <= 30000;
      allow delete: if false;
    }
    match /teams/{teamId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

## 📄 License & Ownership

Developed for internal step challenges and corporate wellness events.  
© 2024 **Tea&O** • All rights reserved.
