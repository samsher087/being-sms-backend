import mongoose, { Document, Schema } from 'mongoose';

export type AdmissionStatus =
  | 'ENQUIRY'
  | 'UNDER_REVIEW'
  | 'INTERVIEW_SCHEDULED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ENROLLED';

export interface IAdmissionEnquiry extends Document {
  tenantId: mongoose.Types.ObjectId;
  academicSessionId?: mongoose.Types.ObjectId;
  applicationNumber: string; // e.g. ADM-2026-0042
  applicantName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: Date;
  classAppliedFor: string; // e.g. "Class 6", "Class 11 Science"
  parentName: string;
  relationship: string;
  email: string;
  phone: string;
  address: string;
  previousSchool?: string;
  previousPercentage?: number;
  status: AdmissionStatus;
  interviewDate?: Date;
  notes?: string;
  assignedStaffId?: mongoose.Types.ObjectId;
  convertedStudentId?: mongoose.Types.ObjectId;
}

const AdmissionEnquirySchema = new Schema<IAdmissionEnquiry>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicSessionId: { type: Schema.Types.ObjectId, ref: 'AcademicSession' },
    applicationNumber: { type: String, required: true, trim: true },
    applicantName: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    dob: { type: Date, required: true },
    classAppliedFor: { type: String, required: true },
    parentName: { type: String, required: true },
    relationship: { type: String, default: 'Father' },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    address: { type: String, default: '' },
    previousSchool: { type: String, default: '' },
    previousPercentage: { type: Number },
    status: {
      type: String,
      enum: ['ENQUIRY', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'ENROLLED'],
      default: 'ENQUIRY',
      index: true,
    },
    interviewDate: { type: Date },
    notes: { type: String, default: '' },
    assignedStaffId: { type: Schema.Types.ObjectId, ref: 'User' },
    convertedStudentId: { type: Schema.Types.ObjectId, ref: 'Student' },
  },
  { timestamps: true }
);

AdmissionEnquirySchema.index({ tenantId: 1, applicationNumber: 1 }, { unique: true });

export const AdmissionEnquiry = mongoose.model<IAdmissionEnquiry>('AdmissionEnquiry', AdmissionEnquirySchema);
