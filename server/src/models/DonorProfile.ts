import mongoose, { Schema, Document } from 'mongoose';
import { BloodGroup, BLOOD_GROUPS } from '../data/bangladeshLocations.js';

export type AvailabilityStatus = 'available' | 'recently_donated' | 'temporarily_unavailable';

export interface IDonorProfile extends Document {
  _id: any;
  userId: any;
  displayName: string;
  bloodGroup: BloodGroup;
  division: string;
  district: string;
  upazila: string;
  addressDetails?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'unspecified';
  availabilityStatus: AvailabilityStatus;
  lastDonationDate?: Date;
  totalDonations: number;
  institutionId?: any;
  institutionMembershipVerified: boolean;
  consentToShareContact: boolean;
  preferredContactMethod: 'phone' | 'sms' | 'platform';
  bio?: string;
  isPubliclyListed: boolean;
  emergencyAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DonorProfileSchema = new Schema<IDonorProfile>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    userId: { 
      type: Schema.Types.Mixed, 
      required: true, 
      unique: true,
      index: true 
    },
    displayName: { type: String, required: true, trim: true },
    bloodGroup: { 
      type: String, 
      enum: BLOOD_GROUPS, 
      required: true, 
      index: true 
    },
    division: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    upazila: { type: String, required: true, index: true },
    addressDetails: { type: String, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'other', 'unspecified'], 
      default: 'unspecified' 
    },
    availabilityStatus: { 
      type: String, 
      enum: ['available', 'recently_donated', 'temporarily_unavailable'], 
      default: 'available',
      index: true 
    },
    lastDonationDate: { type: Date },
    totalDonations: { type: Number, default: 0 },
    institutionId: { type: Schema.Types.Mixed, index: true },
    institutionMembershipVerified: { type: Boolean, default: false },
    consentToShareContact: { type: Boolean, default: true },
    preferredContactMethod: { 
      type: String, 
      enum: ['phone', 'sms', 'platform'], 
      default: 'phone' 
    },
    bio: { type: String, trim: true, maxlength: 500 },
    isPubliclyListed: { type: Boolean, default: true, index: true },
    emergencyAvailable: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

// Compound indexes for high-speed location + blood group searches
DonorProfileSchema.index({ isPubliclyListed: 1, availabilityStatus: 1, bloodGroup: 1, division: 1, district: 1 });
DonorProfileSchema.index({ isPubliclyListed: 1, district: 1 });
DonorProfileSchema.index({ bloodGroup: 1, division: 1, district: 1, availabilityStatus: 1 });
DonorProfileSchema.index({ division: 1, district: 1, upazila: 1 });

export const DonorProfileModel = mongoose.model<IDonorProfile>('DonorProfile', DonorProfileSchema);

