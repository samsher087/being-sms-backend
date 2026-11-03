"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClass = exports.updateClass = exports.createClass = exports.listClasses = exports.setCurrentSession = exports.createSession = exports.listSessions = void 0;
const AcademicSession_1 = require("../models/AcademicSession");
const ClassSection_1 = require("../models/ClassSection");
const Tenant_1 = require("../models/Tenant");
const Student_1 = require("../models/Student");
// SESSIONS 
const listSessions = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const sessions = await AcademicSession_1.AcademicSession.find({ tenantId }).sort({ startDate: -1 });
        res.json({ success: true, sessions });
    }
    catch (error) {
        next(error);
    }
};
exports.listSessions = listSessions;
const createSession = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { name, startDate, endDate, isCurrent } = req.body;
        if (isCurrent) {
            await AcademicSession_1.AcademicSession.updateMany({ tenantId }, { isCurrent: false });
        }
        const session = await AcademicSession_1.AcademicSession.create({
            tenantId,
            name,
            startDate,
            endDate,
            isCurrent: !!isCurrent,
            status: 'ACTIVE',
        });
        if (isCurrent) {
            await Tenant_1.Tenant.findByIdAndUpdate(tenantId, { 'settings.currentSessionId': session._id });
        }
        res.status(201).json({ success: true, message: 'Academic session created.', session });
    }
    catch (error) {
        next(error);
    }
};
exports.createSession = createSession;
const setCurrentSession = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { id } = req.params;
        await AcademicSession_1.AcademicSession.updateMany({ tenantId }, { isCurrent: false });
        const session = await AcademicSession_1.AcademicSession.findOneAndUpdate({ _id: id, tenantId }, { isCurrent: true }, { new: true });
        await Tenant_1.Tenant.findByIdAndUpdate(tenantId, { 'settings.currentSessionId': id });
        res.json({ success: true, message: 'Current academic session updated.', session });
    }
    catch (error) {
        next(error);
    }
};
exports.setCurrentSession = setCurrentSession;
// CLASSES & SECTIONS
const listClasses = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { sessionId } = req.query;
        const filter = { tenantId };
        if (sessionId) {
            filter.academicSessionId = sessionId;
        }
        const classes = await ClassSection_1.ClassSection.find(filter)
            .populate('classTeacherId', 'name employeeId email phone')
            .populate('subjects.teacherId', 'name employeeId')
            .sort({ className: 1, section: 1 });
        // Attach student count
        const classesWithCounts = await Promise.all(classes.map(async (cls) => {
            const studentCount = await Student_1.Student.countDocuments({ classId: cls._id, status: 'ACTIVE' });
            return {
                ...cls.toObject(),
                studentCount,
            };
        }));
        res.json({ success: true, classes: classesWithCounts });
    }
    catch (error) {
        next(error);
    }
};
exports.listClasses = listClasses;
const createClass = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { className, section, academicSessionId, roomNumber, capacity, classTeacherId, subjects } = req.body;
        const existing = await ClassSection_1.ClassSection.findOne({
            tenantId,
            academicSessionId,
            className,
            section: section.toUpperCase(),
        });
        if (existing) {
            res.status(400).json({ success: false, message: `Class ${className}-${section} already exists in this session.` });
            return;
        }
        const newClass = await ClassSection_1.ClassSection.create({
            tenantId,
            academicSessionId,
            className,
            section: section.toUpperCase(),
            roomNumber,
            capacity: capacity || 40,
            classTeacherId,
            subjects: subjects || [
                { name: 'English Core', code: 'ENG101', maxMarks: 100, passingMarks: 33 },
                { name: 'Mathematics', code: 'MATH101', maxMarks: 100, passingMarks: 33 },
                { name: 'Science', code: 'SCI101', maxMarks: 100, passingMarks: 33 },
                { name: 'Social Studies', code: 'SST101', maxMarks: 100, passingMarks: 33 },
                { name: 'Hindi', code: 'HIN101', maxMarks: 100, passingMarks: 33 },
            ],
        });
        res.status(201).json({ success: true, message: 'Class created successfully.', class: newClass });
    }
    catch (error) {
        next(error);
    }
};
exports.createClass = createClass;
const updateClass = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { id } = req.params;
        const updated = await ClassSection_1.ClassSection.findOneAndUpdate({ _id: id, tenantId }, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ success: false, message: 'Class not found.' });
            return;
        }
        res.json({ success: true, message: 'Class updated successfully.', class: updated });
    }
    catch (error) {
        next(error);
    }
};
exports.updateClass = updateClass;
const deleteClass = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { id } = req.params;
        const activeStudents = await Student_1.Student.countDocuments({ classId: id, status: 'ACTIVE' });
        if (activeStudents > 0) {
            res.status(400).json({
                success: false,
                message: `Cannot delete class. There are currently ${activeStudents} active students enrolled. Transfer them first.`,
            });
            return;
        }
        await ClassSection_1.ClassSection.findOneAndDelete({ _id: id, tenantId });
        res.json({ success: true, message: 'Class deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteClass = deleteClass;
