# TECHNOPHILIA 3.0 Event Management System - Complete Documentation

## System Overview

A production-ready event management system for TECHNOPHILIA 3.0 (April 3-4, 2026, starting at 10:00 AM). Handles team registration, live event management, QR attendance tracking, shortlisting, winner announcement, and data export.

---

## ✅ Implemented Features

### 1. **Team Registration System**
- **Location**: `/register` public page
- **File**: `src/app/register/RegisterClient.jsx`
- **Features**:
  - Multi-page book-style form with smooth flip animations
  - 3-member team validation
  - Real-time duplicate prevention (USN, email unique globally)
  - Leader info: name, USN, email, phone, branch, hostel, semester
  - Member details: name, USN, email
  - Stay type selection (hosteler/day scholar)
  - QR code generation for each team
  - Event field for team classification
  - Client + server-side validation with Zod

**API Endpoint**:
```
POST /api/register
Content-Type: application/json

{
  "teamName": "String",
  "event": "String (optional)",
  "leader": {
    "name": "String",
    "usn": "String (unique)",
    "email": "String (unique)",
    "phone": "String",
    "branch": "String",
    "hostelName": "String",
    "semester": "String"
  },
  "members": [
    { "name": "String", "usn": "String", "email": "String" },
    { "name": "String", "usn": "String", "email": "String" }
  ],
  "stayType": "hosteler | dayScholar"
}
```

**Response**: `{ registrationId, message }`

---

### 2. **Admin Authentication (JWT)**
- **Location**: `/admin/login` page
- **File**: `src/app/admin/login/AdminLogin.jsx`
- **Features**:
  - Email/password authentication
  - JWT token generation (24-hour expiry)
  - Token stored in localStorage
  - Automatic redirect to dashboard on login
  - Session persistence

**Credentials**:
```
Email: admin@test.com
Password: 123456
```

**API Endpoint**:
```
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "123456"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "email": "admin@test.com"
}
```

**Auth Helper**: `src/lib/auth.js`
- `generateAdminToken(email)` - Create JWT
- `verifyAdminToken(token)` - Validate JWT
- `validateAdminCredentials(email, password)` - Check credentials
- `adminAuthMiddleware(handler)` - Protect routes

---

### 3. **Admin Dashboard**
- **Location**: `/admin/dashboard`
- **File**: `src/app/admin/dashboard/AdminDashboard.jsx`
- **Styling**: `src/app/admin/dashboard/AdminDashboard.css`

#### Dashboard Features:

**Teams Management Tab**:
- Search filter (by team name, registration ID, leader name)
- Table view with columns: ID, Name, Leader, Members, Status, Actions
- Status badges: ✓ Present, ⭐ Shortlisted, 🏆 Winner, ⏳ Pending
- Delete button for individual team removal
- Real-time refresh (5-second polling)

**Attendance Tracking Tab**:
- Navigation link to `/admin/scanner` for QR scanning
- One-click attendance marking

**Shortlist Management Tab**:
- Grid view of all teams
- Toggle shortlist status with PATCH request
- Visual feedback (gold border when shortlisted)
- Real-time updates

**Winner Announcement Tab**:
- Grid view of all teams
- Toggle winner status with PATCH request
- Display all team members
- Visual feedback (🏆 badge when winner)

**Export Data Tab**:
- Export all teams to CSV
- Export attendance-marked teams
- Export shortlisted teams
- Export winners only
- Includes: Team Name, ID, Leader, Members, Email, Phone, Branch, Stay Type, Attendance, Shortlisted, Winner status

---

### 4. **Team Management API**

**Get All Teams**:
```
GET /api/admin/teams
Authorization: Bearer <JWT_TOKEN>

Response: Array of team objects
[
  {
    "_id": "...",
    "teamName": "Team Alpha",
    "registrationId": "TECH001",
    "leader": { ... },
    "members": [ ... ],
    "attendanceMarked": false,
    "shortlisted": false,
    "winner": false,
    "event": "...",
    "createdAt": "..."
  },
  ...
]
```

**Update Team Status**:
```
PATCH /api/admin/teams
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "teamId": "ObjectId",
  "field": "attendanceMarked | shortlisted | winner",
  "value": true | false
}

Response: { message: "Updated successfully" }
```

**Delete Team**:
```
DELETE /api/admin/teams/:id
Authorization: Bearer <JWT_TOKEN>

Response: { message: "Team deleted successfully" }
```

---

### 5. **QR Attendance System**

**File**: `src/app/admin/scanner/ScannerClient.jsx`
- **Purpose**: Scan QR codes to mark attendance
- **Features**:
  - HTML5 QR code scanner
  - Camera access request
  - Real-time registration ID parsing
  - Attendance marking via API

**API Endpoint**:
```
POST /api/admin/attendance
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "registrationId": "TECH001"
}

Response: { message: "Attendance marked" }
```

---

### 6. **Live Updates API**

**Public Live Data**:
```
GET /api/public/live

Response:
{
  "shortlisted": [
    { "teamName": "...", "registrationId": "..." },
    ...
  ],
  "winners": [
    { "teamName": "...", "registrationId": "...", "members": [...] },
    ...
  ]
}
```

**Real-time Polling**:
- Frontend components poll every 5 seconds
- Updates shortlisted/winners sections on homepage
- No WebSocket required

---

### 7. **MongoDB Schema**

