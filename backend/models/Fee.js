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
exports.FeePayment = exports.FeeStructure = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const FeeHeadSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    amountPaise: { type: Number, required: true, min: 0 },
}, { _id: false });
const FeeStructureSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicSessionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AcademicSession', required: true, index: true },
    classId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ClassSection', required: true, index: true },
    frequency: {
        type: String,
        enum: ['MONTHLY', 'QUARTERLY', 'ANNUAL', 'ONE_TIME'],
        default: 'QUARTERLY',
    },
    dueDateDay: { type: Number, default: 10 },
    heads: [FeeHeadSchema],
    totalPaise: { type: Number, required: true, min: 0 },
}, { timestamps: true });
FeeStructureSchema.index({ tenantId: 1, academicSessionId: 1, classId: 1 }, { unique: true });
exports.FeeStructure = mongoose_1.default.model('FeeStructure', FeeStructureSchema);
const FeePaymentSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicSessionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AcademicSession', required: true, index: true },
    receiptNumber: { type: String, required: true, trim: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    classId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ClassSection', required: true, index: true },
    feeMonth: { type: String, required: true },
    totalDuePaise: { type: Number, required: true, min: 0 },
    discountPaise: { type: Number, default: 0, min: 0 },
    paidPaise: { type: Number, required: true, min: 0 },
    balancePaise: { type: Number, default: 0, min: 0 },
    heads: [FeeHeadSchema],
    paymentMethod: {
        type: String,
        enum: ['CASH', 'UPI', 'NET_BANKING', 'CHEQUE', 'ONLINE_RAZORPAY'],
        default: 'UPI',
    },
    status: {
        type: String,
        enum: ['PAID', 'PARTIAL', 'PENDING', 'OVERDUE', 'REVERSED'],
        default: 'PAID',
        index: true,
    },
    paymentDate: { type: Date, default: Date.now },
    transactionRef: { type: String, default: '' },
    notes: { type: String, default: '' },
    collectedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    isReversed: { type: Boolean, default: false },
    reversalReason: { type: String, default: '' },
}, { timestamps: true });
FeePaymentSchema.index({ tenantId: 1, receiptNumber: 1 }, { unique: true });
FeePaymentSchema.index({ tenantId: 1, studentId: 1, feeMonth: 1 });
exports.FeePayment = mongoose_1.default.model('FeePayment', FeePaymentSchema);
