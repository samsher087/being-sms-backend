"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenantController_1 = require("../controllers/tenantController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public: get tenant branding by code (for public school website)
router.get('/public/:code', tenantController_1.getTenantByCode);
// Super admin: list all tenants
router.get('/', auth_1.authenticateUser, (0, auth_1.requireRoles)('SUPER_ADMIN'), tenantController_1.listTenants);
// Super admin: provision new school tenant
router.post('/', auth_1.authenticateUser, (0, auth_1.requireRoles)('SUPER_ADMIN'), tenantController_1.createTenant);
// Super admin & School Admin: update school profile/theme
router.put('/:id', auth_1.authenticateUser, (0, auth_1.requireRoles)('SUPER_ADMIN', 'SCHOOL_ADMIN'), tenantController_1.updateTenant);
// Super admin: update subscription plan & limits
router.put('/:id/subscription', auth_1.authenticateUser, (0, auth_1.requireRoles)('SUPER_ADMIN'), tenantController_1.updateSubscription);
exports.default = router;
