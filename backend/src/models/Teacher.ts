import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacher extends Document {
  tenantId: mongoose.Types.ObjectId;
  employeeId: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  designation: string; // e.g. "Senior PGT Mathematics", "TGT Science"
  department: string; // e.g. "Mathematics", "Sciences", "Humanities"
  qualification: string; // e.g. "M.Sc. B.Ed"
  joiningDate: Date;
  salaryPaise: number;
  assignedClasses: {
    classId: mongoose.Types.ObjectId;
    subject: string;
  }[];
  avatar: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
}

const TeacherSchema = new Schema<ITeacher>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Female' },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    designation: { type: String, required: true, trim: true },
    department: { type: String, default: 'General' },
    qualification: { type: String, default: 'Graduate B.Ed' },
    joiningDate: { type: Date, default: Date.now },
    salaryPaise: { type: Number, default: 4500000 }, // in paise (e.g. ₹45,000)
    assignedClasses: [
      {
        classId: { type: Schema.Types.ObjectId, ref: 'ClassSection' },
        subject: { type: String, default: '' },
      },
    ],
    avatar: { type: String, default: '' },
    status: {
      type: String,
      enum: ['ACTIVE', 'ON_LEAVE', 'RESIGNED'],
      default: 'ACTIVE',
      index: true,
    },
  },
  { timestamps: true }
);

TeacherSchema.index({ tenantId: 1, employeeId: 1 }, { unique: true });
TeacherSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export const Teacher = mongoose.model<ITeacher>('Teacher', TeacherSchema);
