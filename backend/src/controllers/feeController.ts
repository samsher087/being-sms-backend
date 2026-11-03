import { Request, Response, NextFunction } from 'express';
import { FeeStructure, FeePayment } from '../models/Fee';
import { Student } from '../models/Student';
import { Tenant } from '../models/Tenant';
import { recordAuditLog } from '../middleware/auth';

export const listFeeStructures = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const structures = await FeeStructure.find({ tenantId })
      .populate('classId', 'className section')
      .populate('academicSessionId', 'name');

    res.json({ success: true, structures });
  } catch (error) {
    next(error);
  }
};

export const saveFeeStructure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { classId, academicSessionId, frequency, dueDateDay, heads } = req.body;

    const totalPaise = (heads || []).reduce((sum: number, h: any) => sum + Number(h.amountPaise || 0), 0);

    const structure = await FeeStructure.findOneAndUpdate(
      { tenantId, classId, academicSessionId },
      {
        tenantId,
        academicSessionId,
        classId,
        frequency: frequency || 'QUARTERLY',
        dueDateDay: dueDateDay || 10,
        heads,
        totalPaise,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: 'Fee structure saved successfully.', structure });
  } catch (error) {
    next(error);
  }
};

export const getStudentFeeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { studentId } = req.params;

    const student = await Student.findOne({ _id: studentId, tenantId }).populate('classId');
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    const structure = await FeeStructure.findOne({ tenantId, classId: student.classId });
    const payments = await FeePayment.find({ tenantId, studentId, isReversed: { $ne: true } }).sort({ paymentDate: -1 });

    const standardTotalPaise = structure ? structure.totalPaise : 4500000; // default ₹45,000 / term
    const concession = student.concessionPercent || 0;
    const concessionPaise = Math.round((standardTotalPaise * concession) / 100);
    const netDuePaise = standardTotalPaise - concessionPaise;

    const totalPaidPaise = payments.reduce((sum, p) => sum + p.paidPaise, 0);
    const balancePaise = Math.max(0, netDuePaise - totalPaidPaise);

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        admissionNumber: student.admissionNumber,
        concessionPercent: concession,
      },
      feeSummary: {
        standardFeeINR: standardTotalPaise / 100,
        concessionINR: concessionPaise / 100,
        netPayableINR: netDuePaise / 100,
        totalPaidINR: totalPaidPaise / 100,
        outstandingBalanceINR: balancePaise / 100,
        status: balancePaise === 0 ? 'CLEAR' : totalPaidPaise > 0 ? 'PARTIAL' : 'PENDING',
      },
      feeHeads: structure ? structure.heads : [],
      paymentHistory: payments,
    });
  } catch (error) {
    next(error);
  }
};

