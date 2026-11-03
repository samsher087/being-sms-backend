import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'PRINCIPAL'
  | 'TEACHER'
  | 'ACCOUNTANT'
  | 'STUDENT'
  | 'PARENT';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  tenantId?: mongoose.Types.ObjectId;
  phone?: string;
  avatar?: string;
  linkedStudentId?: mongoose.Types.ObjectId;
  linkedChildrenIds?: mongoose.Types.ObjectId[];
  linkedTeacherId?: mongoose.Types.ObjectId;
  isActive: boolean;
  lastLogin?: Date;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [
        'SUPER_ADMIN',
        'SCHOOL_ADMIN',
        'PRINCIPAL',
        'TEACHER',
        'ACCOUNTANT',
        'STUDENT',
        'PARENT',
      ],
      required: true,
      index: true,
    },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    linkedStudentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    linkedChildrenIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    linkedTeacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Compound index for uniqueness: email + tenantId (or global if tenantId is null)
UserSchema.index({ email: 1, tenantId: 1 }, { unique: true });

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
