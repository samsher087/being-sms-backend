import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignmentSubmission {
  studentId: mongoose.Types.ObjectId;
  submittedAt: Date;
  content: string;
  attachmentUrl?: string;
  status: 'SUBMITTED' | 'EVALUATED' | 'LATE';
  marksObtained?: number;
  feedback?: string;
}

export interface IAssignment extends Document {
  tenantId: mongoose.Types.ObjectId;
  academicSessionId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  subject: string;
  title: string;
  instructions: string;
  dueDate: Date;
  maxMarks: number;
  attachmentUrl?: string;
  submissions: IAssignmentSubmission[];
}

const SubmissionSchema = new Schema<IAssignmentSubmission>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    submittedAt: { type: Date, default: Date.now },
    content: { type: String, default: '' },
    attachmentUrl: { type: String, default: '' },
    status: { type: String, enum: ['SUBMITTED', 'EVALUATED', 'LATE'], default: 'SUBMITTED' },
    marksObtained: { type: Number },
    feedback: { type: String, default: '' },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicSessionId: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'ClassSection', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    subject: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    instructions: { type: String, required: true },
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, default: 20 },
    attachmentUrl: { type: String, default: '' },
    submissions: [SubmissionSchema],
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
