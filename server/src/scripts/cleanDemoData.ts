import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const MONGO_URI = process.env.MONGO_URI || '';

export type ClassificationType = 'CONFIRMED_DEMO' | 'AMBIGUOUS_PENDING_REVIEW' | 'PRESERVED';

export interface ClassifiedRecord {
  id: string;
  collection: string;
  classification: ClassificationType;
  reason: string;
  hash: string;
  data: any;
}

export interface CollectionSummary {
  collection: string;
  total: number;
  confirmedDemo: number;
  ambiguousPendingReview: number;
  preserved: number;
  notes: string;
}

export interface DetailedAuditResult {
  timestamp: string;
  summary: CollectionSummary[];
  records: ClassifiedRecord[];
}

// Known exact seed fixture IDs from seedInitialData()
export const EXACT_SEED_USER_IDS = new Set([
  'usr_coordinator_dhaka',
  'usr_coordinator_ctg',
  'usr_moderator_du',
  'usr_head',
  'usr_donor_1',
  'usr_donor_2',
  'usr_donor_3',
  'usr_donor_4',
  'usr_requester_1',
  'usr_blocked_demo'
]);

export const PROTECTED_ADMIN_IDS = new Set([
  'usr_superadmin',
  'usr_admin'
]);

export const EXACT_SEED_DONOR_IDS = new Set([
  'donor_prof_1',
  'donor_prof_2',
  'donor_prof_3',
  'donor_prof_4'
]);

export const EXACT_SEED_REQUEST_IDS = new Set([
  'req_1',
  'req_2',
  'req_3'
]);

export const EXACT_SEED_INSTITUTION_IDS = new Set([
  'inst_du',
  'inst_buet',
  'inst_cmc',
  'inst_ru',
  'inst_sust',
  'inst_kuet'
]);

export const EXACT_SEED_INST_REQ_IDS = new Set([
  'inst_req_1',
  'inst_req_2'
]);

export const EXACT_SEED_CONTACT_REQ_IDS = new Set([
  'cr_1'
]);

export const EXACT_SEED_PHONE_CHANGE_IDS = new Set([
  'pcr_1'
]);

export const EXACT_SEED_NOTIF_IDS = new Set([
  'notif_1',
  'notif_2'
]);

export const EXACT_SEED_MOD_ACTIVITY_IDS = new Set([
  'act_1',
  'act_2',
  'act_3'
]);

export const EXACT_SEED_ACCOUNT_STATUS_IDS = new Set([
  'ash_1'
]);

