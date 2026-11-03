# SoftDeals School Management System (SMS)
> **Brand:** SoftDeals — Digital Solutions  
> **Tagline:** Empowering Education Through Technology

A modern, responsive, secure, and scalable multi-tenant School Management System tailored for Indian schools (CBSE, ICSE, and State Boards). SoftDeals SMS unites two complete products into a unified full-stack architecture:
1. **Public-Facing School Website & Portal:** A visitor and parent portal with configurable school CMS, admissions enquiry pipeline, interactive facilities, faculty directories, notices, and events.
2. **Enterprise Multi-Tenant SaaS Dashboard:** A full-stack management suite with dedicated dashboards and permissions for **7 distinct user roles**:
   - **Super Admin (SoftDeals Platform HQ)**
   - **School Admin**
   - **Principal**
   - **Teacher / Faculty**
   - **Accountant / Bursar**
   - **Student**
   - **Parent / Guardian**

---

## 🚀 Live Demo Credentials

Every role has a pre-configured account with realistic Indian school demonstration data. The application includes a **1-Click Role Switcher Bar** at the top of the interface for instantaneous role switching during demonstrations.

| Role | Email | Password | Primary Functions |
|---|---|---|---|
| **Super Admin** | `superadmin@softdeals.in` | `Password@123` | SaaS tenant provisioning, subscription tiers, student limits, platform health, audit logs |
| **School Admin** | `admin@dps.edu.in` | `Password@123` | Academic sessions, classes, admissions, students, teachers, website CMS, school settings |
| **Principal** | `principal@dps.edu.in` | `Password@123` | School-wide attendance rate, fee collections overview, exam performance, approvals |
| **Teacher** | `teacher@dps.edu.in` | `Password@123` | Daily attendance register, examination marks entry, class timetables, homework posting |
| **Accountant** | `accounts@dps.edu.in` | `Password@123` | Paise-safe fee collections, automated sequential receipts, printable fee bills, reversals |
| **Student** | `student@dps.edu.in` | `Password@123` | Personal profile, class timetable, homework, CBSE academic report card, attendance |
| **Parent** | `parent@dps.edu.in` | `Password@123` | Multi-child switcher, real-time attendance monitor, pending fee dues & receipts, notices |

*Pre-seeded demonstration school:* **D.A.V Public School, Pindersot** (`dps-rkp`)  
*Secondary demo school:* **St. Xavier's Senior Secondary School** (`st-xavier`)

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Vanilla CSS + Tailwind CSS (Curated Deep Navy Blue `#0B192C`, Royal Blue `#1E3E62`, Accent Emerald `#008170`)
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Analytics & Charts:** Recharts (responsive bar charts, area trends, KPI meters)
- **Design:** Modern glassmorphic SaaS dashboard, Inter typography, dark/light theme switch, printable receipts and report cards

### Backend
- **Runtime:** Node.js v25+ with Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ORM
- **Authentication:** JWT (JSON Web Tokens) with secure cookie & Bearer token support, bcryptjs password hashing
- **Security:** Helmet, CORS, express-rate-limit, tenant scoping middleware, centralized error handling
- **API Documentation:** Swagger / OpenAPI 3.0 at `/api-docs`

---

## 📂 Project Structure

```text
/softdeals-sms
├── backend
│   ├── src
│   │   ├── config          # MongoDB connection
│   │   ├── controllers     # Auth, Tenant, Academic, Student, Teacher, Fee, Exam, Timetable, CMS
│   │   ├── middleware      # Auth, Tenant isolation, Role-based guard, Error handling
│   │   ├── models          # 15+ Mongoose schemas (Tenant, User, Student, Fee, Exam, etc.)
│   │   ├── routes          # Express modular REST API endpoints
│   │   ├── scripts         # Database seed script & automated test runner
│   │   └── server.ts       # Express application entry point
│   ├── .env.example
│   └── package.json
├── frontend
│   ├── src
│   │   ├── components      # DashboardLayout, PublicLayout, FeeReceiptModal, ReportCardModal, DemoLoginBar
│   │   ├── context         # AuthContext, ThemeContext
│   │   ├── pages
│   │   │   ├── public      # Public website (Home, Admissions, Academics, Facilities, Notices, Contact)
│   │   │   ├── auth        # Login page with 1-click role buttons
│   │   │   └── dashboard   # 16 role-based dashboard screens
│   │   ├── services        # Axios API client with tenant headers
│   │   └── types           # Shared TypeScript interfaces
│   ├── index.html
│   └── package.json
├── docs
│   ├── ARCHITECTURE.md     # Multi-tenant data model & RBAC matrix
│   ├── DEPLOYMENT.md       # Production deployment instructions
│   ├── SECURITY.md         # Data privacy, paise-safe financial handling, audit rules
│   └── BACKUP_RECOVERY.md  # MongoDB automated backup & disaster recovery
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- Node.js (v18 or higher, tested on v25)
- MongoDB Server running locally on `mongodb://127.0.0.1:27017`

