import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  _id: any;
  actorId: any;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string;
  divisionScope?: string;
  institutionScope?: any;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    _id: { type: String },
    actorId: { 
      type: Schema.Types.Mixed, 
      required: true,
      index: true 
    },
    actorRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, required: true, index: true },
    targetId: { type: String },
    divisionScope: { type: String, index: true },
    institutionScope: { type: Schema.Types.Mixed, index: true },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

