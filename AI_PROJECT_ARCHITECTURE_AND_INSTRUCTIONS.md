# AI Agent Master Instructions & Complete Project Architecture Map
> **মনোযোগ দিন (CRITICAL AI DIRECTIVE):**
> যেকোনো AI সহকারী (Gemini, Claude, GPT, Cursor, Antigravity) কোনো ব্যবহারকারীর নির্দেশনা বা প্রম্পট সম্পন্ন করার আগে **অবশ্যই প্রথমে এই ডকুমেন্টটি সম্পূর্ণ পড়বে**।
> ব্যবহারকারী কী চান, কোডটি কোন ফোল্ডারে এবং কোন ফাইলে আছে, কীভাবে ফাইলগুলো ভাগ করা আছে — তা এখানে বিস্তারিতভাবে লিখে দেওয়া হয়েছে।

---

## ১. নির্দেশিকা ও কোডিং নীতিমালা (AI Rules & Guidelines)

১. **এক ফাইলে অতিরিক্ত কোড লেখা যাবে না (No Monolithic 1000+ line files):**
   - কোনো পেজ বা কন্ট্রোলারে ১০০০, ২০০০ বা ৫০০০ লাইন একসাথে জমিয়ে রাখা যাবে না।
   - যেকোনো ফিচার বা সেকশন তৈরি করার সময় অবশ্যই সংশ্লিষ্ট ডিরেক্টরিতে আলাদা আলাদা সাব-কম্পোনেন্ট ফাইল তৈরি করতে হবে (যেমন: `client/src/components/admin/` অথবা `client/src/components/profile/`)।
   - মূল পেজ ফাইলটি (Page Orchestrator) শুধুমাত্র বিভিন্ন সেকশন/ট্যাবকে সমন্বয় করবে।

২. **প্রতিটি ফোল্ডারের সুনির্দিষ্ট উদ্দেশ্য (Strict Directory Separation):**
   - সার্ভারের কোড থাকবে শুধুমাত্র `server/` ফোল্ডারে।
   - ক্লায়েন্ট/ওয়েবের কোড থাকবে শুধুমাত্র `client/` ফোল্ডারে।
   - অ্যাডমিনের কম্পোনেন্ট থাকবে `client/src/components/admin/` ফোল্ডারে।
   - প্রোফাইল ও ইউজার সেটিংস থাকবে `client/src/components/profile/` ফোল্ডারে।
   - রিইউজেবল বেসিক UI কম্পোনেন্ট থাকবে `client/src/components/ui/` ফোল্ডারে।
   - ডাটাবেস মডেল থাকবে `server/src/models/` ফোল্ডারে।
   - রাউট ও এন্ডপয়েন্ট থাকবে `server/src/routes/` ফোল্ডারে।
   - কন্ট্রোলার থাকবে `server/src/controllers/` ফোল্ডারে।

৩. **নিরাপত্তা ও সুপার অ্যাডমিন সুরক্ষা (Safety Protocols):**
   - প্ল্যাটফর্মের শেষ সক্রিয় `SUPER_ADMIN` অ্যাকাউন্ট কখনোই পদাবনতি (Demote), ব্লক বা মুছে ফেলা যাবে না।
   - ইউজার ডিলিট বা প্রোফাইল ডিলিটের ক্ষেত্রে ক্যাসকেডিং ক্লিনআপ নিশ্চিত করতে হবে (ডাটাবেস ও মেমোরি উভয় স্তরে)।

---

## ২. ইউজার ডাটা ও প্রোফাইল মুছে ফেলার ব্যবস্থা (Data Deletion Architecture)

প্ল্যাটফর্মে যেকোনো ব্যবহারকারীর ডাটা বা প্রোফাইল মুছে ফেলার জন্য ২ ধরনের সিস্টেম বাস্তবায়ন করা হয়েছে:

