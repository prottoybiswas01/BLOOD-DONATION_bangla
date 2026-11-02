import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN'
  | 'DIVISION_COORDINATOR' 
  | 'INSTITUTION_HEAD'
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
  _id: any;
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  accountStatus: AccountStatus;
  blockReason?: string;
  blockedBy?: any;
  blockedAt?: Date;
  gender: GenderType;
  femaleSafetyAcknowledged?: boolean;
  femalePublicPhoneConsent?: boolean;
  assignedDivision?: string; // For DIVISION_COORDINATOR (e.g. 'dhaka')
  assignedInstitution?: any; // For INSTITUTION_MODERATOR
  assignedInstitutions?: any[]; // Multiple institutions support
  requirePasswordChangeAtFirstLogin?: boolean;
  createdByModeratorId?: any;
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
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
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
    blockedBy: { type: Schema.Types.Mixed },
    blockedAt: { type: Date },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'unspecified', 'other'], 
      default: 'unspecified' 
    },
    femaleSafetyAcknowledged: { type: Boolean, default: false },
    femalePublicPhoneConsent: { type: Boolean, default: false },
    assignedDivision: { type: String, trim: true, index: true },
    assignedInstitution: { type: Schema.Types.Mixed, index: true },
    assignedInstitutions: [{ type: Schema.Types.Mixed }],
    requirePasswordChangeAtFirstLogin: { type: Boolean, default: false },
    createdByModeratorId: { type: Schema.Types.Mixed },
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
