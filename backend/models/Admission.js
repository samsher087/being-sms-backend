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
exports.AdmissionEnquiry = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AdmissionEnquirySchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicSessionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AcademicSession' },
    applicationNumber: { type: String, required: true, trim: true },
    applicantName: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    dob: { type: Date, required: true },
    classAppliedFor: { type: String, required: true },
    parentName: { type: String, required: true },
    relationship: { type: String, default: 'Father' },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    address: { type: String, default: '' },
    previousSchool: { type: String, default: '' },
    previousPercentage: { type: Number },
    status: {
        type: String,
        enum: ['ENQUIRY', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'ENROLLED'],
        default: 'ENQUIRY',
        index: true,
    },
    interviewDate: { type: Date },
    notes: { type: String, default: '' },
    assignedStaffId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    convertedStudentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student' },
}, { timestamps: true });
AdmissionEnquirySchema.index({ tenantId: 1, applicationNumber: 1 }, { unique: true });
exports.AdmissionEnquiry = mongoose_1.default.model('AdmissionEnquiry', AdmissionEnquirySchema);
