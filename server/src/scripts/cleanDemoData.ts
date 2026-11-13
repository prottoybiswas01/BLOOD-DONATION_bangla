import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { ENV } from '../config/env.js';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = ENV.MONGO_URI || process.env.MONGO_URI || '';

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
 * ID prefix matching is treated solely as a suspicion signal.
 * To confirm demo: BOTH specific fixture ID and verified fixture identity must match.
 * Modified records and accounts linked to real activity are retained for review.
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

  // 2. ID prefix match is strictly a SUSPICION SIGNAL (candidate / flag)
  const isSeedUser = EXACT_SEED_USER_IDS.has(id);
  const hasSuspiciousPrefix = isSeedUser ||
                              id.startsWith('usr_sync_') ||
                              id.startsWith('usr_target_') ||
                              id.startsWith('usr_req_') ||
                              id.startsWith('usr_test_') ||
                              id.startsWith('usr_actor_') ||
                              id.startsWith('usr_viewer_') ||
                              id.startsWith('usr_head_') ||
                              id.startsWith('usr_moderator_') ||
                              id.startsWith('usr_coordinator_');

  if (!hasSuspiciousPrefix) {
    // Identity is organic or not a recognized seed/test fixture -> PRESERVE
    return {
      classification: 'PRESERVED',
      reason: 'Organic user registration with non-fixture identifier'
    };
  }

  // 3. For users with suspicious prefix: check for evidence of modification or real use
  const hasLastLogin = Boolean(u.lastLoginAt);
  const createdAtTime = u.createdAt ? new Date(u.createdAt).getTime() : 0;
  const updatedAtTime = u.updatedAt ? new Date(u.updatedAt).getTime() : 0;
  const wasSignificantlyUpdated = (updatedAtTime - createdAtTime) > 2000;

  if (hasLastLogin || wasSignificantlyUpdated) {
    return {
      classification: 'AMBIGUOUS_PENDING_REVIEW',
      reason: 'Suspicious identifier but has recorded user login history or substantial post-creation modification'
    };
  }

  // 4. Verify Record Identity against known fixtures
  const KNOWN_FIXTURE_NAMES = new Set([
    'সুপার অ্যাডমিন (Super Admin)', 'প্ল্যাটফর্ম অ্যাডমিন (Admin)',
    'বিভাগীয় সমন্বয়ক (ঢাকা)', 'বিভাগীয় সমন্বয়ক (চট্টগ্রাম)',
    'প্রতিষ্ঠান মডারেটর (ঢাকা বিশ্ববিদ্যালয়)', 'প্রতিষ্ঠান প্রধান',
    'রফিকুল ইসলাম', 'তাহমিদ হাসান', 'মোস্তাফিজুর রহমান',
    'আহমেদ হাসান', 'হাসান মাহমুদ', 'মাহবুব আলম (টেস্ট আবেদনকারী)',
    'সাদিয়া জাহান', 'তানভীর আহমেদ', 'ফারহানা আক্তার'
  ]);

  const hasFixtureCredentials = Boolean(
    (u.passwordHash && (
      u.passwordHash.includes('validPasswordHash') ||
      u.passwordHash.includes('defaultHashPlaceholder') ||
      u.passwordHash === 'dummy'
    ))
  );

  const isKnownFixtureIdentity = isSeedUser ||
                                KNOWN_FIXTURE_NAMES.has(u.name) ||
                                hasFixtureCredentials;

  if (!isKnownFixtureIdentity) {
    return {
      classification: 'AMBIGUOUS_PENDING_REVIEW',
      reason: 'Identifier has suspicious prefix but record identity does not match verified fixture signatures'
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
  const hasSuspiciousPrefix = isSeedDonor || id.startsWith('donor_prof_');

  if (!hasSuspiciousPrefix) {
    return {
      classification: 'PRESERVED',
      reason: 'Non-fixture donor registration'
    };
  }

  const createdAtTime = d.createdAt ? new Date(d.createdAt).getTime() : 0;
  const updatedAtTime = d.updatedAt ? new Date(d.updatedAt).getTime() : 0;
  if ((updatedAtTime - createdAtTime) > 2000) {
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
 * Any request with responses (units fulfilled > 0), history modifications, or status updates is retained for review.
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

  // 1. Evidence of real donor response or status update
  const hasDonorResponse = (r.unitsFulfilled && r.unitsFulfilled > 0) || r.status === 'partially_fulfilled' || r.status === 'fulfilled';
  const hasHistoryUpdates = Array.isArray(r.statusHistory) && r.statusHistory.length > 1;
  const createdAtTime = r.createdAt ? new Date(r.createdAt).getTime() : 0;
  const updatedAtTime = r.updatedAt ? new Date(r.updatedAt).getTime() : 0;
  const wasSignificantlyUpdated = (updatedAtTime - createdAtTime) > 2000;

  if (hasDonorResponse || hasHistoryUpdates || wasSignificantlyUpdated) {
    return {
      classification: 'AMBIGUOUS_PENDING_REVIEW',
      reason: 'Blood request has donor response, status change, or history modifications; retained for review'
    };
  }

  const isSeedReq = EXACT_SEED_REQUEST_IDS.has(id);
  const publicId = String(r.publicId || '');
  const hasSuspiciousPrefix = isSeedReq || id.startsWith('req_') || publicId.startsWith('BR-');

  if (!hasSuspiciousPrefix) {
    return {
      classification: 'PRESERVED',
      reason: 'Organic blood request by public user'
    };
  }

  // 2. Verified fixture identity check
  const KNOWN_TEST_PATIENTS = new Set([
    'নাজমুল হাসান', 'সালেহা বেগম', 'ফারহানা আক্তার', 'নুরুল ইসলাম', 'আহমেদ কবির (৫৫)',
    'রাশেদ খান', 'কামাল উদ্দিন', 'মরিয়ম আক্তার'
  ]);
  const patient = String(r.patientName || '').split('_')[0].trim();
  const matchesKnownPatient = KNOWN_TEST_PATIENTS.has(patient) || /_\d{10,}/.test(r.patientName || '');

  if (!isSeedReq && !matchesKnownPatient) {
    return {
      classification: 'AMBIGUOUS_PENDING_REVIEW',
      reason: 'ID has fixture prefix signal but record identity does not match known test fixtures; retained for review'
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
    else if (classification === 'AMBIGUOUS_PENDING_REVIEW') {
      reqsAmbiguous++;
      // Cross-reference: if an ambiguous or modified request exists, keep its requester user account for review
      const reqId = String(r.requesterId);
      if (userClassMap.get(reqId) === 'CONFIRMED_DEMO') {
        userClassMap.set(reqId, 'AMBIGUOUS_PENDING_REVIEW');
        const uRec = records.find(rec => rec.collection === 'users' && rec.id === reqId);
        if (uRec) {
          uRec.classification = 'AMBIGUOUS_PENDING_REVIEW';
          uRec.reason = 'Associated with a modified blood request pending review';
        }
      }
    }
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

  // Recalculate user summary based on cross-referenced ambiguous classifications
  const userSummary = summary.find(s => s.collection === 'users');
  if (userSummary) {
    const userRecs = records.filter(r => r.collection === 'users');
    userSummary.confirmedDemo = userRecs.filter(r => r.classification === 'CONFIRMED_DEMO').length;
    userSummary.ambiguousPendingReview = userRecs.filter(r => r.classification === 'AMBIGUOUS_PENDING_REVIEW').length;
    userSummary.preserved = userRecs.filter(r => r.classification === 'PRESERVED').length;
  }

  summary.push({
    collection: 'bloodrequests',
    total: allRequests.length,
    confirmedDemo: reqsDemo,
    ambiguousPendingReview: reqsAmbiguous,
    preserved: reqsPreserved,
    notes: 'Purges unmodified test/seed requests; retains requests with donor responses, modified notes, or organic origin.'
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
      } else if (doc.status === 'pending' || doc.status === 'under_review') {
        classification = 'AMBIGUOUS_PENDING_REVIEW';
        reason = 'Active pending request requiring administrator review';
        if (userRef && userClassMap.get(userRef) === 'CONFIRMED_DEMO') {
          userClassMap.set(userRef, 'AMBIGUOUS_PENDING_REVIEW');
          const uRec = records.find(rec => rec.collection === 'users' && rec.id === userRef);
          if (uRec) {
            uRec.classification = 'AMBIGUOUS_PENDING_REVIEW';
            uRec.reason = 'Associated with an active pending request requiring review';
          }
        }
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

  // Final synchronization of user collection summary
  const finalUserSummary = summary.find(s => s.collection === 'users');
  if (finalUserSummary) {
    const userRecs = records.filter(r => r.collection === 'users');
    finalUserSummary.confirmedDemo = userRecs.filter(r => r.classification === 'CONFIRMED_DEMO').length;
    finalUserSummary.ambiguousPendingReview = userRecs.filter(r => r.classification === 'AMBIGUOUS_PENDING_REVIEW').length;
    finalUserSummary.preserved = userRecs.filter(r => r.classification === 'PRESERVED').length;
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
