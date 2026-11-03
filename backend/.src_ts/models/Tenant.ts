import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  code: string; // unique slug e.g. "dps-rkp"
  subdomain: string;
  tagline: string;
  logo: string;
  contact: {
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    website?: string;
  };
  subscription: {
    plan: 'FREE' | 'STARTER' | 'GROWTH' | 'ENTERPRISE';
    status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'EXPIRED';
    studentLimit: number;
    staffLimit: number;
    expiresAt: Date;
  };
  themeConfig: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    heroBanner?: string;
    schoolMotto?: string;
  };
  settings: {
    currencySymbol: string;
    receiptPrefix: string;
    admissionPrefix: string;
    currentSessionId?: mongoose.Types.ObjectId;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
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
      currentSessionId: { type: Schema.Types.ObjectId, ref: 'AcademicSession' },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
