"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const websiteController_1 = require("../controllers/websiteController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public: Get tenant website content for visitor page
router.get('/public/:code', websiteController_1.getPublicWebsiteData);
// School Admin & Super Admin: Update CMS content
router.put('/cms', auth_1.authenticateUser, (0, auth_1.requireRoles)('SUPER_ADMIN', 'SCHOOL_ADMIN'), websiteController_1.updateWebsiteContent);
exports.default = router;
