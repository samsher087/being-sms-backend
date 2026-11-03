"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feeController_1 = require("../controllers/feeController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateUser);
router.get('/structures', feeController_1.listFeeStructures);
router.post('/structures', (0, auth_1.requireRoles)('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'), feeController_1.saveFeeStructure);
router.get('/student/:studentId', feeController_1.getStudentFeeStatus);
router.get('/receipt/:receiptNumber', feeController_1.getPaymentReceipt);
router.get('/payments', (0, auth_1.requireRoles)('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PRINCIPAL'), feeController_1.listAllPayments);
router.post('/record-payment', (0, auth_1.requireRoles)('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'), feeController_1.recordFeePayment);
router.post('/reverse/:id', (0, auth_1.requireRoles)('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'), feeController_1.reversePayment);
// Razorpay Indian Gateway
router.post('/razorpay/create-order', feeController_1.createRazorpayOrder);
exports.default = router;
