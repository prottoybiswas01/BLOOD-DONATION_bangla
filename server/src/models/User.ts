import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'DIVISION_COORDINATOR' 
  | 'INSTITUTION_MODERATOR' 
  | 'DONOR' 
  | 'REQUESTER';

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  assignedDivision?: string; // For DIVISION_COORDINATOR (e.g. 'dhaka')
  assignedInstitution?: mongoose.Types.ObjectId; // For INSTITUTION_MODERATOR
  isActive: boolean;
  isPhoneVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      index: true 
    },
    email: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['SUPER_ADMIN', 'DIVISION_COORDINATOR', 'INSTITUTION_MODERATOR', 'DONOR', 'REQUESTER'],
      default: 'DONOR',
      required: true,
      index: true
    },
    assignedDivision: { type: String, trim: true },
    assignedInstitution: { type: Schema.Types.ObjectId, ref: 'Institution' },
    isActive: { type: Boolean, default: true, index: true },
    isPhoneVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date }
  },
  {
    timestamps: true
  }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);

