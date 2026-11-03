import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  author: string;
  isbn: string;
  accessionNumber: string; // unique library call/accession number
  category: string; // e.g. "Science", "Literature", "History"
  publisher?: string;
  publishYear?: number;
  totalCopies: number;
  availableCopies: number;
  rackLocation?: string;
}

const BookSchema = new Schema<IBook>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, default: '' },
    accessionNumber: { type: String, required: true, trim: true },
    category: { type: String, default: 'General' },
    publisher: { type: String, default: '' },
    publishYear: { type: Number },
    totalCopies: { type: Number, default: 1, min: 1 },
    availableCopies: { type: Number, default: 1, min: 0 },
    rackLocation: { type: String, default: '' },
  },
  { timestamps: true }
);

BookSchema.index({ tenantId: 1, accessionNumber: 1 }, { unique: true });

export const Book = mongoose.model<IBook>('Book', BookSchema);

export interface IBookIssue extends Document {
  tenantId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  borrowerType: 'STUDENT' | 'STAFF';
  studentId?: mongoose.Types.ObjectId;
  teacherId?: mongoose.Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE' | 'LOST';
  finePaise: number;
  remarks?: string;
}

const BookIssueSchema = new Schema<IBookIssue>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    borrowerType: { type: String, enum: ['STUDENT', 'STAFF'], default: 'STUDENT' },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    status: {
      type: String,
      enum: ['ISSUED', 'RETURNED', 'OVERDUE', 'LOST'],
      default: 'ISSUED',
      index: true,
    },
    finePaise: { type: Number, default: 0 },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

export const BookIssue = mongoose.model<IBookIssue>('BookIssue', BookIssueSchema);
