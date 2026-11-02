import mongoose, { Schema, Document } from 'mongoose';

export type ActivityActionType = 
  | 'MEMBER_CREATED' 
  | 'MEMBER_EDITED' 
  | 'MEMBER_BLOCKED' 
  | 'MEMBER_UNBLOCKED' 
  | 'INSTITUTION_UPDATED' 
  | 'BLOOD_REQUEST_REVIEWED' 
  | 'CONTACT_REQUEST_HANDLED' 
  | 'COMPLAINT_REVIEWED'
  | 'PASSWORD_RESET_ASSISTED';

export interface IModeratorActivity extends Document {
  _id: any;
  actorId: any;
  actorName: string;
  actorRole: string;
  action: ActivityActionType;
  targetRecordId: string;
  targetRecordType: string;
  divisionScope?: string;
  institutionScope?: any;
  reason?: string;
  result?: string;
  details?: Record<string, any>;
  createdAt: Date;
}

const ModeratorActivitySchema = new Schema<IModeratorActivity>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    actorId: { type: Schema.Types.Mixed, required: true, index: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    action: { 
      type: String, 
      enum: [
        'MEMBER_CREATED', 
        'MEMBER_EDITED', 
        'MEMBER_BLOCKED', 
        'MEMBER_UNBLOCKED', 
        'INSTITUTION_UPDATED', 
        'BLOOD_REQUEST_REVIEWED', 
        'CONTACT_REQUEST_HANDLED', 
        'COMPLAINT_REVIEWED',
        'PASSWORD_RESET_ASSISTED'
      ],
      required: true,
      index: true
    },
    targetRecordId: { type: String, required: true },
    targetRecordType: { type: String, required: true },
    divisionScope: { type: String, index: true },
    institutionScope: { type: Schema.Types.Mixed, index: true },
    reason: { type: String, trim: true },
    result: { type: String, trim: true },
    details: { type: Schema.Types.Mixed }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

ModeratorActivitySchema.index({ actorId: 1, createdAt: -1 });
ModeratorActivitySchema.index({ institutionScope: 1, createdAt: -1 });
ModeratorActivitySchema.index({ divisionScope: 1, createdAt: -1 });

export const ModeratorActivityModel = mongoose.model<IModeratorActivity>(
  'ModeratorActivity',
  ModeratorActivitySchema
);

