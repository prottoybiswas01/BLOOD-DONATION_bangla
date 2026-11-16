import React from 'react';
import { User as UserIcon, Save } from 'lucide-react';
import { BLOOD_GROUPS, BloodGroup } from '../../data/bangladeshLocations';
import { LocationSelector } from '../LocationSelector';
import { Button } from '../ui/Button';

interface ProfilePersonalFormProps {
  userRole?: string;
  name: string;
  setName: (val: string) => void;
  gender: string;
  setGender: (val: string) => void;
  bloodGroup: BloodGroup;
  setBloodGroup: (val: BloodGroup) => void;
  availabilityStatus: string;
  setAvailabilityStatus: (val: string) => void;
  division: string;
  setDivision: (val: string) => void;
  district: string;
  setDistrict: (val: string) => void;
  upazila: string;
  setUpazila: (val: string) => void;
  consentToShareContact: boolean;
  setConsentToShareContact: (val: boolean) => void;
  bio: string;
  setBio: (val: string) => void;
  savingProfile: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProfilePersonalForm: React.FC<ProfilePersonalFormProps> = ({
  userRole,
  name,
  setName,
  gender,
  setGender,
  bloodGroup,
  setBloodGroup,
  availabilityStatus,
  setAvailabilityStatus,
  division,
  setDivision,
  district,
  setDistrict,
  upazila,
  setUpazila,
  consentToShareContact,
  setConsentToShareContact,
  bio,
  setBio,
  savingProfile,
  onSubmit
}) => {
  return (
    <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 sm:p-8 space-y-6">
      <div className="border-b border-appBorder pb-4">
        <h2 className="text-base font-black text-mainText flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-primary" />
          <span>ব্যক্তিগত ও স্বাস্থ্য তথ্য</span>
        </h2>
        <p className="text-xs text-subText mt-0.5">আপনার নাম, রক্তের গ্রুপ ও ভৌগোলিক তথ্য হালনাগাদ রাখুন</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-mainText mb-1.5">সম্পূর্ণ নাম *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-mainText mb-1.5">লিঙ্গ (Gender)</label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText"
            >
              <option value="male">পুরুষ</option>
              <option value="female">নারী</option>
              <option value="other">অন্যান্য</option>
              <option value="unspecified">অনির্দিষ্ট</option>
            </select>
          </div>
        </div>

        {/* Blood Group & Availability (For Donors) */}
        {userRole === 'DONOR' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-mainText mb-1.5">রক্তের গ্রুপ</label>
              <select
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm font-black text-primary"
              >
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-mainText mb-1.5">রক্তদানে বর্তমান উপলব্ধতা</label>
              <select
                value={availabilityStatus}
                onChange={e => setAvailabilityStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText"
              >
                <option value="available">রক্তদানে প্রস্তুত (সক্রিয়)</option>
                <option value="recently_donated">সম্প্রতি রক্তদান করেছি (বিশ্রামে)</option>
                <option value="temporarily_unavailable">সাময়িক বিরতি (শারীরিক কারণ)</option>
              </select>
            </div>
          </div>
        )}

        {/* Location Selector */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-mainText">আপনার এলাকা / অবস্থান</label>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <LocationSelector
              division={division}
              district={district}
              upazila={upazila}
              onDivisionChange={setDivision}
              onDistrictChange={setDistrict}
              onUpazilaChange={setUpazila}
            />
          </div>
        </div>

        {/* Privacy & Public Contact Visibility */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-appBorder space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <label className="text-xs font-bold text-mainText block">
                পাবলিক অনুসন্ধানে সরাসরি যোগাযোগের অনুমতি (Privacy & Visibility)
              </label>
              <p className="text-[11px] text-subText mt-0.5 leading-relaxed">
                চিহ্নিত থাকলে জরুরি রক্তের সন্ধানে আসা যে কোনো ভিজিটর লগইন না করেই আপনার সাথে সরাসরি ফোনে যোগাযোগ করতে পারবেন। আনচেক করলে পাবলিক অনুসন্ধানে আপনার মোবাইল নম্বর সম্পূর্ণ গোপন থাকবে।
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={consentToShareContact}
                onChange={e => setConsentToShareContact(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
          <div className="flex items-center gap-2 pt-1 text-[11px]">
            <span className={`font-semibold ${consentToShareContact ? 'text-emerald-700' : 'text-amber-700'}`}>
              {consentToShareContact ? '✓ বর্তমানে নম্বর উন্মুক্ত রয়েছে' : '⚠ বর্তমানে নম্বর গোপন রাখা হয়েছে'}
            </span>
          </div>
        </div>

        {/* Bio / Motivation */}
        <div>
          <label className="block text-xs font-bold text-mainText mb-1.5">সংক্ষিপ্ত পরিচয় বা বার্তা</label>
          <textarea
            rows={3}
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="রক্তদান সংক্রান্ত আপনার অভিজ্ঞতা বা বার্তা..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-appBorder rounded-xl text-sm text-mainText"
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={savingProfile}
            icon={<Save className="w-4 h-4" />}
            className="shadow-soft"
          >
            তথ্য সংরক্ষণ করুন
          </Button>
        </div>
      </form>
    </div>
  );
};
