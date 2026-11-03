import mongoose, { Document, Schema } from 'mongoose';

export interface IExamSubject {
  subjectName: string;
  subjectCode: string;
  examDate: Date;
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "12:00 PM"
  maxMarks: number;
  passingMarks: number;
}

export interface IExamSchedule extends Document {
  tenantId: mongoose.Types.ObjectId;
  academicSessionId: mongoose.Types.ObjectId;
  name: string; // e.g. "Term 1 Periodic Assessment", "Half Yearly Examination", "Annual Board Exam"
  examType: 'UNIT_TEST' | 'TERM_1' | 'TERM_2' | 'FINAL' | 'PRACTICAL';
  classIds: mongoose.Types.ObjectId[];
  subjects: IExamSubject[];
  startDate: Date;
  endDate: Date;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'RESULTS_PUBLISHED';
}

const ExamSubjectSchema = new Schema<IExamSubject>(
  {
    subjectName: { type: String, required: true },
    subjectCode: { type: String, required: true },
    examDate: { type: Date, required: true },
    startTime: { type: String, default: '09:00 AM' },
    endTime: { type: String, default: '12:00 PM' },
    maxMarks: { type: Number, default: 100 },
    passingMarks: { type: Number, default: 33 },
  },
  { _id: false }
);

const ExamScheduleSchema = new Schema<IExamSchedule>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicSessionId: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true, index: true },
    name: { type: String, required: true, trim: true },
    examType: {
      type: String,
      enum: ['UNIT_TEST', 'TERM_1', 'TERM_2', 'FINAL', 'PRACTICAL'],
      default: 'TERM_1',
    },
    classIds: [{ type: Schema.Types.ObjectId, ref: 'ClassSection' }],
    subjects: [ExamSubjectSchema],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'RESULTS_PUBLISHED'],
      default: 'UPCOMING',
    },
  },
  { timestamps: true }
);

export const ExamSchedule = mongoose.model<IExamSchedule>('ExamSchedule', ExamScheduleSchema);

export interface ISubjectMark {
  subjectName: string;
  subjectCode: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks?: string;
}

export interface IExamResult extends Document {
  tenantId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectMarks: ISubjectMark[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  overallGrade: string;
  resultStatus: 'PASS' | 'FAIL' | 'COMPARTMENT';
  teacherRemarks?: string;
}

const SubjectMarkSchema = new Schema<ISubjectMark>(
  {
    subjectName: { type: String, required: true },
    subjectCode: { type: String, required: true },
    marksObtained: { type: Number, required: true, min: 0 },
    maxMarks: { type: Number, required: true, default: 100 },
    grade: { type: String, default: 'B' },
    remarks: { type: String, default: '' },
  },
  { _id: false }
);

const ExamResultSchema = new Schema<IExamResult>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    examId: { type: Schema.Types.ObjectId, ref: 'ExamSchedule', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'ClassSection', required: true, index: true },
    subjectMarks: [SubjectMarkSchema],
    totalObtained: { type: Number, required: true },
    totalMax: { type: Number, required: true },
    percentage: { type: Number, required: true },
    overallGrade: { type: String, default: 'B' },
    resultStatus: { type: String, enum: ['PASS', 'FAIL', 'COMPARTMENT'], default: 'PASS' },
    teacherRemarks: { type: String, default: 'Good performance. Keep it up!' },
  },
  { timestamps: true }
);

ExamResultSchema.index({ tenantId: 1, examId: 1, studentId: 1 }, { unique: true });

export const ExamResult = mongoose.model<IExamResult>('ExamResult', ExamResultSchema);
