# GigNova — Student-Focused Short-Term Gig Marketplace

A university Project-Based Learning (PBL) platform for **Sharda University** designed to connect students with verified businesses for internships, freelance projects, part-time jobs, and skill-based tasks.

---

## 🌟 Key Features

### 1. Robust Authentication & Role-Based Authorization
- **Roles:** `STUDENT`, `BUSINESS` (Employer), `ADMIN`.
- Secure JWT-based session tokens with role validation middleware.
- Password hashing using `bcryptjs` (salt rounds: 12).
- Route guards and client-side `ProtectedRoute` preventing cross-role access.
- 1-Click Demo Fill buttons on login for seamless academic presentation.

### 2. Student Module
- **Comprehensive Profile:** Full name, phone, university/college, degree, year of study, skills tagger, experience, portfolio links (GitHub, LinkedIn, Personal Site), weekly availability schedule, and preferred work arrangement.
- **Dynamic Profile Strength Meter:** Deterministic completion percentage calculation with interactive missing-field guidance.
- **Student Dashboard:** Real-time metrics computed directly from database records (Total Applications, Pending, Under Review, Accepted, Rejected, Completed).
- **Application Tracking:** Detailed application history, submitted cover letters, recruiter response notes, and self-withdrawal capability.

### 3. Business / Recruiter Module
- **Business Identity:** Company name, industry sector, business email, contact phone, website, office location, and description.
- **Verification Workflow:** Businesses submit Tax ID (GSTIN/PAN), registration number, and company credentials. Administrators review and approve/reject with feedback notes.
- **Gig Management:** Full CRUD lifecycle for gigs (create, edit, delete, suspend).
- **Applicant Review Center:** Inspect applicant student profiles, matched skills, cover letters, and deterministic compatibility scores. Move candidates across lifecycle stages (`UNDER_REVIEW`, `ACCEPTED`, `REJECTED`, `COMPLETED`).

### 4. GigNova SmartMatch™ — Intelligent Applicant Matching System
An intelligent, transparent, deterministic evaluation and ranking engine assisting recruiters in candidate selection without automated hiring/rejection:
- **5-Factor Scoring Formula (0–100):**
  $$\text{Final Score} = (\text{Skill} \times 0.40) + (\text{Experience} \times 0.20) + (\text{Availability} \times 0.20) + (\text{Work Mode} \times 0.10) + (\text{Assessment} \times 0.10)$$
- **Skill Normalization & Aliases (40% weight):**
  - Canonical dictionary supporting 30+ aliases (e.g. `React.js` = `React`, `JS` = `JavaScript`, `TS` = `TypeScript`, `Node` = `Node.js`, `Docker` = `Containerization`).
  - Graph-based related skill detection giving 0.5 partial credit for transferable skills.
  - Transparent classification into Matched, Partially Matched, and Missing skills.
- **Project & Experience Relevance (20% weight):**
  - Keyword density analysis against gig category, title, and domain terms.
  - Verification of GitHub repository, live portfolio, and professional links.
- **Availability Compatibility (20% weight):**
  - Alignment of student weekly hours and schedules against gig duration and milestone targets.
- **Work Mode & Location Compatibility (10% weight):**
  - Detection of Remote, Hybrid, and On-Site compatibility; highlights location conflicts for on-site gigs.
- **Application Assessment (10% weight):**
  - Evaluation of cover note effort, depth, and profile completeness.
- **Mandatory Eligibility Rules:**
  - Evaluates non-negotiable requirements (active status, deadlines, baseline skills, availability, and physical on-site requirements).
  - Ineligible applicants are segregated with explicit, transparent violation reasons.
- **Recruiter Workflow & Shortlisting:**
  - Dedicated ranking view with sorting and score filters.
  - One-click shortlist toggling and 1-click **Bulk Shortlist Top N** candidates.
  - Detailed Applicant Compatibility Report with natural language explanations for every score component.

### 5. Platform Safety & Trust
- **Verification Badges:** Visual distinction between `VERIFIED` and `UNVERIFIED` organizations.
- **Safety Reporting:** Students and businesses can submit abuse/scam reports directly to the administration queue.
- **Admin Governance Console:** Overview stats, business verification approvals, user suspension/reactivation, gig listing moderation, and report resolution.

---

## 🏗️ Architecture & Tech Stack

```
GigNova/
├── backend/                  # Node.js + Express + TypeScript + Prisma + SQLite
│   ├── prisma/
│   │   ├── schema.prisma     # Relational database schema
│   │   └── seed.ts           # Academic seed script with preconfigured accounts
│   ├── src/
│   │   ├── config/           # Database singleton
│   │   ├── controllers/      # Auth, Student, Business, Gig, Application, Match, Admin
│   │   ├── middleware/       # JWT auth, role validation, error handling, file uploads
│   │   ├── routes/           # REST API route declarations
│   │   └── index.ts          # Express application entrypoint
│   └── package.json
└── frontend/                 # React 18 + Vite + TypeScript + Tailwind CSS
    ├── src/
    │   ├── api/client.ts     # Axios client with JWT interceptor & typed endpoints
    │   ├── contexts/         # AuthContext with session persistence
    │   ├── components/       # Navbar, Footer, ProtectedRoute, Badges, Modals
    │   ├── pages/            # Landing, Login, Register, Student, Business, Admin
    │   └── main.tsx          # Application bootstrap
    └── package.json
```

