"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamResult = exports.ExamSchedule = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ExamSubjectSchema = new mongoose_1.Schema({
    subjectName: { type: String, required: true },
    subjectCode: { type: String, required: true },
    examDate: { type: Date, required: true },
    startTime: { type: String, default: '09:00 AM' },
    endTime: { type: String, default: '12:00 PM' },
    maxMarks: { type: Number, default: 100 },
    passingMarks: { type: Number, default: 33 },
}, { _id: false });
const ExamScheduleSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicSessionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AcademicSession', required: true, index: true },
    name: { type: String, required: true, trim: true },
    examType: {
        type: String,
        enum: ['UNIT_TEST', 'TERM_1', 'TERM_2', 'FINAL', 'PRACTICAL'],
        default: 'TERM_1',
    },
    classIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'ClassSection' }],
    subjects: [ExamSubjectSchema],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'RESULTS_PUBLISHED'],
        default: 'UPCOMING',
    },
}, { timestamps: true });
exports.ExamSchedule = mongoose_1.default.model('ExamSchedule', ExamScheduleSchema);
const SubjectMarkSchema = new mongoose_1.Schema({
    subjectName: { type: String, required: true },
    subjectCode: { type: String, required: true },
    marksObtained: { type: Number, required: true, min: 0 },
    maxMarks: { type: Number, required: true, default: 100 },
    grade: { type: String, default: 'B' },
    remarks: { type: String, default: '' },
}, { _id: false });
const ExamResultSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    examId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamSchedule', required: true, index: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    classId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ClassSection', required: true, index: true },
    subjectMarks: [SubjectMarkSchema],
    totalObtained: { type: Number, required: true },
    totalMax: { type: Number, required: true },
    percentage: { type: Number, required: true },
    overallGrade: { type: String, default: 'B' },
    resultStatus: { type: String, enum: ['PASS', 'FAIL', 'COMPARTMENT'], default: 'PASS' },
    teacherRemarks: { type: String, default: 'Good performance. Keep it up!' },
}, { timestamps: true });
ExamResultSchema.index({ tenantId: 1, examId: 1, studentId: 1 }, { unique: true });
exports.ExamResult = mongoose_1.default.model('ExamResult', ExamResultSchema);
