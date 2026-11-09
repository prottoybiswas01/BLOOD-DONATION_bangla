import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const MONGO_URI = process.env.MONGO_URI || '';

export interface DryRunSummary {
  collections: {
    name: string;
    totalDocuments: number;
    confirmedDemoCount: number;
    preservedCount: number;
    note: string;
  }[];
  timestamp: string;
}

export async function runDemoDataAudit(isApply: boolean = false): Promise<DryRunSummary> {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is missing in environment variables.');
  }

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed.');
  }

  // 1. Identify Demo Users vs Protected Accounts
  const usersColl = db.collection('users');
  const allUsers = await usersColl.find({}).toArray();

  const protectedUserIds = new Set(['usr_superadmin', 'usr_admin']);
  const demoUserIdsToDelete: string[] = [];
  const preservedUserIds: string[] = [];

  for (const u of allUsers) {
    const id = String(u._id);
    const role = u.role;
    // Always preserve super admin & platform admin
    if (protectedUserIds.has(id) || role === 'SUPER_ADMIN' || role === 'ADMIN') {
      preservedUserIds.push(id);
      continue;
    }

    // Identify confirmed demo/test fixtures
    const isDemoId = id.startsWith('usr_donor_') ||
                     id.startsWith('usr_requester_') ||
                     id.startsWith('usr_blocked_demo') ||
                     id.startsWith('usr_sync_') ||
                     id.startsWith('usr_head_') ||
                     id.startsWith('usr_target_') ||
                     id.startsWith('usr_req_') ||
                     id.startsWith('usr_test_') ||
                     id === 'usr_coordinator_dhaka' ||
                     id === 'usr_coordinator_ctg' ||
                     id === 'usr_moderator_du' ||
                     id === 'usr_head';

    const isTestEmail = typeof u.email === 'string' && (u.email.endsWith('@example.com') || u.email.endsWith('@bloodbd.org'));

    if (isDemoId || isTestEmail) {
      demoUserIdsToDelete.push(id);
    } else {
      // Unclear or organic account -> PRESERVE
      preservedUserIds.push(id);
    }
  }

  const demoUserSet = new Set(demoUserIdsToDelete);

  // 2. Identify Demo Donor Profiles
  const donorColl = db.collection('donorprofiles');
  const allDonors = await donorColl.find({}).toArray();
  const demoDonorIdsToDelete: string[] = [];
  const preservedDonorIds: string[] = [];

  for (const d of allDonors) {
    const id = String(d._id);
    const userId = String(d.userId);
    if (id.startsWith('donor_prof_') || demoUserSet.has(userId)) {
      demoDonorIdsToDelete.push(id);
    } else {
      preservedDonorIds.push(id);
    }
  }

  // 3. Identify Demo Blood Requests
  const reqColl = db.collection('bloodrequests');
  const allRequests = await reqColl.find({}).toArray();
  const demoReqIdsToDelete: string[] = [];
  const preservedReqIds: string[] = [];

  for (const r of allRequests) {
    const id = String(r._id);
    const requesterId = String(r.requesterId);
    if (id.startsWith('req_') || id.startsWith('BR-2026-') || demoUserSet.has(requesterId)) {
      demoReqIdsToDelete.push(id);
    } else {
      preservedReqIds.push(id);
    }
  }

  // 4. Secondary collections
  const instReqColl = db.collection('institutionrequests');
  const allInstReqs = await instReqColl.find({}).toArray();
  const demoInstReqIds = allInstReqs
    .filter(i => String(i._id).startsWith('ir_') || demoUserSet.has(String(i.applicantPhone)))
    .map(i => String(i._id));

  const contactReqColl = db.collection('contactrequests');
  const allContactReqs = await contactReqColl.find({}).toArray();
  const demoContactReqIds = allContactReqs
    .filter(c => String(c._id).startsWith('cr_') || demoUserSet.has(String(c.requesterId)))
    .map(c => String(c._id));

  const phoneChangeColl = db.collection('phonechangerequests');
  const allPhoneChanges = await phoneChangeColl.find({}).toArray();
  const demoPhoneChangeIds = allPhoneChanges
    .filter(p => String(p._id).startsWith('pcr_') || demoUserSet.has(String(p.userId)))
    .map(p => String(p._id));

  const notifColl = db.collection('notifications');
  const allNotifs = await notifColl.find({}).toArray();
  const demoNotifIds = allNotifs
    .filter(n => demoUserSet.has(String(n.userId)))
    .map(n => String(n._id));

  const accessLogColl = db.collection('contactaccesslogs');
  const allAccessLogs = await accessLogColl.find({}).toArray();
  const demoAccessLogIds = allAccessLogs
    .filter(a => demoUserSet.has(String(a.viewerId)) || demoUserSet.has(String(a.donorUserId)))
    .map(a => String(a._id));

  const modActivityColl = db.collection('moderatoractivities');
  const allModActivities = await modActivityColl.find({}).toArray();
  const demoModActivityIds = allModActivities
    .filter(m => demoUserSet.has(String(m.actorId)) || demoUserSet.has(String(m.targetRecordId)))
    .map(m => String(m._id));

  const statusHistColl = db.collection('accountstatushistories');
  const allStatusHist = await statusHistColl.find({}).toArray();
  const demoStatusHistIds = allStatusHist
    .filter(s => demoUserSet.has(String(s.userId)) || demoUserSet.has(String(s.actorId)))
    .map(s => String(s._id));

  // Institutions: Preserve all verified registered partner institutions
  const instColl = db.collection('institutions');
  const totalInsts = await instColl.countDocuments();

  const summary: DryRunSummary = {
    timestamp: new Date().toISOString(),
    collections: [
      {
        name: 'users',
        totalDocuments: allUsers.length,
        confirmedDemoCount: demoUserIdsToDelete.length,
        preservedCount: preservedUserIds.length,
        note: 'Preserves usr_superadmin, usr_admin & organic users; purges demo fixtures.'
      },
      {
        name: 'donorprofiles',
        totalDocuments: allDonors.length,
        confirmedDemoCount: demoDonorIdsToDelete.length,
        preservedCount: preservedDonorIds.length,
        note: 'Purges demo fixtures donor_prof_*; preserves organic donor registrations.'
      },
      {
        name: 'bloodrequests',
        totalDocuments: allRequests.length,
        confirmedDemoCount: demoReqIdsToDelete.length,
        preservedCount: preservedReqIds.length,
        note: 'Purges demo fixtures req_* / BR-2026-*; preserves organic blood requests.'
      },
      {
        name: 'institutionrequests',
        totalDocuments: allInstReqs.length,
        confirmedDemoCount: demoInstReqIds.length,
        preservedCount: allInstReqs.length - demoInstReqIds.length,
        note: 'Purges demo request fixtures ir_1, ir_2.'
      },
      {
        name: 'contactrequests',
        totalDocuments: allContactReqs.length,
        confirmedDemoCount: demoContactReqIds.length,
        preservedCount: allContactReqs.length - demoContactReqIds.length,
        note: 'Purges demo contact requests cr_1.'
      },
      {
        name: 'phonechangerequests',
        totalDocuments: allPhoneChanges.length,
        confirmedDemoCount: demoPhoneChangeIds.length,
        preservedCount: allPhoneChanges.length - demoPhoneChangeIds.length,
        note: 'Purges test phone change requests pcr_1.'
      },
      {
        name: 'notifications',
        totalDocuments: allNotifs.length,
        confirmedDemoCount: demoNotifIds.length,
        preservedCount: allNotifs.length - demoNotifIds.length,
        note: 'Purges notifications attached to demo users.'
      },
      {
        name: 'contactaccesslogs',
        totalDocuments: allAccessLogs.length,
        confirmedDemoCount: demoAccessLogIds.length,
        preservedCount: allAccessLogs.length - demoAccessLogIds.length,
        note: 'Purges contact access logs for demo users.'
      },
      {
        name: 'moderatoractivities',
        totalDocuments: allModActivities.length,
        confirmedDemoCount: demoModActivityIds.length,
        preservedCount: allModActivities.length - demoModActivityIds.length,
        note: 'Purges audit activity of demo users.'
      },
      {
        name: 'accountstatushistories',
        totalDocuments: allStatusHist.length,
        confirmedDemoCount: demoStatusHistIds.length,
        preservedCount: allStatusHist.length - demoStatusHistIds.length,
        note: 'Purges status histories of demo users.'
      },
      {
        name: 'institutions',
        totalDocuments: totalInsts,
        confirmedDemoCount: 0,
        preservedCount: totalInsts,
        note: 'Preserved in full (verified educational institutions directory: DU, BUET, CMC, RU, KUET).'
      }
    ]
  };

  if (!isApply) {
    console.log('=== DRY-RUN DEMO DATA AUDIT REPORT ===');
    console.log(`Executed At: ${summary.timestamp}`);
    console.log(`Environment: MongoDB Atlas Live Cluster`);
    console.log('Note: NO records were modified or deleted. No PII is included in this report.\n');
    console.table(summary.collections.map(c => ({
      Collection: c.name,
      Total: c.totalDocuments,
      DemoToDelete: c.confirmedDemoCount,
      Preserved: c.preservedCount,
      Note: c.note
    })));
    return summary;
  }

  // --- APPLY MODE: BACKUP FIRST, THEN SELECTIVELY DELETE ---
  console.log('\n[BACKUP] Creating pre-cleanup snapshot backup...');
  const backupData = {
    createdAt: new Date().toISOString(),
    demoUsers: allUsers.filter(u => demoUserSet.has(String(u._id))),
    demoDonors: allDonors.filter(d => demoDonorIdsToDelete.includes(String(d._id))),
    demoRequests: allRequests.filter(r => demoReqIdsToDelete.includes(String(r._id))),
    demoInstReqs: allInstReqs.filter(i => demoInstReqIds.includes(String(i._id))),
    demoContactReqs: allContactReqs.filter(c => demoContactReqIds.includes(String(c._id))),
    demoPhoneChanges: allPhoneChanges.filter(p => demoPhoneChangeIds.includes(String(p._id))),
    demoNotifs: allNotifs.filter(n => demoNotifIds.includes(String(n._id))),
    demoAccessLogs: allAccessLogs.filter(a => demoAccessLogIds.includes(String(a._id))),
    demoModActivities: allModActivities.filter(m => demoModActivityIds.includes(String(m._id))),
    demoStatusHist: allStatusHist.filter(s => demoStatusHistIds.includes(String(s._id)))
  };

  const backupDir = path.resolve(process.cwd(), 'server/backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(backupDir, `mongodb_pre_launch_backup_${timestampStr}.json`);
  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`[BACKUP SUCCESS] Backup written to: ${backupFilePath}`);

  console.log('\n[CLEANUP] Selectively purging confirmed demo fixtures...');

  if (demoUserIdsToDelete.length > 0) {
    const res = await usersColl.deleteMany({ _id: { $in: demoUserIdsToDelete as any } });
    console.log(`- users: deleted ${res.deletedCount} demo records.`);
  }

  if (demoDonorIdsToDelete.length > 0) {
    const res = await donorColl.deleteMany({ _id: { $in: demoDonorIdsToDelete as any } });
    console.log(`- donorprofiles: deleted ${res.deletedCount} demo records.`);
  }

  if (demoReqIdsToDelete.length > 0) {
    const res = await reqColl.deleteMany({ _id: { $in: demoReqIdsToDelete as any } });
    console.log(`- bloodrequests: deleted ${res.deletedCount} demo records.`);
  }

  if (demoInstReqIds.length > 0) {
    const res = await instReqColl.deleteMany({ _id: { $in: demoInstReqIds as any } });
    console.log(`- institutionrequests: deleted ${res.deletedCount} demo records.`);
  }

  if (demoContactReqIds.length > 0) {
    const res = await contactReqColl.deleteMany({ _id: { $in: demoContactReqIds as any } });
    console.log(`- contactrequests: deleted ${res.deletedCount} demo records.`);
  }

  if (demoPhoneChangeIds.length > 0) {
    const res = await phoneChangeColl.deleteMany({ _id: { $in: demoPhoneChangeIds as any } });
    console.log(`- phonechangerequests: deleted ${res.deletedCount} demo records.`);
  }

  if (demoNotifIds.length > 0) {
    const res = await notifColl.deleteMany({ _id: { $in: demoNotifIds as any } });
    console.log(`- notifications: deleted ${res.deletedCount} demo records.`);
  }

  if (demoAccessLogIds.length > 0) {
    const res = await accessLogColl.deleteMany({ _id: { $in: demoAccessLogIds as any } });
    console.log(`- contactaccesslogs: deleted ${res.deletedCount} demo records.`);
  }

  if (demoModActivityIds.length > 0) {
    const res = await modActivityColl.deleteMany({ _id: { $in: demoModActivityIds as any } });
    console.log(`- moderatoractivities: deleted ${res.deletedCount} demo records.`);
  }

  if (demoStatusHistIds.length > 0) {
    const res = await statusHistColl.deleteMany({ _id: { $in: demoStatusHistIds as any } });
    console.log(`- accountstatushistories: deleted ${res.deletedCount} demo records.`);
  }

  console.log('\n[CLEANUP COMPLETED] Protected accounts (usr_superadmin, usr_admin) and institutions are preserved.');
  return summary;
}

if (process.argv[1] && process.argv[1].endsWith('cleanDemoData.ts')) {
  const isApply = process.argv.includes('--apply');
  runDemoDataAudit(isApply)
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Audit Error:', err);
      await mongoose.disconnect();
      process.exit(1);
    });
}
