import mongoose, { Schema, Document } from 'mongoose';

export type InstitutionType = 
  | 'university' 
  | 'college' 
  | 'school' 
  | 'medical_college' 
  | 'polytechnic' 
  | 'other';

export type InstitutionStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface IInstitution extends Document {
  name: string;
  nameBn: string;
  code: string;
  type: InstitutionType;
  division: string;
  district: string;
  upazila: string;
  address: string;
  website?: string;
  email?: string;
  phone?: string;
  status: InstitutionStatus;
  assignedModeratorId?: mongoose.Types.ObjectId;
  totalRegisteredDonors: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionSchema = new Schema<IInstitution>(
  {
    name: { type: String, required: true, trim: true },
    nameBn: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { 
      type: String, 
      enum: ['university', 'college', 'school', 'medical_college', 'polytechnic', 'other'],
      default: 'university'
    },
    division: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    upazila: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'suspended'], 
      default: 'pending',
      index: true 
    },
    assignedModeratorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    totalRegisteredDonors: { type: Number, default: 0 },
    description: { type: String, trim: true }
  },
  {
    timestamps: true
  }
);

export const InstitutionModel = mongoose.model<IInstitution>('Institution', InstitutionSchema);
