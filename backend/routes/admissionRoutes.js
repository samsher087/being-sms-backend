"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admissionController_1 = require("../controllers/admissionController");
const auth_1 = require("../middleware/auth");
const tenant_1 = require("../middleware/tenant");
const router = (0, express_1.Router)();
// Public admission enquiry form submission
router.post('/public-enquiry', tenant_1.tenantMiddleware, admissionController_1.submitPublicEnquiry);
// Protected admissions management
router.use(auth_1.authenticateUser);
router.use((0, auth_1.requireRoles)('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'));
router.get('/enquiries', admissionController_1.listEnquiries);
router.put('/enquiries/:id/status', admissionController_1.updateEnquiryStatus);
router.post('/enquiries/:id/convert', admissionController_1.convertEnquiryToStudent);
exports.default = router;
