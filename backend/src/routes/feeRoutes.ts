import { Router } from 'express';
import {
  listFeeStructures,
  saveFeeStructure,
  getStudentFeeStatus,
  recordFeePayment,
  getPaymentReceipt,
  listAllPayments,
  reversePayment,
  createRazorpayOrder,
} from '../controllers/feeController';
import { authenticateUser, requireRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/structures', listFeeStructures);
router.post('/structures', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'), saveFeeStructure);

router.get('/student/:studentId', getStudentFeeStatus);
router.get('/receipt/:receiptNumber', getPaymentReceipt);
router.get('/payments', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PRINCIPAL'), listAllPayments);

router.post('/record-payment', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'), recordFeePayment);
router.post('/reverse/:id', requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'), reversePayment);

// Razorpay Indian Gateway
router.post('/razorpay/create-order', createRazorpayOrder);

export default router;
