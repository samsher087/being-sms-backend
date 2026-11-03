"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssignment = exports.listAssignments = exports.deleteNotice = exports.createNotice = exports.listNotices = void 0;
const Notice_1 = require("../models/Notice");
const Assignment_1 = require("../models/Assignment");
const auth_1 = require("../middleware/auth");
// NOTICES
const listNotices = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const userRole = req.userRole;
        const filter = { tenantId };
        // Role-based targeting filter
        if (userRole === 'STUDENT') {
            filter.targetRole = { $in: ['ALL', 'STUDENTS'] };
        }
        else if (userRole === 'PARENT') {
            filter.targetRole = { $in: ['ALL', 'PARENTS'] };
        }
        else if (userRole === 'TEACHER') {
            filter.targetRole = { $in: ['ALL', 'TEACHERS'] };
        }
        const notices = await Notice_1.Notice.find(filter)
            .populate('postedBy', 'name role')
            .sort({ isPinned: -1, publishDate: -1 });
        res.json({ success: true, notices });
    }
    catch (error) {
        next(error);
    }
};
exports.listNotices = listNotices;
const createNotice = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { title, content, targetRole, priority, classId, isPinned, expiryDate } = req.body;
        const notice = await Notice_1.Notice.create({
            tenantId,
            title,
            content,
            targetRole: targetRole || 'ALL',
            priority: priority || 'NORMAL',
            classId,
            isPinned: !!isPinned,
            expiryDate: expiryDate ? new Date(expiryDate) : undefined,
            postedBy: req.userId,
        });
        await (0, auth_1.recordAuditLog)({
            tenantId,
            userId: req.userId,
            userName: req.user?.name,
            userRole: req.userRole,
            action: 'NOTICE_PUBLISHED',
            resourceType: 'NOTICE',
            resourceId: notice._id.toString(),
            details: { title, targetRole },
        });
        res.status(201).json({ success: true, message: 'Notice published successfully.', notice });
    }
    catch (error) {
        next(error);
    }
};
exports.createNotice = createNotice;
const deleteNotice = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { id } = req.params;
        await Notice_1.Notice.findOneAndDelete({ _id: id, tenantId });
        res.json({ success: true, message: 'Notice removed successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteNotice = deleteNotice;
// ASSIGNMENTS & HOMEWORK
const listAssignments = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { classId, subject } = req.query;
        const filter = { tenantId };
        if (classId)
            filter.classId = classId;
        if (subject)
            filter.subject = subject;
        const assignments = await Assignment_1.Assignment.find(filter)
            .populate('classId', 'className section')
            .populate('teacherId', 'name employeeId')
            .sort({ dueDate: 1 });
        res.json({ success: true, assignments });
    }
    catch (error) {
        next(error);
    }
};
exports.listAssignments = listAssignments;
const createAssignment = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { classId, teacherId, subject, title, instructions, dueDate, maxMarks, academicSessionId } = req.body;
        const assignment = await Assignment_1.Assignment.create({
            tenantId,
            academicSessionId,
            classId,
            teacherId: teacherId || req.user?.linkedTeacherId,
            subject,
            title,
            instructions,
            dueDate: new Date(dueDate),
            maxMarks: maxMarks || 20,
        });
        res.status(201).json({ success: true, message: 'Assignment posted successfully.', assignment });
    }
    catch (error) {
        next(error);
    }
};
exports.createAssignment = createAssignment;
