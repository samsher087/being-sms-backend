# SoftDeals SMS — Security & Student Data Privacy Checklist

This document details the safeguards built into the SoftDeals School Management System to ensure data privacy, compliance with Indian regulations (including DPDP Act 2023), and protection against common web application vulnerabilities.

---

## 1. Student Data Privacy (DPDP Act & Minor Safeguards)
- **Data Minimization:** Only collect essential details required for academic administration (name, emergency contacts, parent names, date of birth, medical blood group).
- **Log Sanitation:** Sensitive personal identifying information (PII) such as phone numbers, student medical history, and passwords are never outputted into server access logs.
- **Parental Visibility Isolation:** Parents can only access their explicitly linked children via `linkedChildrenIds` queries. Cross-student inspection through API parameter tampering is strictly blocked by backend authorization checks.
- **Private Storage:** Document attachments and student records are stored with access-restricted signed URL policies.

---

## 2. Authentication & Authorization
- **Bcrypt Password Hashing:** Passwords are salted and hashed using `bcryptjs` with 10 rounds of salt generation. Plain-text passwords are never stored in the database.
- **JWT Protection:** Signed with high-entropy cryptographic secrets, set to expire in 7 days, and transmitted via HTTP headers or `httpOnly` cookies with `SameSite=Lax`.
- **Role-Based Access Control (RBAC):** Server-side middleware verifies roles (`SUPER_ADMIN`, `SCHOOL_ADMIN`, `PRINCIPAL`, `TEACHER`, `ACCOUNTANT`, `STUDENT`, `PARENT`) at the Express route level, preventing unauthorized API execution regardless of frontend UI state.

---

## 3. Financial Integrity & Paise-Safe Arithmetic
- **Paise-Safe Integers:** All fee transactions, receipts, concessions, and discounts are computed and stored in integer **paise** (`amountPaise`). This prevents floating-point inaccuracies where sums like `0.1 + 0.2 != 0.3`.
- **Unique Receipt Sequence:** Receipts use unique sequential numbers (e.g. `DPS-REC-2026-00001`) protected by database-level compound unique indexes.
- **Immutable Payment Ledgers:** Transactions cannot be silently modified or deleted. Payment adjustments require a controlled reversal (`status: REVERSED`) accompanied by a mandatory audited justification.
- **Payment Gateway Security:** Integrations with Indian payment gateways (such as Razorpay) use server-side order generation and signature verification. Banking PINs, card CVVs, and net banking credentials are never handled or stored by the application.

---

## 4. Multi-Tenant Data Isolation
- **Tenant Affinity Enforced:** Every database collection (Students, Teachers, Classes, Fees, Exams, Timetables, Notices) maintains a mandatory indexed `tenantId` field.
- **Query Scoping:** Server middleware automatically binds `req.tenantId` to the authenticated user's session. Database queries explicitly scope by `tenantId`.

---

## 5. Defense in Depth
- **HTTP Security Headers:** Helmet.js configures secure headers including `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and XSS protection.
- **Rate Limiting:** Protects `/api/v1/auth/login` and sensitive endpoints against automated credential stuffing and brute-force attacks.
- **CORS Protection:** Rejects unauthorized cross-origin resource requests.