### ক. অ্যাডমিন কর্তৃক যেকোনো ব্যবহারকারীর ডাটা স্থায়ীভাবে মুছে ফেলা (Admin Delete User)
- **কোথায় পাবেন:** অ্যাডমিন ড্যাশবোর্ড (`AdminDashboard.tsx`) -> `ব্যবহারকারী ও সদস্য তালিকা` ট্যাব (`AdminUsersTab.tsx`) অথবা `স্থগিত ও ব্লককৃত অ্যাকাউন্ট` ট্যাব (`AdminBlockedUsersTab.tsx`)।
- **UI কম্পোনেন্ট:** `client/src/components/admin/AdminDeleteUserModal.tsx`
- **Frontend API Call:** `api.adminDeleteUser(userId)`
- **Backend Route:** `DELETE /api/admin/users/:id` (`server/src/routes/adminRoutes.ts`)
- **Backend Controller:** `deleteUserByAdmin` (`server/src/controllers/adminController.ts`)
- **DataStore Method:** `dataStore.deleteUser(userId)` (`server/src/services/dataStore.ts`)
- **কী কী মুছে যায়:**
  1. `UserModel` ও `dataStore.users` থেকে ব্যবহারকারীর মূল অ্যাকাউন্ট।
  2. `DonorProfileModel` ও `dataStore.donorProfiles` থেকে রক্তদাতার প্রোফাইল ও রক্তদানের হিস্ট্রি।
  3. `BloodRequestModel` থেকে ব্যবহারকারীর পোস্ট করা রক্তের অনুরোধসমূহ।
  4. `NotificationModel` থেকে সংশ্লিষ্ট সকল নোটিফিকেশন।
  5. `ContactRequestModel` ও `ContactAccessLogModel` থেকে ফোন প্রকাশের লগ ও অনুরোধ।
  6. `PhoneChangeRequestModel`, `InstitutionChangeRequestModel`, `PasswordRecoveryRequestModel` ইত্যাদি।
  7. অডিট ট্রেইলে `ADMIN_DELETE_USER` অ্যাকশন স্বয়ংক্রিয়ভাবে রেকর্ড হয়।

### খ. অ্যাডমিন কর্তৃক শুধুমাত্র রক্তদাতার প্রোফাইল অপসারণ (Admin Delete Donor Profile)
- **কোথায় পাবেন:** `AdminDashboard.tsx` -> `রক্তদাতা ডিরেক্টরি প্রোফাইল` ট্যাব (`AdminDonorsTab.tsx`)।
- **UI কম্পোনেন্ট:** `client/src/components/admin/AdminDeleteDonorModal.tsx`
- **Frontend API Call:** `api.adminDeleteDonorProfile(donorId)`
- **Backend Route:** `DELETE /api/admin/donors/:id`
- **Backend Controller:** `deleteDonorByAdmin`
- **DataStore Method:** `dataStore.deleteDonorProfile(targetId)`
- **কার্যকারিতা:** রক্তদাতাকে পাবলিক সার্চ ও তালিকা থেকে সরিয়ে নেওয়া হয়, তবে তার সাধারণ ইউজার অ্যাকাউন্ট সচল থাকে।

### গ. ব্যবহারকারী কর্তৃক নিজের প্রোফাইল/অ্যাকাউন্ট মুছে ফেলা (Self User Account Deletion)
- **কোথায় পাবেন:** প্রোফাইল সেটিংস পেজ (`ProfileSettings.tsx`) -> নিচের লাল ডেঞ্জার জোন (`ProfileDangerZone.tsx`)।
- **UI কম্পোনেন্ট:** `client/src/components/profile/ProfileDangerZone.tsx`
- **বিকল্প ১ (রক্তদাতা তালিকা থেকে নিজেকে প্রত্যাহার):**
  - API: `api.deleteMyDonorProfile()` -> `DELETE /api/donors/me` (`donorController.deleteMyDonorProfile`)
  - রক্তদাতার তথ্য মুছে যায়, কিন্তু ইউজার লগইন অক্ষুণ্ণ থাকে।
- **বিকল্প ২ (সম্পূর্ণ অ্যাকাউন্ট ও ডাটা স্থায়ীভাবে নিশ্চিহ্নকরণ):**
  - "DELETE" বা "মুছে ফেলুন" লিখে কনফার্ম করতে হয়।
  - API: `api.deleteMyAccount()` -> `DELETE /api/auth/me` (`authController.deleteMyAccount`)
  - অ্যাকাউন্ট ও সমস্ত ডাটা স্থায়ীভাবে মুছে যায়, ইউজার স্বয়ংক্রিয়ভাবে লগআউট হয়ে হোমপেজে রিডাইরেক্ট হয়।

---

## ৩. সম্পূর্ণ ফোল্ডার ও ফাইল ম্যাপ (Detailed Codebase Map)