export const recordFeePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      res.status(404).json({ success: false, message: 'Tenant not found.' });
      return;
    }

    const {
      studentId,
      classId,
      feeMonth,
      paidAmountINR,
      paymentMethod,
      transactionRef,
      notes,
      discountINR = 0,
      totalDueINR,
      heads,
    } = req.body;

    const discountPaise = Math.round(Number(discountINR || 0) * 100);
    const totalDuePaise = totalDueINR !== undefined
      ? Math.round(Number(totalDueINR) * 100)
      : Math.round(Number(paidAmountINR || 0) * 100) + discountPaise;

    if (totalDuePaise <= discountPaise) {
      res.status(400).json({
        success: false,
        message: 'Gross Fee must be greater than Concession amount.',
      });
      return;
    }

    // Paid amount is strictly gross minus concession
    const paidPaise = totalDuePaise - discountPaise;

    if (paidPaise <= 0) {
      res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
      return;
    }

    // Determine line items / heads that sum up to totalDuePaise exactly
    let paymentHeads = heads;
    if (!paymentHeads || paymentHeads.length === 0) {
      const structure = await FeeStructure.findOne({ tenantId, classId });
      if (structure && structure.heads && structure.heads.length > 0) {
        if (structure.totalPaise === totalDuePaise) {
          paymentHeads = structure.heads;
        } else {
          let runningSum = 0;
          paymentHeads = structure.heads.map((h, i) => {
            if (i === structure.heads.length - 1) {
              return { name: h.name, amountPaise: totalDuePaise - runningSum };
            }
            const proportional = Math.round((h.amountPaise / structure.totalPaise) * totalDuePaise);
            runningSum += proportional;
            return { name: h.name, amountPaise: proportional };
          });
        }
      } else {
        const t = totalDuePaise;
        const tuition = Math.round(t * 0.7111);
        const smartLab = Math.round(t * 0.1111);
        const infra = Math.round(t * 0.0889);
        const sports = t - tuition - smartLab - infra;
        paymentHeads = [
          { name: 'Standard Tuition & Academic Fee', amountPaise: tuition },
          { name: 'Smart Class & AI Maker Lab Facility', amountPaise: smartLab },
          { name: 'Development & Campus Infrastructure', amountPaise: infra },
          { name: 'Sports, Library & Cultural Activities', amountPaise: sports },
        ];
      }
    }

    // Generate unique receipt number
    const prefix = tenant.settings?.receiptPrefix || 'REC';
    const year = new Date().getFullYear();
    const count = await FeePayment.countDocuments({ tenantId });
    const receiptNumber = `${prefix}-${year}-${String(count + 1).padStart(5, '0')}`;

    const payment = await FeePayment.create({
      tenantId,
      academicSessionId: tenant.settings?.currentSessionId,
      receiptNumber,
      studentId,
      classId,
      feeMonth: feeMonth || `Quarter ${Math.floor(new Date().getMonth() / 3) + 1} (${year})`,
      totalDuePaise,
      discountPaise,
      paidPaise,
      balancePaise: Math.max(0, totalDuePaise - discountPaise - paidPaise),
      heads: paymentHeads,
      paymentMethod: paymentMethod || 'UPI',
      status: 'PAID',
      paymentDate: new Date(),
      transactionRef: transactionRef || `TXN-${Date.now().toString().slice(-6)}`,
      notes: notes || 'Standard quarterly school fee payment',
      collectedBy: req.userId,
    });

    await recordAuditLog({
      tenantId,
      userId: req.userId,
      userName: req.user?.name,
      userRole: req.userRole,
      action: 'FEE_PAYMENT_RECORDED',
      resourceType: 'FEE_PAYMENT',
      resourceId: payment._id.toString(),
      details: { receiptNumber, paidINR: paidAmountINR, studentId, paymentMethod },
    });

    res.status(201).json({
      success: true,
      message: 'Fee payment recorded successfully.',
      payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { receiptNumber } = req.params;

    const payment = await FeePayment.findOne({ tenantId, receiptNumber })
      .populate('studentId')
      .populate('classId', 'className section')
      .populate('collectedBy', 'name email');

    if (!payment) {
      res.status(404).json({ success: false, message: 'Fee receipt not found.' });
      return;
    }

    const tenant = await Tenant.findById(tenantId);

    // Compute gross total (total before concession)
    const grossPaise = payment.totalDuePaise && payment.totalDuePaise >= payment.paidPaise
      ? payment.totalDuePaise
      : (payment.paidPaise + (payment.discountPaise || 0));

    // Construct fee heads dynamically if payment doesn't have heads saved
    let heads = payment.heads && payment.heads.length > 0 ? payment.heads : [];
    if (!heads || heads.length === 0) {
      const structure = await FeeStructure.findOne({ tenantId, classId: payment.classId });
      if (structure && structure.heads && structure.heads.length > 0) {
        if (structure.totalPaise === grossPaise) {
          heads = structure.heads;
        } else {
          let runningSum = 0;
          heads = structure.heads.map((h, i) => {
            if (i === structure.heads.length - 1) {
              return { name: h.name, amountPaise: grossPaise - runningSum };
            }
            const proportional = Math.round((h.amountPaise / structure.totalPaise) * grossPaise);
            runningSum += proportional;
            return { name: h.name, amountPaise: proportional };
          });
        }
      } else {
        const t = grossPaise;
        const tuition = Math.round(t * 0.7111);
        const smartLab = Math.round(t * 0.1111);
        const infra = Math.round(t * 0.0889);
        const sports = t - tuition - smartLab - infra;
        heads = [
          { name: 'Standard Tuition & Academic Fee', amountPaise: tuition },
          { name: 'Smart Class & AI Maker Lab Facility', amountPaise: smartLab },
          { name: 'Development & Campus Infrastructure', amountPaise: infra },
          { name: 'Sports, Library & Cultural Activities', amountPaise: sports },
        ];
      }
    }

    const headsWithINR = heads.map((h: any) => ({
      name: h.name,
      amountPaise: h.amountPaise,
      amountINR: (h.amountPaise / 100).toFixed(2),
    }));

    res.json({
      success: true,
      receipt: {
        ...payment.toObject(),
        heads: headsWithINR,
        school: {
          name: tenant?.name,
          logo: tenant?.logo,
          address: tenant?.contact?.address,
          city: tenant?.contact?.city,
          state: tenant?.contact?.state,
          phone: tenant?.contact?.phone,
          email: tenant?.contact?.email,
          currency: tenant?.settings?.currencySymbol || '₹',
        },
        amounts: {
          grossTotalINR: (grossPaise / 100).toFixed(2),
          discountINR: (payment.discountPaise / 100).toFixed(2),
          paidINR: (payment.paidPaise / 100).toFixed(2),
          balanceINR: (payment.balancePaise / 100).toFixed(2),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listAllPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { page = '1', limit = '15', method, status } = req.query;

    const filter: any = { tenantId };
    if (method) filter.paymentMethod = method;
    if (status) filter.status = status;

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const total = await FeePayment.countDocuments(filter);
    const payments = await FeePayment.find(filter)
      .populate('studentId', 'name admissionNumber rollNumber')
      .populate('classId', 'className section')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limitNum);

    // Summary calculation
    const totalCollectedPaise = await FeePayment.aggregate([
      { $match: { tenantId, isReversed: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$paidPaise' } } },
    ]);

    res.json({
      success: true,
      payments,
      stats: {
        totalCollectedINR: ((totalCollectedPaise[0]?.total || 0) / 100).toFixed(2),
        totalTransactions: total,
      },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const reversePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({ success: false, message: 'A valid reason is required to reverse a fee payment.' });
      return;
    }

    const payment = await FeePayment.findOneAndUpdate(
      { _id: id, tenantId },
      {
        isReversed: true,
        status: 'REVERSED',
        reversalReason: reason,
      },
      { new: true }
    );

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found.' });
      return;
    }

    await recordAuditLog({
      tenantId,
      userId: req.userId,
      userName: req.user?.name,
      userRole: req.userRole,
      action: 'FEE_PAYMENT_REVERSED',
      resourceType: 'FEE_PAYMENT',
      resourceId: payment._id.toString(),
      details: { receiptNumber: payment.receiptNumber, reason },
    });

    res.json({ success: true, message: 'Fee payment has been safely reversed.', payment });
  } catch (error) {
    next(error);
  }
};

// Simulated Razorpay Indian payment gateway order initiation
export const createRazorpayOrder = async (req: Request, res: Response): Promise<void> => {
  const { amountINR, studentId, feeMonth } = req.body;
  const orderId = `order_sms_${Date.now()}`;
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_softdeals_demo_key',
    orderId,
    amount: Math.round(Number(amountINR) * 100),
    currency: 'INR',
    name: 'SoftDeals School Fee Gateway',
    description: `Tuition Fee Payment: ${feeMonth}`,
  });
};
