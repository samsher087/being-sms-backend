import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  tenantId: mongoose.Types.ObjectId;
  academicSessionId: mongoose.Types.ObjectId;
  admissionNumber: string;
  rollNumber: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: Date;
  bloodGroup?: string;
  email?: string;
  phone?: string;
  classId: mongoose.Types.ObjectId;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  parents: {
    fatherName: string;
    fatherPhone: string;
    fatherOccupation?: string;
    motherName: string;
    motherPhone: string;
    motherOccupation?: string;
    guardianName?: string;
    guardianPhone?: string;
    emergencyContact: string;
  };
  photo: string;
  admissionDate: Date;
  status: 'ACTIVE' | 'TRANSFERRED' | 'GRADUATED' | 'INACTIVE';
  previousSchool?: string;
  concessionPercent?: number; // approved fee discount %
}

const StudentSchema = new Schema<IStudent>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicSessionId: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true, index: true },
    admissionNumber: { type: String, required: true, trim: true },
    rollNumber: { type: String, default: '' },
    name: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    dob: { type: Date, required: true },
    bloodGroup: { type: String, default: 'B+' },
    email: { type: String, lowercase: true, trim: true, default: '' },
    phone: { type: String, default: '' },
    classId: { type: Schema.Types.ObjectId, ref: 'ClassSection', required: true, index: true },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: 'Delhi' },
      pincode: { type: String, default: '' },
    },
    parents: {
      fatherName: { type: String, default: '' },
      fatherPhone: { type: String, default: '' },
      fatherOccupation: { type: String, default: '' },
      motherName: { type: String, default: '' },
      motherPhone: { type: String, default: '' },
      motherOccupation: { type: String, default: '' },
      guardianName: { type: String, default: '' },
      guardianPhone: { type: String, default: '' },
      emergencyContact: { type: String, default: '' },
    },
    photo: { type: String, default: '' },
    admissionDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['ACTIVE', 'TRANSFERRED', 'GRADUATED', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
    previousSchool: { type: String, default: '' },
    concessionPercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

StudentSchema.index({ tenantId: 1, admissionNumber: 1 }, { unique: true });
StudentSchema.index({ tenantId: 1, classId: 1, rollNumber: 1 });

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
