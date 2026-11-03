import mongoose, { Document, Schema } from 'mongoose';

export interface IAcademicSession extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string; // e.g. "2026-2027"
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
}

const AcademicSessionSchema = new Schema<IAcademicSession>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['UPCOMING', 'ACTIVE', 'COMPLETED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

AcademicSessionSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const AcademicSession = mongoose.model<IAcademicSession>('AcademicSession', AcademicSessionSchema);
