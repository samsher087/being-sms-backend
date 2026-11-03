import mongoose, { Document, Schema } from 'mongoose';

export type NoticeTarget = 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'CLASS_SPECIFIC';
export type NoticePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface INotice extends Document {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  targetRole: NoticeTarget;
  classId?: mongoose.Types.ObjectId;
  priority: NoticePriority;
  postedBy: mongoose.Types.ObjectId;
  publishDate: Date;
  expiryDate?: Date;
  attachments?: string[];
  isPinned: boolean;
}

const NoticeSchema = new Schema<INotice>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    targetRole: {
      type: String,
      enum: ['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'CLASS_SPECIFIC'],
      default: 'ALL',
      index: true,
    },
    classId: { type: Schema.Types.ObjectId, ref: 'ClassSection' },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL',
    },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publishDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    attachments: [{ type: String }],
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notice = mongoose.model<INotice>('Notice', NoticeSchema);
