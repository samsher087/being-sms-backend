"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const noticeController_1 = require("../controllers/noticeController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateUser);
// Notices
router.get('/', noticeController_1.listNotices);
router.post('/', (0, auth_1.requireRoles)('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'), noticeController_1.createNotice);
router.delete('/:id', (0, auth_1.requireRoles)('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), noticeController_1.deleteNotice);
// Assignments
router.get('/assignments/list', noticeController_1.listAssignments);
router.post('/assignments/create', (0, auth_1.requireRoles)('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), noticeController_1.createAssignment);
exports.default = router;
