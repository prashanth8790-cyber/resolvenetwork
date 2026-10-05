# CivicConnect — Crowd-Sourced Civic Issue Platform

**CivicConnect** is a full-stack, crowd-sourced civic issue reporting and resolution platform built with Next.js App Router, TypeScript, React, Tailwind CSS, Prisma ORM, OpenStreetMap + Leaflet, and Recharts.

---

## 1. Stack & Technologies
- **Framework**: Next.js 15 (App Router) + TypeScript + React 19
- **Styling & UI**: Tailwind CSS + Lucide Icons
- **Database & ORM**: SQLite / PostgreSQL with Prisma ORM
- **Authentication**: Custom JWT Session Auth stored in HTTP-Only cookies with `bcryptjs` password hashing
- **Map Provider**: OpenStreetMap + Leaflet (`react-leaflet`, zero API keys required)
- **Forms & Validation**: Zod + React Hook Form
- **Data Fetching**: TanStack React Query
- **Charts**: Recharts
- **Image Storage**: Cloudinary upload with client preview & fallback

---

## 2. User Roles & Test Credentials

Password for all seeded accounts: `password123`

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **ADMIN** | `admin@civicconnect.gov` | Full oversight, user activate/suspend, category & ward CRUD tables |
| **AUTHORITY** | `marcus@civicconnect.gov` | Operational worklist, state machine transitions, before/after proof upload |
| **AUTHORITY** | `sarah@civicconnect.gov` | Utility & water department issue management |
| **CITIZEN** | `citizen1@example.com` | Report issues, upvote, comment, verify resolution ("Yes, resolved" / "No, still exists") |
| **CITIZEN** | `citizen2@example.com` | Upvote nearby issues, track reported issue progress |

---

## 3. Core Capabilities & Implemented Features

1. **Strict Server-Side RBAC**: Role checked on every protected API route (`/api/*`).
2. **Issue Lifecycle State Machine**:
   - `SUBMITTED` → `UNDER_REVIEW` → `VERIFIED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`
   - `UNDER_REVIEW` → `REJECTED`
   - `RESOLVED` → `REOPENED` (Citizen verification prompt) → `VERIFIED`
3. **Status Audit Logging**: Complete history log recorded in `IssueStatusHistory` with actor, timestamps, and transition notes.
4. **Interactive Leaflet Marker Map**: Colored markers by severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), popup summaries, and filter sync.
5. **Location Picker**: Click & drag marker on Leaflet map during issue creation to record exact latitude/longitude coordinates.
6. **Smart Duplicate Check**: On submit, checks open issues within ~200m radius of same category and displays `DuplicateWarningModal` with option to upvote existing issue.
7. **Priority Scoring**:
   ```ts
   score = severityWeight(0-40) + min(supportCount, 30) + min(daysOpen * 2, 20) + (overdue ? 10 : 0)
   ```
8. **Before & After Resolution Proof**: Authority uploads before & after photos when marking an issue `RESOLVED`.
9. **In-App Notifications**: Real-time notifications for status changes, comments, and assignments with bell icon badge.
10. **Role Dashboards**:
    - **Citizen**: Status breakdown cards + user's reported issue cards.
    - **Authority**: Operational worklist + 2 Recharts charts (by category, by status).
    - **Admin**: User activate/suspend table, category CRUD, ward CRUD.

---

## 4. Explicitly Skipped Features (Hackathon Scope)
- Separate WORKER role (folded into AUTHORITY)
- Heatmap view (marker map with filters used)
- Image-similarity duplicate detection (geo + category check used)
- Email verification & password reset email flow
- Storage provider abstraction layer (Cloudinary API directly called)
- Audit log system for admin actions

---

## 5. Setup & Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Sync Prisma schema & generate client
npx prisma db push

# 3. Seed database with test users and sample issues
npm run db:seed

# 4. Start local dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
