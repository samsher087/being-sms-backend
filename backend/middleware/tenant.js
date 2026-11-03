"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantMiddleware = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Tenant_1 = require("../models/Tenant");
const tenantMiddleware = async (req, res, next) => {
    try {
        // 1. Check header x-tenant-id or x-tenant-code
        const headerTenantId = req.headers['x-tenant-id'];
        const headerTenantCode = req.headers['x-tenant-code'];
        let tenant = null;
        if (headerTenantId && mongoose_1.default.isValidObjectId(headerTenantId)) {
            tenant = await Tenant_1.Tenant.findById(headerTenantId);
        }
        else if (headerTenantCode) {
            tenant = await Tenant_1.Tenant.findOne({ code: headerTenantCode.toLowerCase() });
        }
        // 2. If not found in headers, check hostname/subdomain (e.g. dps.softdeals.in)
        if (!tenant) {
            const host = req.hostname || req.headers.host || '';
            const parts = host.split('.');
            if (parts.length > 2) {
                const potentialSubdomain = parts[0].toLowerCase();
                if (potentialSubdomain !== 'www' && potentialSubdomain !== 'api') {
                    tenant = await Tenant_1.Tenant.findOne({ subdomain: potentialSubdomain });
                }
            }
        }
        if (tenant) {
            req.tenant = tenant;
            req.tenantId = tenant._id;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.tenantMiddleware = tenantMiddleware;
