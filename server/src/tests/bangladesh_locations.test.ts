import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BANGLADESH_DIVISIONS,
  BLOOD_GROUPS,
  validateLocationHierarchy,
  resolveCanonicalDistrict,
  normalizeLocationSlug
} from '../data/bangladeshLocations.js';

describe('Authoritative Bangladesh Administrative Location System', () => {
  it('1. Verifies exactly 8 divisions in Bangladesh', () => {
    assert.equal(BANGLADESH_DIVISIONS.length, 8, 'Bangladesh must have exactly 8 administrative divisions');
    
    const divisionIds = BANGLADESH_DIVISIONS.map(d => d.id).sort();
    const expectedDivisions = [
      'barishal',
      'chattogram',
      'dhaka',
      'khulna',
      'mymensingh',
      'rajshahi',
      'rangpur',
      'sylhet'
    ].sort();

    assert.deepEqual(divisionIds, expectedDivisions);
  });

  it('2. Verifies exactly 64 districts correctly mapped across 8 divisions', () => {
    const allDistricts = BANGLADESH_DIVISIONS.flatMap(d => d.districts);
    assert.equal(allDistricts.length, 64, 'Bangladesh must have exactly 64 administrative districts');

    // Expected district counts per division
    const divisionCounts: Record<string, number> = {
      dhaka: 13,
      chattogram: 11,
      rajshahi: 8,
      khulna: 10,
      barishal: 6,
      sylhet: 4,
      rangpur: 8,
      mymensingh: 4
    };

    for (const div of BANGLADESH_DIVISIONS) {
      assert.equal(
        div.districts.length,
        divisionCounts[div.id],
        `Division ${div.id} must have exactly ${divisionCounts[div.id]} districts`
      );
    }
  });

  it('3. Mandatory Regression Test: Khulna -> Jashore -> Abhaynagar hierarchy', () => {
    // 3.1 Khulna exists
    const khulna = BANGLADESH_DIVISIONS.find(d => d.id === 'khulna');
    assert.ok(khulna, 'Khulna division must exist');
    assert.equal(khulna.nameBn, 'খুলনা');

    // 3.2 Jashore exists inside Khulna
    const jashore = khulna.districts.find(d => d.id === 'jashore');
    assert.ok(jashore, 'Jashore district must exist inside Khulna division');
    assert.equal(jashore.nameBn, 'যশোর');
    assert.equal(jashore.nameEn, 'Jashore');

    // 3.3 Abhaynagar upazila exists inside Jashore
    const abhaynagar = jashore.upazilas.find(u => u.id === 'abhaynagar');
    assert.ok(abhaynagar, 'Abhaynagar upazila must exist inside Jashore district');
    assert.equal(abhaynagar.nameBn, 'অভয়নগর');
    assert.equal(abhaynagar.nameEn, 'Abhaynagar');

    // 3.4 Validate hierarchy execution
    const res = validateLocationHierarchy('khulna', 'jashore', 'abhaynagar');
    assert.equal(res.valid, true);
    assert.deepEqual(res.canonical, {
      division: 'khulna',
      district: 'jashore',
      upazila: 'abhaynagar'
    });
  });

  it('4. Resolves legacy English and Bengali spelling aliases to canonical identifiers', () => {
    // Legacy Jessore -> Jashore
    assert.equal(normalizeLocationSlug('jessore'), 'jashore');
    assert.equal(normalizeLocationSlug('Jessore'), 'jashore');
    assert.equal(normalizeLocationSlug('যশোর'), 'jashore');

    // Legacy Chittagong -> Chattogram
    assert.equal(normalizeLocationSlug('chittagong'), 'chattogram');
    assert.equal(normalizeLocationSlug('চট্টগ্রাম'), 'chattogram');

    // Legacy Bogra -> Bogura
    assert.equal(normalizeLocationSlug('bogra'), 'bogura');
    assert.equal(normalizeLocationSlug('বগুড়া'), 'bogura');

    // Legacy Comilla -> Cumilla
    assert.equal(normalizeLocationSlug('comilla'), 'cumilla');
    assert.equal(normalizeLocationSlug('কুমিল্লা'), 'cumilla');

    // Legacy Barisal -> Barishal
    assert.equal(normalizeLocationSlug('barisal'), 'barishal');
    assert.equal(normalizeLocationSlug('বরিশাল'), 'barishal');

    // Cox's Bazar variations
    assert.equal(normalizeLocationSlug("cox's_bazar"), 'coxsbazar');
    assert.equal(normalizeLocationSlug('coxs_bazar'), 'coxsbazar');
    assert.equal(normalizeLocationSlug('কক্সবাজার'), 'coxsbazar');
  });

  it('5. Resolves canonical district and its parent division from a standalone district name', () => {
    const resJashore = resolveCanonicalDistrict('jessore');
    assert.ok(resJashore);
    assert.equal(resJashore.divisionId, 'khulna');
    assert.equal(resJashore.districtId, 'jashore');
    assert.equal(resJashore.districtNameBn, 'যশোর');

    const resCox = resolveCanonicalDistrict("cox's_bazar");
    assert.ok(resCox);
    assert.equal(resCox.divisionId, 'chattogram');
    assert.equal(resCox.districtId, 'coxsbazar');

    const resBogura = resolveCanonicalDistrict('bogra');
    assert.ok(resBogura);
    assert.equal(resBogura.divisionId, 'rajshahi');
    assert.equal(resBogura.districtId, 'bogura');
  });

  it('6. Strictly rejects mismatched division-district combinations', () => {
    // Mismatched: Dhaka division with Jashore district
    const invalidResult = validateLocationHierarchy('dhaka', 'jashore');
    assert.equal(invalidResult.valid, false);
    assert.ok(invalidResult.error?.includes('ঢাকা'));

    // Non-existent division
    const fakeDiv = validateLocationHierarchy('atlantis', 'dhaka');
    assert.equal(fakeDiv.valid, false);

    // Non-existent upazila in Jashore
    const fakeUpz = validateLocationHierarchy('khulna', 'jashore', 'non_existent_upazila');
    assert.equal(fakeUpz.valid, false);
    assert.ok(fakeUpz.error?.includes('উপজেলা'));
  });

  it('7. Verifies standard ABO and Rh blood groups', () => {
    assert.equal(BLOOD_GROUPS.length, 8);
    const expected = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    assert.deepEqual([...BLOOD_GROUPS], expected);
  });
});
