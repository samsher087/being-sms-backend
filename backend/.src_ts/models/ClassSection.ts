import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject {
  _id?: mongoose.Types.ObjectId;
  name: string;
  code: string;
  teacherId?: mongoose.Types.ObjectId;
  maxMarks: number;
  passingMarks: number;
}

export interface IClassSection extends Document {
  tenantId: mongoose.Types.ObjectId;
  academicSessionId: mongoose.Types.ObjectId;
  className: string; // e.g. "Class 10", "Class 9"
  section: string; // e.g. "A", "B"
  roomNumber: string;
  capacity: number;
  classTeacherId?: mongoose.Types.ObjectId;
  subjects: ISubject[];
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    maxMarks: { type: Number, default: 100 },
    passingMarks: { type: Number, default: 33 },
  },
  { _id: true }
);

const ClassSectionSchema = new Schema<IClassSection>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicSessionId: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true, index: true },
    className: { type: String, required: true, trim: true },
    section: { type: String, required: true, uppercase: true, trim: true },
    roomNumber: { type: String, default: '' },
    capacity: { type: Number, default: 40 },
    classTeacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    subjects: [SubjectSchema],
  },
  { timestamps: true }
);

ClassSectionSchema.index({ tenantId: 1, academicSessionId: 1, className: 1, section: 1 }, { unique: true });

export const ClassSection = mongoose.model<IClassSection>('ClassSection', ClassSectionSchema);
