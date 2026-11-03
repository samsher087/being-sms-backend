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
exports.Tenant = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TenantSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    subdomain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tagline: { type: String, default: 'Empowering Education Through Technology' },
    logo: { type: String, default: '' },
    contact: {
        email: { type: String, required: true, lowercase: true, trim: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        website: { type: String, default: '' },
    },
    subscription: {
        plan: {
            type: String,
            enum: ['FREE', 'STARTER', 'GROWTH', 'ENTERPRISE'],
            default: 'GROWTH',
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'TRIAL', 'SUSPENDED', 'EXPIRED'],
            default: 'ACTIVE',
        },
        studentLimit: { type: Number, default: 2000 },
        staffLimit: { type: Number, default: 200 },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
        },
    },
    themeConfig: {
        primaryColor: { type: String, default: '#0B192C' },
        secondaryColor: { type: String, default: '#1E3E62' },
        accentColor: { type: String, default: '#008170' },
        heroBanner: { type: String, default: '' },
        schoolMotto: { type: String, default: 'Knowledge is Power' },
    },
    settings: {
        currencySymbol: { type: String, default: '₹' },
        receiptPrefix: { type: String, default: 'REC' },
        admissionPrefix: { type: String, default: 'ADM' },
        currentSessionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AcademicSession' },
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.Tenant = mongoose_1.default.model('Tenant', TenantSchema);
