/**
 * audit_and_migrate_locations.ts
 * Production-safe Location Audit & Non-Destructive Migration Script
 * Scans MongoDB collections (User, DonorProfile, BloodRequest, Institution)
 * Validates against authoritative Bangladesh Administrative Location hierarchy
 * Maps legacy/informal spellings (e.g., 'jessore' -> 'jashore') without data loss.
 * Supports --dry-run (default) and --apply modes.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { BANGLADESH_DIVISIONS, normalizeLocationSlug, validateLocationHierarchy, resolveCanonicalDistrict } from '../data/bangladeshLocations.js';
import { UserModel } from '../models/User.js';
import { DonorProfileModel } from '../models/DonorProfile.js';
import { BloodRequestModel } from '../models/BloodRequest.js';
import { InstitutionModel } from '../models/Institution.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isApply = process.argv.includes('--apply');

interface LocationAuditReport {
  scanned: number;
  valid: number;
  migratable: number;
  invalid: number;
  changes: Array<{
    collection: string;
    id: string;
    field: string;
    from: { division?: string; district?: string; upazila?: string };
    to: { division?: string; district?: string; upazila?: string };
  }>;
}

async function auditAndMigrate() {
  console.log('========================================================');
  console.log(' Bangladesh Administrative Location System Audit');
  console.log(` Mode: ${isApply ? 'APPLY (Live Updates)' : 'DRY-RUN (Audit Only)'}`);
  console.log('========================================================\n');

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Error: MONGODB_URI not found in environment.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB Atlas.\n');

  const report: LocationAuditReport = {
    scanned: 0,
    valid: 0,
    migratable: 0,
    invalid: 0,
    changes: []
  };

  // Helper to audit a record
  async function auditRecord(
    model: any,
    collectionName: string,
    doc: any
  ) {
    report.scanned++;
    const div = doc.division;
    const dist = doc.district;
    const upz = doc.upazila;

    if (!div && !dist) {
      // Optional location field unassigned
      report.valid++;
      return;
    }

    const valResult = validateLocationHierarchy(div, dist, upz);

    if (valResult.valid && valResult.canonical) {
      const canonical = valResult.canonical;
      const isDifferent =
        canonical.division !== div ||
        canonical.district !== dist ||
        (upz && canonical.upazila !== upz);

      if (isDifferent) {
        report.migratable++;
        report.changes.push({
          collection: collectionName,
          id: doc._id.toString(),
          field: 'location',
          from: { division: div, district: dist, upazila: upz },
          to: canonical
        });

        if (isApply) {
          doc.division = canonical.division;
          doc.district = canonical.district;
          if (canonical.upazila) doc.upazila = canonical.upazila;
          await doc.save();
        }
      } else {
        report.valid++;
      }
    } else {
      // Try resolving by district alias
      const resolved = resolveCanonicalDistrict(dist);
      if (resolved) {
        report.migratable++;
        const toLoc = { division: resolved.divisionId, district: resolved.districtId, upazila: upz };
        report.changes.push({
          collection: collectionName,
          id: doc._id.toString(),
          field: 'location',
          from: { division: div, district: dist, upazila: upz },
          to: toLoc
        });

        if (isApply) {
          doc.division = resolved.divisionId;
          doc.district = resolved.districtId;
          await doc.save();
        }
      } else {
        report.invalid++;
        console.warn(`[Invalid Location] in ${collectionName} (${doc._id}): div="${div}", dist="${dist}", upz="${upz}" -> ${valResult.error}`);
      }
    }
  }

  // 1. Audit Users
  const users = await UserModel.find({ $or: [{ division: { $exists: true } }, { district: { $exists: true } }] });
  console.log(`Auditing Users (${users.length} records)...`);
  for (const u of users) {
    await auditRecord(UserModel, 'User', u);
  }

  // 2. Audit DonorProfiles
  const donors = await DonorProfileModel.find({});
  console.log(`Auditing DonorProfiles (${donors.length} records)...`);
  for (const d of donors) {
    await auditRecord(DonorProfileModel, 'DonorProfile', d);
  }

  // 3. Audit BloodRequests
  const requests = await BloodRequestModel.find({});
  console.log(`Auditing BloodRequests (${requests.length} records)...`);
  for (const r of requests) {
    await auditRecord(BloodRequestModel, 'BloodRequest', r);
  }

  // 4. Audit Institutions
  const institutions = await InstitutionModel.find({});
  console.log(`Auditing Institutions (${institutions.length} records)...`);
  for (const i of institutions) {
    await auditRecord(InstitutionModel, 'Institution', i);
  }

  console.log('\n========================================================');
  console.log(' Audit Summary:');
  console.log(` Total Scanned Records: ${report.scanned}`);
  console.log(` Canonical Valid:        ${report.valid}`);
  console.log(` Migratable/Normalized:  ${report.migratable}`);
  console.log(` Unresolvable/Invalid:   ${report.invalid}`);
  console.log('========================================================');

  if (report.changes.length > 0) {
    console.log(`\nSample Proposed Transformations (${Math.min(5, report.changes.length)} of ${report.changes.length}):`);
    report.changes.slice(0, 5).forEach((ch, idx) => {
      console.log(` ${idx + 1}. [${ch.collection} ${ch.id}]`);
      console.log(`    From: div=${ch.from.division}, dist=${ch.from.district}, upz=${ch.from.upazila}`);
      console.log(`    To:   div=${ch.to.division}, dist=${ch.to.district}, upz=${ch.to.upazila}`);
    });
  }

  if (!isApply && report.migratable > 0) {
    console.log('\n[Dry-Run Notice] To apply these updates to MongoDB Atlas, run with:');
    console.log('  npx tsx src/scripts/audit_and_migrate_locations.ts --apply\n');
  }

  await mongoose.disconnect();
}

auditAndMigrate().catch(err => {
  console.error('Audit and migration error:', err);
  process.exit(1);
});