**Team Model** (`src/models/Team.js`):
```javascript
{
  teamName: String (required),
  registrationId: String (unique),
  leader: {
    name: String,
    usn: String (unique globally),
    email: String (unique globally),
    phone: String,
    branch: String,
    hostelName: String,
    semester: String
  },
  members: [
    {
      name: String,
      usn: String (unique globally),
      email: String (unique globally)
    },
    ... (exactly 2 members)
  ],
  stayType: "hosteler" | "dayScholar",
  event: String,
  attendanceMarked: Boolean (default: false),
  shortlisted: Boolean (default: false),
  winner: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Validation**:
- All USNs globally unique
- All emails globally unique
- Members array length = 2
- Pre-save duplicate checking

---

## 🔐 Security

### JWT Authentication
- Tokens expire after 24 hours
- All admin routes require Bearer token
- Credentials validated server-side
- Token verification middleware on all protected endpoints

### Input Validation
- Zod schema validation on registration
- Email format validation
- Phone number validation
- Required field checks

### Duplicate Prevention
- Global uniqueness checks for USN
- Email uniqueness across leader + members
- Prevents accidental re-registration

---

## 📱 Mobile-First UI

- **Responsive Design**: Grid layout adapts from desktop (6 columns) → mobile (1 column)
- **Touch-Friendly**: Large buttons and interactive elements
- **Dark Theme**: Optimized for screen readability
- **Smooth Animations**: GSAP transitions and scroll triggers

---

## 🚀 How to Use

### Step 1: Users Register Teams
1. Visit `/register`
2. Fill multi-page form with team details
3. 3 members required (leader + 2 more)
4. Get QR code on confirmation

### Step 2: Admin Login
1. Visit `/admin/login`
2. Use credentials: `admin@test.com` / `123456`
3. Redirected to `/admin/dashboard`

### Step 3: Manage Teams
1. **Teams Tab**: View, search, delete teams
2. **Attendance Tab**: Direct to QR scanner
3. **Shortlist Tab**: Mark teams for next round
4. **Winners Tab**: Announce 3rd round winners
5. **Export Tab**: Download CSV for records

### Step 4: Real-Time Updates
- Dashboard polls every 5 seconds
- Shortlist/winner changes visible immediately
- Live API updates homepage sections

---

## 📊 Export Functionality

**CSV Columns**:
- Team Name
- Registration ID
- Leader Name
- All Member Names
- Leader Email
- Leader Phone
- Branch
- Stay Type (Hosteler/Day Scholar)
- Attendance (Yes/No)
- Shortlisted (Yes/No)
- Winner (Yes/No)

**File Format**: `technophilia-{filter}-YYYY-MM-DD.csv`

---

## 🔧 API Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/register` | POST | ❌ | Register team |
| `/api/admin/login` | POST | ❌ | Admin login |
| `/api/admin/teams` | GET | ✅ | Get all teams |
| `/api/admin/teams` | PATCH | ✅ | Update team status |
| `/api/admin/teams/:id` | DELETE | ✅ | Delete team |
| `/api/admin/attendance` | POST | ✅ | Mark attendance |
| `/api/public/live` | GET | ❌ | Get shortlisted/winners |

---

## 📁 File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── login/
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminLogin.css
│   │   │   └── page.jsx
│   │   └── dashboard/
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminDashboard.css
│   │       ├── page.jsx
│   │       └── DashboardClient.jsx (legacy NextAuth)
│   ├── api/
│   │   ├── admin/
│   │   │   ├── login/route.js
│   │   │   ├── teams/route.js
│   │   │   ├── teams/[id]/route.js
│   │   │   └── attendance/route.js
│   │   ├── public/
│   │   │   └── live/route.js
│   │   └── register/route.js
│   └── register/
│       ├── RegisterClient.jsx
│       └── page.jsx
├── lib/
│   ├── auth.js (JWT helpers)
│   └── mongodb.js (DB connection)
├── models/
│   └── Team.js
└── data/
    └── (Event data files)
```

---

## 🎯 Event Details

- **Event Name**: TECHNOPHILIA 3.0
- **Dates**: April 3-4, 2026
- **Start Time**: 10:00 AM (April 3)
- **Status**: Active registration
- **Type**: Multi-track event management

---

## ⚡ Performance

- **Team Polling**: 5-second intervals
- **Real-time Updates**: SWR with automatic refresh
- **CSV Export**: Instant generation (no server wait)
- **Authentication**: JWT with 24-hour validity
- **Database**: MongoDB with indexes on USN, email

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Next.js 16.2
- **Styling**: CSS Grid, Flexbox, Dark Theme
- **Backend**: Next.js API Routes
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Data Fetching**: SWR (5s polling)
- **QR**: qrcode.react, html5-qrcode

---

## 📝 Notes

- Admin credentials hardcoded for simplicity (suitable for single operator)
- JWT tokens stored in localStorage (suitable for single-device admin use)
- CSV export includes all team metadata
- Real-time updates via polling (alternative: implement WebSocket for lower latency)
- QR codes generated at registration time
- All timestamps in UTC

---

## 🚨 Troubleshooting

**Admin login not working?**
- Verify email: `admin@test.com`
- Verify password: `123456`
- Check browser localStorage for token

**Teams not loading in dashboard?**
- Ensure admin logged in
- Check token expiry (24 hours from login)
- Verify JWT_SECRET in environment variables

**Attendance marking fails?**
- QR code must be valid registration ID
- Admin must be authenticated
- Check network connection

**Export CSV empty?**
- Register teams first
- Use correct filter
- Check browser console for errors

---

**System Status**: ✅ PRODUCTION READY
**Last Updated**: April 2026
**Maintainer**: Admin Panel
