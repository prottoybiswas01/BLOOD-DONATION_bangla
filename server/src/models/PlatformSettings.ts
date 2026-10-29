import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSettings extends Document {
  key: string;
  value: any;
  description: string;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true
  }
);

export const PlatformSettingsModel = mongoose.model<IPlatformSettings>(
  'PlatformSettings', 
  PlatformSettingsSchema
);