---

## 🔑 Demo Test Accounts (PBL Evaluation)

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@gignova.com` | `Admin@123456` |
| **Student** | `student@gignova.com` | `Student@123` |
| **Business / Employer** | `business@gignova.com` | `Business@123` |
| **TechNova Solutions (100 Applicants Demo)** | `demo-biz-technova@demo.gignova.com` | `Demo@12345` |
| **SmartMatch Business 1 (CloudScale)** | `demo-biz-cloud@demo.gignova.com` | `Demo@12345` |
| **SmartMatch Business 2 (PixelCraft)** | `demo-biz-design@demo.gignova.com` | `Demo@12345` |
| **Mock Applicants (100 Profiles)** | `mock-applicant-001@demo.gignova.com` to `100` | `Demo@12345` |

*(You can also use the 1-click demo buttons on the `/login` page to auto-fill these credentials).*

---

## 🧪 Testing & Verification

Both test suites pass 100% with zero mock server mocks:
```bash
cd backend
npm run test             # 30 Comprehensive E2E Tests (Passes: 30/30)
npm run test:smartmatch  # 12 SmartMatch Engine Verification Tests (Passes: 12/12)
```

---

## 🚀 Running the Project Locally

### 1. Prerequisites
- **Node.js**: v18 or later
- **npm**: v9 or later

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts              # Base university seed data
npx ts-node prisma/seed-smartmatch.ts   # SmartMatch demo dataset (15 students, 5 gigs, 27 applications)
npx ts-node prisma/seed-100-applicants.ts # Target 100 Mock Applicants Gig (TechNova Solutions)
npm run dev
```
*Backend runs on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).*

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Create student or business account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated session
- `PUT /api/auth/change-password` — Change account password

### Student
- `GET /api/student/profile` — Fetch student profile & skills
- `PUT /api/student/profile` — Update student profile data
- `GET /api/student/dashboard` — Fetch dashboard metrics & recent applications
- `POST /api/student/profile/picture` — Upload student avatar

### Business & Recruitment
- `GET /api/business/profile` — Fetch business profile & verification state
- `PUT /api/business/profile` — Update company details
- `GET /api/business/dashboard` — Fetch recruiter dashboard stats & posted gigs
- `POST /api/business/verification` — Submit tax & registration credentials

### Gigs & Discovery
- `GET /api/gigs` — Filter and search active gigs (category, workType, skills, sort)
- `GET /api/gigs/categories` — List all distinct gig categories
- `GET /api/gigs/:id` — View full gig details & application status
- `POST /api/gigs` — Create new gig (Employer only)
- `PUT /api/gigs/:id` — Update existing gig (Owner only)
- `DELETE /api/gigs/:id` — Delete gig listing (Owner or Admin)
- `GET /api/gigs/:id/applications` — List applicants for a gig (Owner only)

### Application Lifecycle
- `POST /api/applications` — Submit application to a gig (Student only)
- `GET /api/applications/mine` — Retrieve all student's applications
- `PATCH /api/applications/:id/withdraw` — Withdraw pending application (Student only)
- `PATCH /api/applications/:id/status` — Change status: UNDER_REVIEW, ACCEPTED, REJECTED, COMPLETED

### Match Engine
- `GET /api/match/recommendations` — Deterministic skill match recommendations for student
- `GET /api/match/score/:gigId` — Compatibility breakdown for a specific gig

### GigNova SmartMatch™ (Recruiter Intelligence)
- `GET /api/smartmatch/gig/:gigId` — Fetch ranked applicants, overview stats (eligible, ineligible, shortlisted, high/avg scores), score filters, and pagination
- `GET /api/smartmatch/gig/:gigId/applicant/:applicationId` — Detailed applicant compatibility report with 5-factor breakdown and natural language explanation
- `POST /api/smartmatch/gig/:gigId/recalculate` — Force recalculation of compatibility scores across all applicants
- `PATCH /api/smartmatch/application/:applicationId/shortlist` — Toggle applicant shortlist flag
- `POST /api/smartmatch/gig/:gigId/bulk-shortlist` — Bulk shortlist top N eligible candidates

### Administration
- `GET /api/admin/overview` — Platform KPI overview
- `GET /api/admin/users` — User directory with search & role filters
- `PATCH /api/admin/users/:id/suspend` — Suspend or reactivate user accounts
- `GET /api/admin/verifications` — List business verification requests
- `PATCH /api/admin/verifications/:id` — Approve or reject verification request
- `GET /api/admin/gigs` — Moderate all gigs
- `PATCH /api/admin/gigs/:id/moderate` — Suspend, restore, or delete gigs
- `GET /api/admin/reports` — View abuse reports
- `PATCH /api/admin/reports/:id` — Review, resolve, or dismiss reports

