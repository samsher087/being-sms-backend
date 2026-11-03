"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const academicController_1 = require("../controllers/academicController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateUser);
// Academic Sessions
router.get('/sessions', academicController_1.listSessions);
router.post('/sessions', (0, auth_1.requireRoles)('SUPER_ADMIN', 'SCHOOL_ADMIN'), academicController_1.createSession);
router.put('/sessions/:id/set-current', (0, auth_1.requireRoles)('SUPER_ADMIN', 'SCHOOL_ADMIN'), academicController_1.setCurrentSession);
// Classes & Sections
router.get('/classes', academicController_1.listClasses);
router.post('/classes', (0, auth_1.requireRoles)('SUPER_ADMIN', 'SCHOOL_ADMIN'), academicController_1.createClass);
router.put('/classes/:id', (0, auth_1.requireRoles)('SUPER_ADMIN', 'SCHOOL_ADMIN'), academicController_1.updateClass);
router.delete('/classes/:id', (0, auth_1.requireRoles)('SUPER_ADMIN', 'SCHOOL_ADMIN'), academicController_1.deleteClass);
exports.default = router;