### 1. Install Dependencies
```bash
# In backend
cd backend
npm install

# In frontend
cd ../frontend
npm install
```

### 2. Configure Environment
Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/softdeals_sms
JWT_SECRET=super_secret_softdeals_jwt_key_2026_school_management
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_softdeals_demo_key
RAZORPAY_KEY_SECRET=rzp_test_secret_demo
```

### 3. Seed Database with Realistic Data
Populates school tenants, faculty, students, attendance, fee transactions, exam report cards, and website content:
```bash
cd backend
npm run seed
```

### 4. Run Automated Backend Tests
Runs the test suite verifying authentication, bcrypt hashing, tenant isolation, attendance constraints, paise-safe calculations, and CBSE grading:
```bash
cd backend
npm test
```

### 5. Launch Development Servers
```bash
# Terminal 1: Backend API (port 5000)
cd backend
npm run dev

# Terminal 2: Frontend Web Client (port 5173)
cd frontend
npm run dev
```

Visit:
- **Public Website:** `http://localhost:5173/public/dps-rkp`
- **School Portal:** `http://localhost:5173/login`
- **Swagger Documentation:** `http://localhost:5000/api-docs`

---

## 🌟 Core Modules & Functionality

### 1. Multi-Tenant SaaS Architecture
- Tenant resolution from request header (`x-tenant-id`, `x-tenant-code`), user JWT session, or subdomain.
- Complete tenant data isolation enforced across every model query.
- Super Admin portal allows provisioning new school tenants, configuring subscription tiers (`FREE`, `STARTER`, `GROWTH`, `ENTERPRISE`), and adjusting student limits.

### 2. Paise-Safe Fee & Financial Accounting
- Prevents floating-point precision errors by strictly storing currency in integer **paise** (`amountPaise`).
- Automatically generates sequential receipts (e.g., `DPS-REC-2026-00001`).
- Generates **official printable Indian School Fee receipts** with school affiliation details, student roll number, breakdown of fee heads, concessions, and bursar signature.
- Immutable payment records with audited reversals instead of silent record deletions.

### 3. CBSE / State Board Examination & Grading
- Configurable maximum and passing marks per subject.
- Automated percentage and CBSE grading scale calculation (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`, `D`, `E`).
- **Official printable CBSE student report cards** with scholastic performance matrix, class teacher remarks, and signature lines.

### 4. Daily Attendance Register
- Interactive class register supporting `PRESENT`, `ABSENT`, `LATE`, and `EXCUSED` statuses.
- Database compound index prevents duplicate attendance entries for the same class and calendar date.
- Real-time student attendance rate calculation reflected instantly in parent and student dashboards.

### 5. Online Admissions Pipeline & 1-Click Enrollment
- Public admission enquiry form allowing parents to apply online with applicant information and parent details.
- Admissions CRM workflow: `ENQUIRY` → `UNDER_REVIEW` → `INTERVIEW_SCHEDULED` → `APPROVED` → `ENROLLED`.
- **1-Click Conversion:** Instantly converts an approved applicant into an active enrolled student with automatic admission number generation.

### 6. Public Website CMS
- Built-in CMS allowing school administrators to update homepage hero banners, about us text, principal's quote, facilities, and contact details directly from the dashboard without code changes.

---

## 📜 Documentation Links
- [Architecture & RBAC Matrix](file:///d:/beingsamsher-sms/docs/ARCHITECTURE.md)
- [Production Deployment Guide](file:///d:/beingsamsher-sms/docs/DEPLOYMENT.md)
- [Security & Student Privacy Checklist](file:///d:/beingsamsher-sms/docs/SECURITY.md)
- [Backup & Disaster Recovery Procedures](file:///d:/beingsamsher-sms/docs/BACKUP_RECOVERY.md)
