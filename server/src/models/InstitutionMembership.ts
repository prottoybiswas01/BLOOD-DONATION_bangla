import mongoose, { Schema, Document } from 'mongoose';

export interface IInstitutionMembership extends Document {
  institutionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  studentOrStaffId?: string;
  department?: string;
  isVerified: boolean;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionMembershipSchema = new Schema<IInstitutionMembership>(
  {
    institutionId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Institution', 
      required: true,
      index: true 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    studentOrStaffId: { type: String, trim: true },
    department: { type: String, trim: true },
    isVerified: { type: Boolean, default: false, index: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

InstitutionMembershipSchema.index({ institutionId: 1, userId: 1 }, { unique: true });

export const InstitutionMembershipModel = mongoose.model<IInstitutionMembership>(
  'InstitutionMembership', 
  InstitutionMembershipSchema
);

