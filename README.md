# JalYukti - Intelligent Water-Logging Management System
Try it outt

https://jalyukti.netlify.app


A comprehensive water-logging management application for Delhi NCR, built for the Hack4Delhi hackathon.

## Features

- **Multi-Role Dashboards**: Separate interfaces for Citizens, Commuters, Officials (PWD/Traffic), and City Admins
- **Real-time Reporting**: Citizens can report water-logging incidents with location and severity
- **Risk Assessment**: Ward-level risk scoring (0-100) based on incident reports
- **Route Safety**: Commuters can check water-logging risks along their travel routes
- **Incident Management**: Officials can track and update status of reports
- **Pump Deployment**: Admins can deploy and manage water pumps across wards
- **Ward Risk Map**: Visual representation of water-logging risk across Delhi
- **Alerts System**: City-wide and ward-specific notifications

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes (REST)
- **Data**: In-memory mock data (structured for easy DB integration)
- **UI Components**: shadcn/ui
- **State Management**: React Context + Hooks

## Project Structure

```
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── districts/         # District and ward data
│   │   ├── reports/           # Water-logging report CRUD
│   │   ├── alerts/            # Alert notifications
│   │   └── pump-deployments/  # Pump management
│   ├── citizen/               # Citizen dashboard & reporting
│   ├── commuter/              # Commuter route safety dashboard
│   ├── official/              # PWD/Traffic official dashboard
│   ├── admin/                 # City admin dashboard
│   ├── map/                   # Ward risk map
│   ├── login/                 # Authentication page
│   └── page.tsx               # Landing page
├── components/                # Reusable UI components
│   ├── dashboard-layout.tsx   # Main layout with sidebar
│   ├── stat-card.tsx          # KPI cards
│   ├── risk-badge.tsx         # Risk level indicators
│   └── status-badge.tsx       # Report status badges
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── data.ts               # Mock data (Delhi districts, wards, reports)
│   ├── risk-engine.ts        # Risk calculation logic
│   └── auth-context.tsx      # Authentication state management
└── README.md
```

## Getting Started

### Installation

1. **Download the project**
   ```bash
   # Option 1: Use shadcn CLI (recommended)
   npx shadcn@latest download [project-id]
   
   # Option 2: Download ZIP from v0
   # Click the three dots → Download ZIP
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Login

The app uses mock authentication for demo purposes:

1. Click "Get Started" on the landing page
2. Enter any email address
3. Select a role:
   - **Citizen**: Report incidents and view local risk
   - **Commuter**: Check route safety between wards
   - **Official**: Manage reports and update status
   - **Admin**: View city-wide analytics and deploy pumps

## Key Workflows

### For Citizens
1. Select your district and ward
2. View current risk level and alerts
3. Report water-logging incidents with location and severity
4. Track your submitted reports

### For Commuters
1. Select starting ward and destination
2. View route risk assessment
3. Check alerts affecting your route
4. Make informed travel decisions

### For Officials (PWD/Traffic)
1. View assigned wards and their risk levels
2. See new, in-progress, and resolved reports
3. Update report status as work progresses
4. Monitor ward conditions

### For City Admins
1. View city-wide KPIs and statistics
2. Monitor high-risk wards
3. Deploy and manage water pumps
4. Access comprehensive analytics

## Data Model

### Core Entities

- **District**: Delhi's 10 administrative districts
- **Ward**: ~250 wards across all districts
- **User**: Citizens, Commuters, Officials, Admins
- **WaterLoggingReport**: Incident reports with location, severity, status
- **Alert**: Notifications for wards/districts
- **PumpDeployment**: Pump allocation and status

### Risk Calculation

Risk scores (0-100) are calculated based on:
- Number of reports in last 24 hours (weighted higher)
- Number of reports in last 7 days
- Severity of reports (HIGH, MEDIUM, LOW)

Risk levels:
- **HIGH**: Score ≥ 70
- **MEDIUM**: Score ≥ 40
- **LOW**: Score < 40

## Future Enhancements

### Real Integrations (Ready for)

1. **Database**: Replace in-memory data with PostgreSQL/MongoDB
   - Models are already defined in `lib/types.ts`
   - API routes are structured for DB integration

2. **Map Integration**: Add Leaflet/Google Maps
   - Placeholder ready in `app/map/page.tsx`
   - Ward boundaries can be overlaid

3. **Rainfall API**: Integrate weather data
   - Update risk calculations with real-time rainfall
   - Predictive risk scoring

4. **Authentication**: Add real auth (NextAuth.js, Supabase Auth)
   - Currently using mock auth in `lib/auth-context.tsx`

5. **File Uploads**: Enable photo uploads for reports
   - Use Vercel Blob or similar

6. **Blockchain**: Add immutability for audit trail
   - Log critical actions on-chain

7. **Mobile App**: Build React Native version
   - Share types and API contracts

## Environment Variables

For production deployment, you may want to add:

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...

# External APIs
WEATHER_API_KEY=...
MAPS_API_KEY=...

# Storage
BLOB_READ_WRITE_TOKEN=...
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Deploy with one click

Or use the Vercel CLI:
```bash
vercel
```

## License

MIT License - Built for Hack4Delhi 2025

## Contact

For questions or support, please open an issue in the repository.
