import mongoose, { Document, Schema } from 'mongoose';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface IAttendanceRecord {
  studentId: mongoose.Types.ObjectId;
  status: AttendanceStatus;
  remarks?: string;
}

export interface IAttendance extends Document {
  tenantId: mongoose.Types.ObjectId;
  academicSessionId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  records: IAttendanceRecord[];
  markedBy: mongoose.Types.ObjectId;
  type: 'STUDENT' | 'STAFF';
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
      default: 'PRESENT',
    },
    remarks: { type: String, default: '' },
  },
  { _id: false }
);

const AttendanceSchema = new Schema<IAttendance>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicSessionId: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'ClassSection', required: true, index: true },
    date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
    records: [AttendanceRecordSchema],
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['STUDENT', 'STAFF'], default: 'STUDENT' },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for the same class and date
AttendanceSchema.index({ tenantId: 1, classId: 1, date: 1, type: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
