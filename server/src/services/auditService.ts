import { AuditLogModel } from '../models/AuditLog.js';
import { isDatabaseConnected } from '../config/db.js';

export interface AuditParams {
  actorId: any;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string;
  divisionScope?: string;
  institutionScope?: any;
  details?: Record<string, any>;
  ipAddress?: string;
}

export const inMemoryAuditLogs: any[] = [];

export async function logAuditEvent(params: AuditParams): Promise<void> {
  try {
    const logId = 'audit_' + Date.now() + Math.random().toString(36).substring(2, 6);
    const entry = {
      _id: logId,
      ...params,
      createdAt: new Date()
    };

    inMemoryAuditLogs.unshift(entry);
    if (inMemoryAuditLogs.length > 500) {
      inMemoryAuditLogs.pop();
    }

    if (isDatabaseConnected()) {
      await AuditLogModel.create(entry);
    }
  } catch (error) {
    console.error('[AuditLog Error] Failed to write audit log:', error);
  }
}

