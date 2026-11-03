import mongoose, { Document, Schema } from 'mongoose';

export interface IPeriod {
  periodNumber: number;
  startTime: string; // e.g. "08:30"
  endTime: string; // e.g. "09:15"
  subject: string;
  teacherId?: mongoose.Types.ObjectId;
  roomNumber?: string;
  isBreak?: boolean;
}

export interface IDaySchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periods: IPeriod[];
}

export interface ITimetable extends Document {
  tenantId: mongoose.Types.ObjectId;
  academicSessionId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  days: IDaySchedule[];
}

const PeriodSchema = new Schema<IPeriod>(
  {
    periodNumber: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    subject: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    roomNumber: { type: String, default: '' },
    isBreak: { type: Boolean, default: false },
  },
  { _id: false }
);

const DayScheduleSchema = new Schema<IDaySchedule>(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    periods: [PeriodSchema],
  },
  { _id: false }
);

const TimetableSchema = new Schema<ITimetable>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicSessionId: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'ClassSection', required: true, index: true },
    days: [DayScheduleSchema],
  },
  { timestamps: true }
);

TimetableSchema.index({ tenantId: 1, classId: 1 }, { unique: true });

export const Timetable = mongoose.model<ITimetable>('Timetable', TimetableSchema);
