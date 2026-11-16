import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { BloodGroup } from '../data/bangladeshLocations';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PhoneChangeRequest } from '../types';
import { ProfilePhoneSection } from '../components/profile/ProfilePhoneSection';
import { ProfileInstitutionSection } from '../components/profile/ProfileInstitutionSection';
import { ProfilePersonalForm } from '../components/profile/ProfilePersonalForm';
import { ProfileDangerZone } from '../components/profile/ProfileDangerZone';

export const ProfileSettings: React.FC = () => {
  const { user, donorProfile, refreshUser } = useAuth();

  // Editable Profile fields
  const [name, setName] = useState(user?.name || '');
  const [gender, setGender] = useState(user?.gender || 'unspecified');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(donorProfile?.bloodGroup || 'O+');
  const [division, setDivision] = useState(donorProfile?.division || 'dhaka');
  const [district, setDistrict] = useState(donorProfile?.district || 'dhaka');
  const [upazila, setUpazila] = useState(donorProfile?.upazila || '');
  const [bio, setBio] = useState(donorProfile?.bio || '');
  const [availabilityStatus, setAvailabilityStatus] = useState(donorProfile?.availabilityStatus || 'available');
  const [consentToShareContact, setConsentToShareContact] = useState(donorProfile?.consentToShareContact ?? true);

  // Status & Feedback
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Institution & Phone Requests
  const [pendingPhoneRequest, setPendingPhoneRequest] = useState<PhoneChangeRequest | null>(null);
  const [approvedInstitutions, setApprovedInstitutions] = useState<any[]>([]);
  const [pendingInstRequest, setPendingInstRequest] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setGender(user.gender || 'unspecified');
    }
    if (donorProfile) {
      setBloodGroup(donorProfile.bloodGroup);
      setDivision(donorProfile.division);
      setDistrict(donorProfile.district);
      setUpazila(donorProfile.upazila || '');
      setBio(donorProfile.bio || '');
      setAvailabilityStatus(donorProfile.availabilityStatus);
      setConsentToShareContact(donorProfile.consentToShareContact ?? true);
    }

    // Load active phone request and institution change request
    async function loadRequests() {
      try {
        const [phoneRes, instRes, instListRes] = await Promise.all([
          api.getMyPhoneChangeRequest(),
          api.getMyInstitutionChangeRequest(),
          api.getInstitutions()
        ]);
        if (phoneRes.success && phoneRes.pendingRequest) {
          setPendingPhoneRequest(phoneRes.pendingRequest);
        }
        if (instRes.success && instRes.pendingRequest) {
          setPendingInstRequest(instRes.pendingRequest);
        }
        if (instListRes.success && instListRes.institutions) {
          setApprovedInstitutions(instListRes.institutions);
        }
      } catch {}
    }
    loadRequests();
  }, [user, donorProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await api.updateProfile({
        name,
        gender,
        bloodGroup: user?.role === 'DONOR' ? bloodGroup : undefined,
        division,
        district,
        upazila,
        bio,
        availabilityStatus: user?.role === 'DONOR' ? availabilityStatus : undefined,
        consentToShareContact
      });

      if (res.success) {
        setProfileMsg({ text: 'আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে।', type: 'success' });
        await refreshUser();
      } else {
        setProfileMsg({ text: res.message || 'হালনাগাদ করা যায়নি।', type: 'error' });
      }
    } catch (err: any) {
      setProfileMsg({ text: err.message || 'সার্ভারে সংযোগ ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return '/admin/dashboard';
      case 'DIVISION_COORDINATOR':
        return '/coordinator/dashboard';
      case 'INSTITUTION_HEAD':
        return '/head/dashboard';
      case 'INSTITUTION_MODERATOR':
        return '/moderator/dashboard';
      case 'REQUESTER':
        return '/requester/dashboard';
      default:
        return '/donor/dashboard';
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-surface rounded-3xl border border-appBorder text-center space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-primary" />
        <h2 className="text-xl font-bold text-mainText">লগইন আবশ্যক</h2>
        <Link to="/login">
          <Button variant="primary" size="md">লগইন করুন</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-surface rounded-3xl border border-appBorder shadow-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-rose-600 text-white flex items-center justify-center font-black text-2xl shadow-soft">
            {user.name.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-mainText">{user.name}</h1>
              <Badge variant="primary" size="sm">{user.role}</Badge>
            </div>
            <p className="text-xs text-subText font-mono">আইডি: {user._id}</p>
          </div>
        </div>

        <Link to={getDashboardPath()}>
          <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
            ড্যাশবোর্ড প্যানেল
          </Button>
        </Link>
      </div>

      {profileMsg && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
          profileMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {profileMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
          <span>{profileMsg.text}</span>
        </div>
      )}

      {/* Phone Number & Safety Section */}
      <ProfilePhoneSection
        phone={user.phone}
        pendingPhoneRequest={pendingPhoneRequest}
        onPhoneRequestSubmitted={(req, text) => {
          setPendingPhoneRequest(req);
          setProfileMsg({ text, type: 'success' });
        }}
      />

      {/* Institution Attachment Section */}
      <ProfileInstitutionSection
        user={user}
        approvedInstitutions={approvedInstitutions}
        pendingInstRequest={pendingInstRequest}
        onInstRequestSubmitted={(req, text) => {
          setPendingInstRequest(req);
          setProfileMsg({ text, type: 'success' });
        }}
      />

      {/* Personal & Medical Info Form */}
      <ProfilePersonalForm
        userRole={user.role}
        name={name}
        setName={setName}
        gender={gender}
        setGender={val => setGender(val as any)}
        bloodGroup={bloodGroup}
        setBloodGroup={setBloodGroup}
        availabilityStatus={availabilityStatus}
        setAvailabilityStatus={val => setAvailabilityStatus(val as any)}
        division={division}
        setDivision={setDivision}
        district={district}
        setDistrict={setDistrict}
        upazila={upazila}
        setUpazila={setUpazila}
        consentToShareContact={consentToShareContact}
        setConsentToShareContact={setConsentToShareContact}
        bio={bio}
        setBio={setBio}
        savingProfile={savingProfile}
        onSubmit={handleUpdateProfile}
      />

      {/* Danger Zone: Account & Profile Deletion */}
      <ProfileDangerZone
        onSuccessMessage={(text) => setProfileMsg({ text, type: 'success' })}
        onErrorMessage={(text) => setProfileMsg({ text, type: 'error' })}
      />
    </div>
  );
};