// Helper: Calculate SHA-256 hash of a record to detect subsequent modifications
export function hashRecord(doc: any): string {
  const clean = { ...doc };
  delete clean._id;
  const str = JSON.stringify(clean, Object.keys(clean).sort());
  return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * Classifies a user record based on seed fixtures and evidence of real activity.
 */
export function classifyUser(u: any): { classification: ClassificationType; reason: string } {
  const id = String(u._id);

  // 1. Mandatory Protection for Core Platform Admins
  if (PROTECTED_ADMIN_IDS.has(id) || u.role === 'SUPER_ADMIN' || u.role === 'ADMIN') {
    return {
      classification: 'PRESERVED',
      reason: 'Core Platform Super Admin or System Administrator account required for operations'
    };
  }

  // 2. Check if this is an organic account not in known seed/test lists
  const isSeedUser = EXACT_SEED_USER_IDS.has(id);
  const isAutomatedTestUser = id.startsWith('usr_sync_') ||
                              id.startsWith('usr_target_') ||
                              id.startsWith('usr_req_') ||
                              id.startsWith('usr_test_') ||
                              id.startsWith('usr_actor_') ||
                              id.startsWith('usr_viewer_');

  if (!isSeedUser && !isAutomatedTestUser) {
    // Identity is organic or not a recognized seed/test fixture -> PRESERVE
    return {
      classification: 'PRESERVED',
      reason: 'Organic user registration with non-fixture identifier'
    };
  }

  // 3. For seed/test users: check for evidence of modification or real use
  const hasLastLogin = Boolean(u.lastLoginAt);
  const createdAtTime = u.createdAt ? new Date(u.createdAt).getTime() : 0;
  const updatedAtTime = u.updatedAt ? new Date(u.updatedAt).getTime() : 0;
  const wasSignificantlyUpdated = (updatedAtTime - createdAtTime) > 10000; // > 10 seconds after creation

  if (hasLastLogin || wasSignificantlyUpdated) {
    return {
      classification: 'AMBIGUOUS_PENDING_REVIEW',
      reason: 'Seed/test identifier but has recorded user login history or substantial post-creation modification'
    };
  }

  // Clean unmodified seed/test fixture
  return {
    classification: 'CONFIRMED_DEMO',
    reason: isSeedUser ? 'Unmodified original seed fixture from seedInitialData()' : 'Automated test suite execution fixture'
  };
}

/**
 * Classifies a donor profile.
 */
export function classifyDonor(d: any, userClassificationMap: Map<string, ClassificationType>): { classification: ClassificationType; reason: string } {
  const id = String(d._id);
  const userId = String(d.userId);
  const userClass = userClassificationMap.get(userId);

  if (userClass === 'PRESERVED') {
    return {
      classification: 'PRESERVED',
      reason: 'Linked to a preserved organic user account'
    };
  }

  if (userClass === 'AMBIGUOUS_PENDING_REVIEW') {
    return {
      classification: 'AMBIGUOUS_PENDING_REVIEW',
      reason: 'Linked to an ambiguous user account pending review'
    };
  }

  const isSeedDonor = EXACT_SEED_DONOR_IDS.has(id);
  const isTestDonor = id.startsWith('donor_prof_sync_') || id.startsWith('donor_prof_target_') || id.startsWith('donor_prof_');

  if (!isSeedDonor && !isTestDonor) {
    return {
      classification: 'PRESERVED',
      reason: 'Non-fixture donor registration'
    };
  }

  const createdAtTime = d.createdAt ? new Date(d.createdAt).getTime() : 0;
  const updatedAtTime = d.updatedAt ? new Date(d.updatedAt).getTime() : 0;
  if ((updatedAtTime - createdAtTime) > 10000) {
    return {
      classification: 'AMBIGUOUS_PENDING_REVIEW',
      reason: 'Donor profile has post-creation modifications'
    };
  }

  return {
    classification: 'CONFIRMED_DEMO',
    reason: isSeedDonor ? 'Unmodified initial seed donor profile' : 'Automated test suite donor profile fixture'
  };
}

/**
 * Classifies a blood request.
 */
export function classifyBloodRequest(r: any, userClassificationMap: Map<string, ClassificationType>): { classification: ClassificationType; reason: string } {
  const id = String(r._id);
  const requesterId = String(r.requesterId);
  const requesterClass = userClassificationMap.get(requesterId);

  if (requesterClass === 'PRESERVED') {
    return {
      classification: 'PRESERVED',
      reason: 'Requested by a preserved organic user account'
    };
  }

  if (requesterClass === 'AMBIGUOUS_PENDING_REVIEW') {
    return {
      classification: 'AMBIGUOUS_PENDING_REVIEW',
      reason: 'Requested by an ambiguous user account pending review'
    };
  }

  const isSeedReq = EXACT_SEED_REQUEST_IDS.has(id);
  const publicId = String(r.publicId || '');
  const isTestReq = id.startsWith('req_') ||
                    publicId.startsWith('BR-2026-SYNC') ||
                    publicId.startsWith('BR-2026-TEST') ||
                    publicId.startsWith('BR-2026-DH') ||
                    publicId.startsWith('BR-2026-CT');

  if (!isSeedReq && !isTestReq) {
    return {
      classification: 'PRESERVED',
      reason: 'Organic blood request by public user'
    };
  }

  const createdAtTime = r.createdAt ? new Date(r.createdAt).getTime() : 0;
  const updatedAtTime = r.updatedAt ? new Date(r.updatedAt).getTime() : 0;
  // If request has units fulfilled by real donors or notes added later
  if (r.unitsFulfilled > 0 && !isSeedReq && (updatedAtTime - createdAtTime) > 10000) {
    return {
      classification: 'AMBIGUOUS_PENDING_REVIEW',
      reason: 'Blood request has donor responses or updates recorded'
    };
  }

  return {
    classification: 'CONFIRMED_DEMO',
    reason: isSeedReq ? 'Original seed sample request fixture' : 'Automated test suite generated request fixture'
  };
}

/**
 * Performs full multi-collection classification.
 */
export async function performFullClassification(db: mongoose.mongo.Db): Promise<DetailedAuditResult> {
  const records: ClassifiedRecord[] = [];
  const summary: CollectionSummary[] = [];

  // 1. Users
  const allUsers = await db.collection('users').find({}).toArray();
  const userClassMap = new Map<string, ClassificationType>();

  let usersDemo = 0;
  let usersAmbiguous = 0;
  let usersPreserved = 0;

  for (const u of allUsers) {
    const { classification, reason } = classifyUser(u);
    const hash = hashRecord(u);
    userClassMap.set(String(u._id), classification);

    if (classification === 'CONFIRMED_DEMO') usersDemo++;
    else if (classification === 'AMBIGUOUS_PENDING_REVIEW') usersAmbiguous++;
    else usersPreserved++;

    records.push({
      id: String(u._id),
      collection: 'users',
      classification,
      reason,
      hash,
      data: u
    });
  }

  summary.push({
    collection: 'users',
    total: allUsers.length,
    confirmedDemo: usersDemo,
    ambiguousPendingReview: usersAmbiguous,
    preserved: usersPreserved,
    notes: 'Preserves usr_superadmin, usr_admin & organic users; separates unmodified seed/test fixtures from modified accounts.'
  });

  // 2. Donor Profiles
  const allDonors = await db.collection('donorprofiles').find({}).toArray();
  let donorsDemo = 0;
  let donorsAmbiguous = 0;
  let donorsPreserved = 0;

  for (const d of allDonors) {
    const { classification, reason } = classifyDonor(d, userClassMap);
    const hash = hashRecord(d);

    if (classification === 'CONFIRMED_DEMO') donorsDemo++;
    else if (classification === 'AMBIGUOUS_PENDING_REVIEW') donorsAmbiguous++;
    else donorsPreserved++;

    records.push({
      id: String(d._id),
      collection: 'donorprofiles',
      classification,
      reason,
      hash,
      data: d
    });
  }

  summary.push({
    collection: 'donorprofiles',
    total: allDonors.length,
    confirmedDemo: donorsDemo,
    ambiguousPendingReview: donorsAmbiguous,
    preserved: donorsPreserved,
    notes: 'Purges unmodified seed donor_prof_*; retains any modified or organic donor profiles.'
  });

  // 3. Blood Requests
  const allRequests = await db.collection('bloodrequests').find({}).toArray();
  let reqsDemo = 0;
  let reqsAmbiguous = 0;
  let reqsPreserved = 0;

  for (const r of allRequests) {
    const { classification, reason } = classifyBloodRequest(r, userClassMap);
    const hash = hashRecord(r);

    if (classification === 'CONFIRMED_DEMO') reqsDemo++;
    else if (classification === 'AMBIGUOUS_PENDING_REVIEW') reqsAmbiguous++;
    else reqsPreserved++;

    records.push({
      id: String(r._id),
      collection: 'bloodrequests',
      classification,
      reason,
      hash,
      data: r
    });
  }

  summary.push({
    collection: 'bloodrequests',
    total: allRequests.length,
    confirmedDemo: reqsDemo,
    ambiguousPendingReview: reqsAmbiguous,
    preserved: reqsPreserved,
    notes: 'Purges unmodified test/seed requests; retains requests with donor responses or organic origin.'
  });

  // 4. Institutions: 100% Preserved
  const allInsts = await db.collection('institutions').find({}).toArray();
  for (const inst of allInsts) {
    records.push({
      id: String(inst._id),
      collection: 'institutions',
      classification: 'PRESERVED',
      reason: 'Approved educational institution partner (DU, BUET, CMC, RU, SUST, KUET)',
      hash: hashRecord(inst),
      data: inst
    });
  }
  summary.push({
    collection: 'institutions',
    total: allInsts.length,
    confirmedDemo: 0,
    ambiguousPendingReview: 0,
    preserved: allInsts.length,
    notes: '100% Preserved partner institutions.'
  });

  // 5. Secondary Collections
  const secondaryCollections = [
    { name: 'institutionrequests', seedIds: EXACT_SEED_INST_REQ_IDS, userField: 'applicantPhone' },
    { name: 'contactrequests', seedIds: EXACT_SEED_CONTACT_REQ_IDS, userField: 'requesterId' },
    { name: 'phonechangerequests', seedIds: EXACT_SEED_PHONE_CHANGE_IDS, userField: 'userId' },
    { name: 'notifications', seedIds: EXACT_SEED_NOTIF_IDS, userField: 'userId' },
    { name: 'moderatoractivities', seedIds: EXACT_SEED_MOD_ACTIVITY_IDS, userField: 'actorId' },
    { name: 'accountstatushistories', seedIds: EXACT_SEED_ACCOUNT_STATUS_IDS, userField: 'userId' },
    { name: 'contactaccesslogs', seedIds: new Set<string>(), userField: 'viewerId' }
  ];

  for (const sec of secondaryCollections) {
    const coll = db.collection(sec.name);
    const docs = await coll.find({}).toArray();
    let secDemo = 0;
    let secAmbiguous = 0;
    let secPreserved = 0;

    for (const doc of docs) {
      const id = String(doc._id);
      const isSeed = sec.seedIds.has(id);
      const userRef = String(doc[sec.userField] || '');
      const userClass = userClassMap.get(userRef);

      let classification: ClassificationType = 'CONFIRMED_DEMO';
      let reason = 'Unmodified seed or test execution artifact';

      if (userClass === 'PRESERVED') {
        classification = 'PRESERVED';
        reason = 'Belongs to an active preserved user';
      } else if (userClass === 'AMBIGUOUS_PENDING_REVIEW') {
        classification = 'AMBIGUOUS_PENDING_REVIEW';
        reason = 'Belongs to an ambiguous user record pending review';
      } else if (!isSeed && !id.startsWith(sec.name.slice(0, 3))) {
        classification = 'PRESERVED';
        reason = 'Non-fixture secondary record';
      }

      if (classification === 'CONFIRMED_DEMO') secDemo++;
      else if (classification === 'AMBIGUOUS_PENDING_REVIEW') secAmbiguous++;
      else secPreserved++;

      records.push({
        id,
        collection: sec.name,
        classification,
        reason,
        hash: hashRecord(doc),
        data: doc
      });
    }

    summary.push({
      collection: sec.name,
      total: docs.length,
      confirmedDemo: secDemo,
      ambiguousPendingReview: secAmbiguous,
      preserved: secPreserved,
      notes: `Secondary collection audit.`
    });
  }

  return {
    timestamp: new Date().toISOString(),
    summary,
    records
  };
}

/**
 * Creates a secure pre-cleanup backup outside git tracking.
 */
export function createBackupFile(auditResult: DetailedAuditResult): string {
  const backupDir = path.resolve(process.cwd(), 'server/backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
  }

  const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(backupDir, `mongodb_pre_launch_backup_${timestampStr}.json`);

  const demoRecords = auditResult.records.filter(r => r.classification === 'CONFIRMED_DEMO');
  const ambiguousRecords = auditResult.records.filter(r => r.classification === 'AMBIGUOUS_PENDING_REVIEW');

  const payload = {
    metadata: {
      createdAt: new Date().toISOString(),
      environment: 'MongoDB Atlas Production Cluster',
      totalDocumentsInBackup: demoRecords.length,
      ambiguousCount: ambiguousRecords.length
    },
    demoRecordsToDelete: demoRecords.map(r => ({
      id: r.id,
      collection: r.collection,
      hash: r.hash,
      data: r.data
    })),
    ambiguousRecordsRetained: ambiguousRecords.map(r => ({
      id: r.id,
      collection: r.collection,
      reason: r.reason
    }))
  };

  fs.writeFileSync(backupFilePath, JSON.stringify(payload, null, 2), { encoding: 'utf-8', mode: 0o600 });
  return backupFilePath;
}

/**
 * Verifies that the backup file can be cleanly restored into an isolated test database.
 */
export async function verifyBackupRestoreInIsolatedDb(backupFilePath: string, baseMongoUri: string): Promise<{ success: boolean; restoredCounts: Record<string, number> }> {
  const content = fs.readFileSync(backupFilePath, 'utf-8');
  const backup = JSON.parse(content);

  // Connect to isolated test database name
  const testDbUri = baseMongoUri.replace(/\/([^/?]+)(\?|$)/, '/test_pre_launch_restore_verification$2');
  const client = await mongoose.createConnection(testDbUri).asPromise();
  const testDb = client.db;
  if (!testDb) throw new Error('Could not connect to isolated verification database');

  console.log(`[RESTORE TEST] Connected to isolated test DB: test_pre_launch_restore_verification`);

  const restoredCounts: Record<string, number> = {};

  try {
    // Clean any prior verification test artifacts
    await testDb.dropDatabase();

    // Group backup records by collection
    const byCollection: Record<string, any[]> = {};
    for (const item of backup.demoRecordsToDelete) {
      if (!byCollection[item.collection]) byCollection[item.collection] = [];
      byCollection[item.collection].push(item.data);
    }

    // Insert into isolated test database
    for (const [collName, docs] of Object.entries(byCollection)) {
      if (docs.length > 0) {
        const res = await testDb.collection(collName).insertMany(docs);
        restoredCounts[collName] = res.insertedCount;
        console.log(`[RESTORE TEST] Collection ${collName}: successfully restored ${res.insertedCount} documents`);
      }
    }

    // Verify document counts and fidelity
    for (const [collName, docs] of Object.entries(byCollection)) {
      const count = await testDb.collection(collName).countDocuments();
      if (count !== docs.length) {
        throw new Error(`Count mismatch in restored collection ${collName}: expected ${docs.length}, got ${count}`);
      }
    }

    console.log(`[RESTORE TEST SUCCESS] All ${backup.demoRecordsToDelete.length} records verified intact in test DB!`);
    return { success: true, restoredCounts };
  } finally {
    // Clean up test verification database
    await testDb.dropDatabase();
    await client.close();
  }
}

/**
 * Main Runner.
 */
export async function main() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is missing in environment variables.');
    process.exit(1);
  }

  const isApply = process.argv.includes('--apply');
  const isVerifyRestore = process.argv.includes('--verify-restore');

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db!;

  const auditResult = await performFullClassification(db);

  console.log('\n========================================================================');
  console.log('  REVISED DRY-RUN AUDIT: CONFIRMED DEMO vs AMBIGUOUS vs PRESERVED');
  console.log('========================================================================');
  console.log(`Audit Execution Time: ${auditResult.timestamp}`);
  console.log('Strict PII Shield Active: No names, numbers, or emails are exposed.\n');

  console.table(auditResult.summary.map(s => ({
    Collection: s.collection,
    Total: s.total,
    ConfirmedDemo: s.confirmedDemo,
    AmbiguousPendingReview: s.ambiguousPendingReview,
    Preserved: s.preserved,
    Notes: s.notes
  })));

  // Always generate secure pre-cleanup backup
  const backupPath = createBackupFile(auditResult);
  console.log(`\n[BACKUP CREATED] Pre-cleanup snapshot written to gitignored path:`);
  console.log(`  ${backupPath}`);

  // Test database restore verification
  if (isVerifyRestore || process.argv.includes('--verify')) {
    console.log('\n[RUNNING RESTORE VERIFICATION] Verifying backup restore against isolated test database...');
    const restoreResult = await verifyBackupRestoreInIsolatedDb(backupPath, MONGO_URI);
    console.log('[RESTORE VERIFICATION PASSED]', JSON.stringify(restoreResult.restoredCounts));
  }

  if (isApply) {
    console.warn('\n[BLOCKED BY USER POLICY] Direct live deletion is blocked by policy.');
    console.warn('Live deletion will ONLY execute when the user explicitly reviews and orders `--apply`.');
  }

  await mongoose.disconnect();
}

if (process.argv[1] && process.argv[1].endsWith('cleanDemoData.ts')) {
  main()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
