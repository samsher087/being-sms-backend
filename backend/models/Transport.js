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
exports.TransportRoute = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const RouteStopSchema = new mongoose_1.Schema({
    stopName: { type: String, required: true },
    pickupTime: { type: String, required: true },
    dropTime: { type: String, required: true },
    monthlyFeePaise: { type: Number, default: 200000 }, // ₹2,000
}, { _id: false });
const TransportRouteSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    routeName: { type: String, required: true, trim: true },
    vehicleNumber: { type: String, required: true, uppercase: true, trim: true },
    vehicleModel: { type: String, default: 'School Bus' },
    driverName: { type: String, required: true },
    driverPhone: { type: String, required: true },
    driverLicense: { type: String, default: '' },
    attendantName: { type: String, default: '' },
    attendantPhone: { type: String, default: '' },
    capacity: { type: Number, default: 32 },
    stops: [RouteStopSchema],
    assignedStudentIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Student' }],
    status: { type: String, enum: ['ACTIVE', 'MAINTENANCE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });
TransportRouteSchema.index({ tenantId: 1, routeName: 1 }, { unique: true });
exports.TransportRoute = mongoose_1.default.model('TransportRoute', TransportRouteSchema);
