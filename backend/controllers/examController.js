"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassResults = exports.getStudentReportCard = exports.submitStudentMarks = exports.createExamSchedule = exports.listExamSchedules = void 0;
const Exam_1 = require("../models/Exam");
const Tenant_1 = require("../models/Tenant");
const auth_1 = require("../middleware/auth");
const calculateCBSEGrade = (percentage) => {
    if (percentage >= 91)
        return 'A1';
    if (percentage >= 81)
        return 'A2';
    if (percentage >= 71)
        return 'B1';
    if (percentage >= 61)
        return 'B2';
    if (percentage >= 51)
        return 'C1';
    if (percentage >= 41)
        return 'C2';
    if (percentage >= 33)
        return 'D';
    return 'E (Needs Improvement)';
};
const listExamSchedules = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { classId } = req.query;
        const filter = { tenantId };
        if (classId) {
            filter.classIds = classId;
        }
        const exams = await Exam_1.ExamSchedule.find(filter)
            .populate('classIds', 'className section')
            .sort({ startDate: -1 });
        res.json({ success: true, exams });
    }
    catch (error) {
        next(error);
    }
};
exports.listExamSchedules = listExamSchedules;
const createExamSchedule = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { name, examType, classIds, subjects, startDate, endDate, academicSessionId } = req.body;
        const exam = await Exam_1.ExamSchedule.create({
            tenantId,
            academicSessionId,
            name,
            examType: examType || 'TERM_1',
            classIds: classIds || [],
            subjects: subjects || [],
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: 'UPCOMING',
        });
        await (0, auth_1.recordAuditLog)({
            tenantId,
            userId: req.userId,
            userName: req.user?.name,
            userRole: req.userRole,
            action: 'EXAM_SCHEDULED',
            resourceType: 'EXAM',
            resourceId: exam._id.toString(),
            details: { name, examType },
        });
        res.status(201).json({ success: true, message: 'Examination schedule created successfully.', exam });
    }
    catch (error) {
        next(error);
    }
};
exports.createExamSchedule = createExamSchedule;
const submitStudentMarks = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { examId, studentId, classId, subjectMarks, teacherRemarks } = req.body;
        let totalObtained = 0;
        let totalMax = 0;
        const formattedMarks = (subjectMarks || []).map((sm) => {
            const marksObt = Number(sm.marksObtained || 0);
            const maxM = Number(sm.maxMarks || 100);
            totalObtained += marksObt;
            totalMax += maxM;
            const subPct = maxM > 0 ? (marksObt / maxM) * 100 : 0;
            return {
                subjectName: sm.subjectName,
                subjectCode: sm.subjectCode,
                marksObtained: marksObt,
                maxMarks: maxM,
                grade: calculateCBSEGrade(subPct),
                remarks: sm.remarks || '',
            };
        });
        const percentage = totalMax > 0 ? parseFloat(((totalObtained / totalMax) * 100).toFixed(2)) : 0;
        const overallGrade = calculateCBSEGrade(percentage);
        const resultStatus = percentage >= 33 ? 'PASS' : 'FAIL';
        const result = await Exam_1.ExamResult.findOneAndUpdate({ tenantId, examId, studentId }, {
            tenantId,
            examId,
            studentId,
            classId,
            subjectMarks: formattedMarks,
            totalObtained,
            totalMax,
            percentage,
            overallGrade,
            resultStatus,
            teacherRemarks: teacherRemarks || 'Good academic effort shown.',
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
        res.json({ success: true, message: 'Student marks saved successfully.', result });
    }
    catch (error) {
        next(error);
    }
};
exports.submitStudentMarks = submitStudentMarks;
const getStudentReportCard = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { examId, studentId } = req.params;
        const result = await Exam_1.ExamResult.findOne({ tenantId, examId, studentId })
            .populate('studentId')
            .populate('classId', 'className section')
            .populate('examId', 'name examType startDate endDate');
        if (!result) {
            res.status(404).json({ success: false, message: 'Examination marks not yet entered for this student.' });
            return;
        }
        const tenant = await Tenant_1.Tenant.findById(tenantId);
        res.json({
            success: true,
            reportCard: {
                ...result.toObject(),
                school: {
                    name: tenant?.name,
                    logo: tenant?.logo,
                    address: tenant?.contact?.address,
                    tagline: tenant?.tagline,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStudentReportCard = getStudentReportCard;
const getClassResults = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { examId, classId } = req.params;
        const results = await Exam_1.ExamResult.find({ tenantId, examId, classId })
            .populate('studentId', 'name admissionNumber rollNumber')
            .sort({ percentage: -1 });
        res.json({ success: true, results });
    }
    catch (error) {
        next(error);
    }
};
exports.getClassResults = getClassResults;
