import mongoose, { Document, Schema } from 'mongoose';

export interface IFeeHead {
  name: string; // e.g. "Tuition Fee", "Development Fee", "Lab & Computer Fee", "Sports Fee"
  amountPaise: number; // Stored in paise for precision
}

export interface IFeeStructure extends Document {
  tenantId: mongoose.Types.ObjectId;
  academicSessionId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ONE_TIME';
  dueDateDay: number; // day of the month e.g. 10
  heads: IFeeHead[];
  totalPaise: number;
}

const FeeHeadSchema = new Schema<IFeeHead>(
  {
    name: { type: String, required: true },
    amountPaise: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const FeeStructureSchema = new Schema<IFeeStructure>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicSessionId: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'ClassSection', required: true, index: true },
    frequency: {
      type: String,
      enum: ['MONTHLY', 'QUARTERLY', 'ANNUAL', 'ONE_TIME'],
      default: 'QUARTERLY',
    },
    dueDateDay: { type: Number, default: 10 },
    heads: [FeeHeadSchema],
    totalPaise: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

FeeStructureSchema.index({ tenantId: 1, academicSessionId: 1, classId: 1 }, { unique: true });

export const FeeStructure = mongoose.model<IFeeStructure>('FeeStructure', FeeStructureSchema);

export type PaymentMethod = 'CASH' | 'UPI' | 'NET_BANKING' | 'CHEQUE' | 'ONLINE_RAZORPAY';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE' | 'REVERSED';

export interface IFeePayment extends Document {
  tenantId: mongoose.Types.ObjectId;
  academicSessionId: mongoose.Types.ObjectId;
  receiptNumber: string; // unique per tenant, e.g. REC-2026-0001
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  feeMonth: string; // e.g. "April 2026", "Quarter 1 (Apr-Jun 2026)"
  totalDuePaise: number;
  discountPaise: number; // concession or scholarship applied
  paidPaise: number;
  balancePaise: number;
  heads?: IFeeHead[];
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentDate: Date;
  transactionRef?: string; // Cheque No / UPI Ref / Razorpay payment ID
  notes?: string;
  collectedBy: mongoose.Types.ObjectId; // User ID
  isReversed?: boolean;
  reversalReason?: string;
}

const FeePaymentSchema = new Schema<IFeePayment>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicSessionId: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true, index: true },
    receiptNumber: { type: String, required: true, trim: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'ClassSection', required: true, index: true },
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
    collectedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isReversed: { type: Boolean, default: false },
    reversalReason: { type: String, default: '' },
  },
  { timestamps: true }
);

FeePaymentSchema.index({ tenantId: 1, receiptNumber: 1 }, { unique: true });
FeePaymentSchema.index({ tenantId: 1, studentId: 1, feeMonth: 1 });

export const FeePayment = mongoose.model<IFeePayment>('FeePayment', FeePaymentSchema);
