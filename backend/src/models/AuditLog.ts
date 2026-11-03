import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  tenantId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userName?: string;
  userRole?: string;
  action: string; // e.g. "STUDENT_ADMITTED", "FEE_PAYMENT_RECORDED", "TENANT_CREATED", "MARKS_UPDATED"
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, default: 'System' },
    userRole: { type: String, default: '' },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    details: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

AuditLogSchema.index({ tenantId: 1, timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
