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
exports.Teacher = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TeacherSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Female' },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    designation: { type: String, required: true, trim: true },
    department: { type: String, default: 'General' },
    qualification: { type: String, default: 'Graduate B.Ed' },
    joiningDate: { type: Date, default: Date.now },
    salaryPaise: { type: Number, default: 4500000 }, // in paise (e.g. ₹45,000)
    assignedClasses: [
        {
            classId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ClassSection' },
            subject: { type: String, default: '' },
        },
    ],
    avatar: { type: String, default: '' },
    status: {
        type: String,
        enum: ['ACTIVE', 'ON_LEAVE', 'RESIGNED'],
        default: 'ACTIVE',
        index: true,
    },
}, { timestamps: true });
TeacherSchema.index({ tenantId: 1, employeeId: 1 }, { unique: true });
TeacherSchema.index({ tenantId: 1, email: 1 }, { unique: true });
exports.Teacher = mongoose_1.default.model('Teacher', TeacherSchema);
