import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN'
  | 'DIVISION_COORDINATOR' 
  | 'INSTITUTION_MODERATOR' 
  | 'MEMBER'
  | 'DONOR' 
  | 'REQUESTER';

export type AccountStatus = 
  | 'active' 
  | 'pending_verification' 
  | 'temporarily_blocked' 
  | 'suspended' 
  | 'deactivated';

export type GenderType = 'male' | 'female' | 'unspecified' | 'other';

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  accountStatus: AccountStatus;
  blockReason?: string;
  blockedBy?: mongoose.Types.ObjectId;
  blockedAt?: Date;
  gender: GenderType;
  femaleSafetyAcknowledged?: boolean;
  femalePublicPhoneConsent?: boolean;
  assignedDivision?: string; // For DIVISION_COORDINATOR (e.g. 'dhaka')
  assignedInstitution?: mongoose.Types.ObjectId; // For INSTITUTION_MODERATOR
  assignedInstitutions?: mongoose.Types.ObjectId[]; // Multiple institutions support
  requirePasswordChangeAtFirstLogin?: boolean;
  createdByModeratorId?: mongoose.Types.ObjectId;
  division?: string;
  district?: string;
  upazila?: string;
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
      enum: ['SUPER_ADMIN', 'ADMIN', 'DIVISION_COORDINATOR', 'INSTITUTION_MODERATOR', 'MEMBER', 'DONOR', 'REQUESTER'],
      default: 'MEMBER',
      required: true,
      index: true
    },
    accountStatus: {
      type: String,
      enum: ['active', 'pending_verification', 'temporarily_blocked', 'suspended', 'deactivated'],
      default: 'active',
      index: true
    },
    blockReason: { type: String, trim: true },
    blockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    blockedAt: { type: Date },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'unspecified', 'other'], 
      default: 'unspecified' 
    },
    femaleSafetyAcknowledged: { type: Boolean, default: false },
    femalePublicPhoneConsent: { type: Boolean, default: false },
    assignedDivision: { type: String, trim: true, index: true },
    assignedInstitution: { type: Schema.Types.ObjectId, ref: 'Institution', index: true },
    assignedInstitutions: [{ type: Schema.Types.ObjectId, ref: 'Institution' }],
    requirePasswordChangeAtFirstLogin: { type: Boolean, default: false },
    createdByModeratorId: { type: Schema.Types.ObjectId, ref: 'User' },
    division: { type: String, trim: true },
    district: { type: String, trim: true },
    upazila: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    isPhoneVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date }
  },
  {
    timestamps: true
  }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