```
c:\BLOOD DONATION_bangla\
│
├── package.json                 # মূল রুট কনফিগ ও স্ক্রিপ্টস (dev, build, test, seed)
├── README.md                    # প্রজেক্ট পরিচিতি ও রান করার নিয়ম
├── AI_PROJECT_ARCHITECTURE_AND_INSTRUCTIONS.md # এই মাস্টার এআই গাইড
├── vercel.json                  # ভার্সেল ডেপ্লয়মেন্ট রিরাইট রুলস
│
├── client/                      # ফ্রন্টএন্ড ক্লায়েন্ট (React + Vite + Tailwind CSS)
│   ├── package.json             # ক্লায়েন্ট ডিপেন্ডেন্সি ও বিল্ড স্ক্রিপ্ট
│   ├── vite.config.ts           # Vite কনফিগারেশন
│   ├── tailwind.config.js       # Tailwind CSS থিম ও কালার কনফিগারেশন
│   └── src/
│       ├── App.tsx              # রুট রাউটিং (React Router) ও প্রটেক্টেড রুটস
│       ├── main.tsx             # React ডম রেন্ডারিং ও প্রোভাইডার
│       ├── index.css            # গ্লোবাল সিএসএস ও Tailwind ডিরেক্টিভ
│       │
│       ├── api/                 # ব্যাকএন্ড API কমিউনিকেশন
│       │   └── client.ts        # কেন্দ্রীয় API ক্লায়েন্ট (fetchWithAuth, ইউজার ডিলিট, আপডেট, অডিট)
│       │
│       ├── context/             # গ্লোবাল স্টেট ম্যানেজমেন্ট
│       │   └── AuthContext.tsx  # অথেনটিকেশন স্টেট, টোকেন, লগইন, লগআউট, রিফ্রেশ
│       │
│       ├── data/                # স্ট্যাটিক ডাটা ও কনফিগারেশন
│       │   └── bangladeshLocations.ts # বাংলাদেশের ৬৪ জেলা, ৮ বিভাগ, উপজেলা ও রক্তের গ্রুপ
│       │
│       ├── types/               # TypeScript টাইপ ডেফিনেশন
│       │   └── index.ts         # User, DonorProfile, BloodRequest, Institution ইত্যাদি টাইপস
│       │
│       ├── components/          # রিইউজেবল UI কম্পোনেন্টস
│       │   │
│       │   ├── admin/           # অ্যাডমিন ড্যাশবোর্ডের ডেডিকেটেড সাব-কম্পোনেন্টস
│       │   │   ├── AdminOverviewTab.tsx        # ওভারভিউ কেপিআই কার্ডস, চার্টস ও নিরাপত্তা নীতি
│       │   │   ├── AdminUsersTab.tsx           # সদস্য তালিকা, ফিল্টার, ভূমিকা পরিবর্তন ও ডিলিট
│       │   │   ├── AdminDonorsTab.tsx          # রক্তদাতা ডিরেক্টরি ও প্রোফাইল অপসারণ
│       │   │   ├── AdminBlockedUsersTab.tsx    # ব্লকড অ্যাকাউন্টস তালিকা, আনব্লক ও ডিলিট
│       │   │   ├── AdminDeleteUserModal.tsx    # ইউজার ও সমস্ত ডাটা স্থায়ীভাবে ডিলিট মোডাল
│       │   │   └── AdminDeleteDonorModal.tsx   # রক্তদাতার প্রোফাইল অপসারণ মোডাল
│       │   │
│       │   ├── profile/         # ইউজার প্রোফাইল সেটিংসের ডেডিকেটেড সাব-কম্পোনেন্টস
│       │   │   ├── ProfilePhoneSection.tsx     # ফোন প্রদর্শন ও নম্বর পরিবর্তন আবেদন
│       │   │   ├── ProfileInstitutionSection.tsx # ক্যাম্পাস সংযুক্তি ও প্রতিষ্ঠান পরিবর্তন
│       │   │   ├── ProfilePersonalForm.tsx     # নাম, লিঙ্গ, এলাকা, রক্তের গ্রুপ, বায়ো ফর্ম
│       │   │   └── ProfileDangerZone.tsx       # প্রোফাইল ও অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলার জোন
│       │   │
│       │   ├── ui/              # এটমিক UI ডিজাইন কম্পোনেন্টস
│       │   │   ├── Badge.tsx         # স্ট্যাটাস ব্যাজ
│       │   │   ├── Button.tsx        # অ্যাকশন বাটন ও লোডিং স্টেট
│       │   │   ├── Modal.tsx         # এক্সেসিবল মোডাল ডায়ালগ
│       │   │   ├── StatsCard.tsx     # কেপিআই কার্ডস
│       │   │   ├── SvgCharts.tsx     # পিওর এসভিজি বারচার্ট, লাইনচার্ট, ডোনাট চার্ট
│       │   │   └── Breadcrumb.tsx    # ন্যাভিগেশন ব্রেডক্রাম্ব
│       │   │
│       │   ├── Navbar.tsx                # টপ ন্যাভিগেশন বার
│       │   ├── Footer.tsx                # ফুটার সেকশন
│       │   ├── LocationSelector.tsx      # ৩ স্তরের এলাকা নির্বাচক (বিভাগ -> জেলা -> উপজেলা)
│       │   ├── DonorCard.tsx             # রক্তদাতার কার্ড ভিউ
│       │   ├── RequestCard.tsx           # রক্তের অনুরোধের কার্ড ভিউ
│       │   └── DigitalBloodRequestCard.tsx # ডিজিটাল রক্তের পোস্টার ও কিউআর কার্ড
│       │
│       └── pages/               # পেজ লেভেল কম্পোনেন্টস
│           ├── Home.tsx                  # ল্যান্ডিং ও হোমপেজ
│           ├── AdminDashboard.tsx        # অ্যাডমিন ড্যাশবোর্ড (ট্যাবস সমন্বয়কারী)
│           ├── ProfileSettings.tsx       # ব্যবহারকারীর প্রোফাইল ও অ্যাকাউন্ট সেটিংস
│           ├── DonorSearch.tsx           # পাবলিক রক্তদাতা অনুসন্ধান
│           ├── BloodRequests.tsx         # সক্রিয় রক্তের অনুরোধ ফিড
│           ├── CreateBloodRequest.tsx    # রক্তের নতুন জরুরি অনুরোধ তৈরি
│           ├── BloodRequestLanding.tsx   # কিউআর কোড ল্যান্ডিং পেজ
│           ├── DonorRegister.tsx         # নতুন রক্তদাতা নিবন্ধন
│           ├── Login.tsx                 # লগইন ও ওটিপি ভেরিফিকেশন
│           ├── DonorDashboard.tsx        # রক্তদাতার নিজস্ব ড্যাশবোর্ড
│           ├── RequesterDashboard.tsx    # রক্তপ্রার্থীর নিজস্ব ড্যাশবোর্ড
│           ├── CoordinatorDashboard.tsx  # বিভাগীয় সমন্বয়ক ড্যাশবোর্ড
│           ├── ModeratorDashboard.tsx    # ক্যাম্পাস মডারেটর ড্যাশবোর্ড
│           ├── InstitutionHeadDashboard.tsx # প্রতিষ্ঠান প্রধান ড্যাশবোর্ড
│           ├── InstitutionDirectory.tsx  # অনুমোদিত শিক্ষা প্রতিষ্ঠানের তালিকা
│           └── InstitutionDetail.tsx     # নির্দিষ্ট ক্যাম্পাসের রক্তদান কার্যক্রম
│
└── server/                      # ব্যাকএন্ড সার্ভার (Node.js + Express + TypeScript)
    ├── package.json             # সার্ভার ডিপেন্ডেন্সি ও স্ক্রিপ্টস
    ├── index.cjs                # বান্ডল্ড প্রোডাকশন এন্ট্রি পয়েন্ট
    └── src/
        ├── app.ts               # Express অ্যাপ কনফিগারেশন, মিডলওয়্যার ও গ্লোবাল এরর হ্যান্ডলার
        ├── index.ts             # সার্ভার স্টার্টআপ ও ডাটাবেস কানেকশন
        │
        ├── config/              # কনফিগারেশন
        │   ├── db.ts            # MongoDB Atlas ক্লাউড কানেকশন ও ফলব্যাক লজিক
        │   └── env.ts           # টাইপ-সেফ এনভায়রনমেন্ট ভেরিয়েবলস
        │
        ├── data/                # ব্যাকএন্ড স্ট্যাটিক ডাটা
        │   └── bangladeshLocations.ts # জিওগ্রাফিক্যাল রেফারেন্স ডাটা
        │
        ├── models/              # Mongoose ডাটাবেস স্কিমাস ও মডেলস
        │   ├── User.ts                  # ব্যবহারকারী অ্যাকাউন্ট স্কিমা
        │   ├── DonorProfile.ts          # রক্তদাতা প্রোফাইল স্কিমা
        │   ├── BloodRequest.ts          # রক্তের অনুরোধ ও ইউনিট অগ্রগতি স্কিমা
        │   ├── Institution.ts           # শিক্ষা প্রতিষ্ঠান স্কিমা
        │   ├── InstitutionRequest.ts    # নতুন প্রতিষ্ঠান আবেদন স্কিমা
        │   ├── InstitutionChangeRequest.ts # প্রতিষ্ঠান পরিবর্তন আবেদন স্কিমা
        │   ├── PhoneChangeRequest.ts    # ফোন নম্বর পরিবর্তন আবেদন স্কিমা
        │   ├── ContactRequest.ts        # ফোন প্রকাশের অনুরোধ স্কিমা
        │   ├── ContactAccessLog.ts      # ফোন প্রকাশ ট্র্যাকিং অডিট স্কিমা
        │   ├── AccountStatusHistory.ts  # অ্যাকাউন্ট ব্লক/আনব্লক ইতিহাস স্কিমা
        │   ├── AuditLog.ts              # কেন্দ্রীয় প্রশাসনিক অডিট লগ স্কিমা
        │   ├── Notification.ts          # নোটিফিকেশন স্কিমা
        │   └── OtpVerification.ts       # ওটিপি ভেরিফিকেশন স্কিমা
        │
        ├── services/            # কোর বিজনেস লজিক সার্ভিসেস
        │   ├── dataStore.ts     # ইন-মেমোরি ও মঙ্গোডিবি ডুয়াল-লেয়ার ডাটা স্টোর (deleteUser সহ)
        │   └── auditService.ts  # প্রশাসনিক অডিট লগ রেকর্ডার
        │
        ├── controllers/         # HTTP রিকোয়েস্ট কন্ট্রোলারস
        │   ├── adminController.ts       # অ্যাডমিন ওভারভিউ, ইউজার এডিট, রোল, ব্লক ও deleteUserByAdmin
        │   ├── authController.ts        # লগইন, ওটিপি, পাসওয়ার্ড রিকভারি ও deleteMyAccount
        │   ├── donorController.ts       # রক্তদাতা সার্চ, কন্টাক্ট রিভিল ও deleteMyDonorProfile
        │   ├── requestController.ts     # রক্তের অনুরোধ তৈরি, কিউআর ও ইউনিট আপডেট
        │   ├── institutionController.ts # শিক্ষা প্রতিষ্ঠান ম্যানেজমেন্ট
        │   ├── coordinatorController.ts # বিভাগীয় সমন্বয়ক অ্যাকশনস
        │   └── moderatorController.ts   # ক্যাম্পাস মডারেটর মেম্বার ম্যানেজমেন্ট
        │
        ├── routes/              # Express API রাউটস
        │   ├── index.ts                 # সেন্ট্রাল রাউটার মাউন্টিং ও হেলথ চেক
        │   ├── adminRoutes.ts           # /api/admin/* (DELETE /users/:id সহ)
        │   ├── authRoutes.ts            # /api/auth/* (DELETE /me সহ)
        │   ├── donorRoutes.ts           # /api/donors/* (DELETE /me সহ)
        │   ├── requestRoutes.ts         # /api/requests/*
        │   ├── institutionRoutes.ts     # /api/institutions/*
        │   ├── coordinatorRoutes.ts     # /api/coordinators/*
        │   └── moderatorRoutes.ts       # /api/moderators/*
        │
        ├── middleware/          # মিডলওয়্যারসমূহ
        │   ├── auth.ts                  # JWT ভেরিফিকেশন ও RBAC পারমিশন গার্ডস
        │   ├── validate.ts              # Zod স্কিমা ইনপুট ভ্যালিডেশন
        │   └── rateLimiter.ts           # রেট লিমিটিং প্রটেকশন
        │
        └── tests/               # স্বয়ংক্রিয় টেস্ট স্যুট
            ├── user_and_profile_deletion.test.ts # ইউজার ও প্রোফাইল ডিলিট টেস্ট
            ├── advanced_admin.test.ts            # অ্যাডমিন গার্ডস ও পারমিশন টেস্ট
            └── ...
```

