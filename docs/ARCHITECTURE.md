# SoftDeals SMS — Architecture & RBAC Matrix

## 1. Multi-Tenant Architectural Pattern

SoftDeals SMS uses a **Pooled Schema Multi-Tenant Architecture** with strict database and application-level isolation.

```text
[HTTP Request]
       │
       ▼
[Tenant Resolution Middleware] ──> Resolves tenant from:
       │                             - Header: x-tenant-id / x-tenant-code
       │                             - JWT User Claim: user.tenantId
       │                             - Subdomain: e.g. dps.softdeals.in
       ▼
[JWT Authentication Middleware] ──> Verifies identity & tenant affinity
       │
       ▼
[RBAC Permission Guard] ──────────> Enforces role boundaries (7 distinct roles)
       │
       ▼
[Scoped Controller & Model Query] ─> Enforces { tenantId: req.tenantId } in every query
```

### Security & Cross-Tenant Access Prevention
1. **Never Trust Client Inputs:** The `tenantId` is validated against the authenticated user's database document. A user belonging to School A cannot read or write data belonging to School B by manipulating query parameters or headers.
2. **Super Admin Isolation:** Super Admins can manage SaaS subscriptions and view platform health, but cannot access sensitive student personal documents or school financial records without explicit audited justification.
3. **Audit Trails:** Sensitive changes (such as admissions, payment reversals, tenant provisioning) generate immutable `AuditLog` records.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Module / Action | Super Admin | School Admin | Principal | Teacher | Accountant | Student | Parent |
|---|---|---|---|---|---|---|---|
| **Tenant Provisioning & Plans** | Full | — | — | — | — | — | — |
| **School Settings & CMS** | Full | Full | View | — | — | — | — |
| **Academic Sessions & Classes** | Full | Full | View | View Assigned | — | — | — |
| **Student Directory & Profiles** | Full | Full | Full | View Assigned | View Basic | View Own | View Child |
| **Daily Attendance Marking** | — | Full | Full | Full (Assigned) | — | View Own | View Child |
| **Fee Structures & Rates** | — | Full | View | — | Full | — | — |
| **Record & Reverse Payments** | — | Full | View | — | Full | — | — |
| **View / Print Fee Receipts** | — | Full | Full | — | Full | View Own | View Child |
| **Exam Schedules & Setup** | — | Full | Full | View Assigned | — | View Scheduled | View Scheduled |
| **Enter / Modify Marks** | — | Full | Full | Full (Assigned) | — | — | — |
| **View / Print Report Cards** | — | Full | Full | Full (Assigned) | — | View Own | View Child |
| **Timetable Management** | — | Full | Full | View Assigned | — | View Own | View Child |
| **Homework Posting** | — | Full | View | Full (Assigned) | — | View Own | View Child |
| **Notice Board Publishing** | Full | Full | Full | Class Notices | — | View Targeted | View Targeted |
| **Online Admissions Pipeline** | — | Full | Full | — | — | — | Submit Enquiry |
| **Convert Applicant to Student**| — | Full | Full | — | — | — | — |
| **Library Management** | — | Full | View | Borrow Records | — | Borrow Records | — |
| **Transport & Bus Fleet** | — | Full | View | — | — | — | View Route |
| **Audit Log Viewing** | Full | Full | View | — | — | — | — |

---

## 3. Financial Computation Standards
- **Paise-Safe Integrity:** All financial figures are stored as 64-bit integer paise (`amountPaise`).
- **No Floating Point Inaccuracies:** `₹ 45,000.50` is stored internally as `4500050`. This prevents IEEE-754 floating-point rounding discrepancies during aggregation.
- **Audit Trails on Reversals:** Fee payments are never deleted from the database. Reversals mark `status: REVERSED` with a required audited reason and timestamp.
