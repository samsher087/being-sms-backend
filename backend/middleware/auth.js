"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordAuditLog = exports.requireRoles = exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const AuditLog_1 = require("../models/AuditLog");
const authenticateUser = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
            return;
        }
        const secret = process.env.JWT_SECRET || 'super_secret_softdeals_jwt_key_2026_school_management';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await User_1.User.findById(decoded.id).select('-password');
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: 'User account not found or has been deactivated.' });
            return;
        }
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
        // Tenant binding
        if (user.role !== 'SUPER_ADMIN') {
            if (user.tenantId) {
                // Enforce that user can only operate in their own school tenant
                req.tenantId = user.tenantId;
            }
        }
        else {
            // Super Admin can override or operate on whichever tenant is supplied in headers
            if (!req.tenantId && user.tenantId) {
                req.tenantId = user.tenantId;
            }
        }
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
    }
};
exports.authenticateUser = authenticateUser;
const requireRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.userRole) {
            res.status(401).json({ success: false, message: 'Authentication required.' });
            return;
        }
        if (req.userRole === 'SUPER_ADMIN') {
            return next(); // Super admin has global system-level access
        }
        if (!roles.includes(req.userRole)) {
            res.status(403).json({
                success: false,
                message: `Access denied. Role '${req.userRole}' does not have sufficient permissions.`,
            });
            return;
        }
        next();
    };
};
exports.requireRoles = requireRoles;
const recordAuditLog = async (params) => {
    try {
        await AuditLog_1.AuditLog.create(params);
    }
    catch (err) {
        console.error('Failed to write audit log:', err);
    }
};
exports.recordAuditLog = recordAuditLog;