---

## ৪. কীভাবে নতুন ফিচার বা কোড যোগ করবেন (Future Development Rules)

- **নতুন UI ফিচার তৈরি করার সময়:**
  - সরাসরি কোনো পেজে শত শত লাইন কোড লিখবেন না।
  - `client/src/components/<feature_name>/` ফোল্ডার বানিয়ে সেখানে আলাদা ফাইলে কোড রাখবেন।
  - এরপর পেজে সেটি ইমপোর্ট করবেন।
- **নতুন ব্যাকএন্ড API তৈরি করার সময়:**
  - প্রথমে `models/` এ স্কিমা ঠিক করুন।
  - `dataStore.ts` এ মেমোরি ও ডিবি সিন্ক্রোনাইজেশন মেথড লিখুন।
  - `controllers/` এ ফাংশন লিখুন।
  - `routes/` এ রাউট মাউন্ট করুন।
  - `client/src/api/client.ts` এ ফ্রন্টএন্ড ফেচ মেথড যুক্ত করুন।
- **যেকোনো পরিবর্তনের পর বিল্ড টেস্ট:**
  - ফ্রন্টএন্ড: `npm --prefix client run build`
  - ব্যাকএন্ড: `npm --prefix server run build`
  - টেস্ট: `npx tsx --test server/src/tests/<test_name>.test.ts`
