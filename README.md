# বাংলাদেশ রক্তদান প্ল্যাটফর্ম (Bangladesh Blood Donation Platform)

একটি আধুনিক, নিরাপদ, দ্রুত এবং সম্পূর্ণ মোবাইল-বান্ধব রক্তদান সমন্বয় ওয়েব অ্যাপ্লিকেশন। প্ল্যাটফর্মটি বাংলাদেশের ৬৪ জেলার স্বেচ্ছায় রক্তদাতা, রক্তের প্রয়োজনগ্রস্ত পরিবার, স্কুল-কলেজ-বিশ্ববিদ্যালয় ও মেডিকেল ক্যাম্পাসসমূহকে সরাসরি সংযুক্ত করে।

---

## 🌟 মূল বৈশিষ্ট্যসমূহ (Core Features)

1. **রক্তদাতার গোপনীয়তা ও কন্টাক্ট সুরক্ষা (Donor Privacy Protection)**
   - গেস্ট বা পাবলিক সার্চ এপিআই কখনোই রক্তদাতার ফোন নম্বর প্রদর্শন করে না।
   - শুধুমাত্র নিবন্ধিত ও মোবাইল-যাচাইকৃত ব্যবহারকারীরা নিয়ন্ত্রিত প্রক্রিয়ায় নম্বর দেখতে পারেন।
   - ডেটা স্ক্র্যাপিং রোধে দৈনিক সর্বোচ্চ ৫ জনের নম্বর দেখার হার-সীমা (Rate Limiting)।
   - প্রতিটি কন্টাক্ট দেখার তথ্য অপরিবর্তনীয় অডিট ট্রেইলে (`ContactAccessLog`) সংরক্ষিত হয়।

2. **সম্পূর্ণ বাংলাদেশি ভৌগোলিক কাঠামো (Bangladesh Administrative Geography)**
   - ৮টি বিভাগ (ঢাকা, চট্টগ্রাম, রাজশাহী, খুলনা, বরিশাল, সিলেট, রংপুর, ময়মনসিংহ)।
   - ৬৪টি জেলা ও সংশ্লিষ্ট প্রধান উপজেলা/থানা সম্বলিত ক্যাস্কেডিং ড্রপডাউন।

3. **ভূমিকাভিত্তিক নিরাপত্তা ও অনুমতি ব্যবস্থা (Role-Based Access Control)**
   - `SUPER_ADMIN`: কেন্দ্রীয় ব্যবস্থাপনা, ইউজার রোল আপডেট, কন্টাক্ট অডিট পর্যবেক্ষণ (শেষ সুপার এডমিন সুরক্ষা সহ)।
   - `DIVISION_COORDINATOR`: নির্দিষ্ট বিভাগে সীমাবদ্ধ আবেদন ও অভিযোগ পর্যবেক্ষণ।
   - `INSTITUTION_MODERATOR`: নির্দিষ্ট ক্যাম্পাস ও অধিভুক্ত সদস্যদের ড্যাশবোর্ড।
   - `DONOR`: রক্তদানের অবস্থা পরিবর্তন, রক্তদান লিপিবদ্ধকরণ, বায়ো ও নোটিফিকেশন।
   - `REQUESTER`: রক্তের আবেদন তৈরি, সম্পন্ন বা বাতিলকরণ।

4. **জরুরি রক্তের আবেদন ব্যবস্থাপনা (Blood Requests Stream)**
   - রক্তের গ্রুপ, হাসপাতাল, প্রয়োজনীয় রক্তের পরিমাণ ও জরুরি মাত্রা (জরুরি, অতি জরুরি, নিয়মিত)।
   - ১-ক্লিকে ফোন কল ও সোশ্যাল শেয়ার সুবিধা।
   - মেয়াদোত্তীর্ণ অনুরোধসমূহ সক্রিয় ফিড থেকে স্বয়ংক্রিয়ভাবে অপসারিত হয়।

5. **এসএমএস অ্যাডাপ্টার (SMS Provider Architecture)**
   - লোকাল ডেভেলপমেন্ট ও পরীক্ষার জন্য নিরাপদ সিমুলেটেড মক প্রোভাইডার।
   - প্রোডাকশনের জন্য বাংলাদেশি গেটওয়ে (BulkSMSBD, Greenweb, Twilio) সংযুক্তির পরিচ্ছন্ন ইন্টারফেস।

6. **জিরো-কনফিগারেশন ডুয়াল ডেটাবেস ইঞ্জিন (Zero-Config Database Engine)**
   - লোকাল বা ক্লাউড MongoDB থাকলে Mongoose এর মাধ্যমে সরাসরি সংযুক্ত হয়।
   - MongoDB না থাকলে স্বয়ংক্রিয়ভাবে সম্পূর্ণ সিড-ডাটা সম্বলিত মেমোরি ডেটাস্টোরে চালু হয়।

---

## 🛠️ প্রযুক্তি স্ট্যাক (Technology Stack)

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Zod, JWT, Helmet, Express-Rate-Limit, Bcrypt.
- **Database**: MongoDB / Mongoose + Fallback In-Memory Datastore.
- **Typography**: Hind Siliguri, Noto Sans Bengali, Inter.

---

## 🚀 দ্রুত শুরু ও ইনস্টলেশন (Quick Start)

### ১. ডিপেন্ডেন্সি ইনস্টল করুন
```bash
# রুট ডিরেক্টরি থেকে সার্ভার ও ক্লায়েন্ট ইনস্টল:
npm run install:all
```

### ২. এনভায়রনমেন্ট কনফিগারেশন
সার্ভার ডিরেক্টরিতে `.env` ফাইল প্রস্তুত রয়েছে:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/bangladesh_blood_db # (ঐচ্ছিক)
JWT_SECRET=super_secret_jwt_key_change_in_production_2026
SMS_PROVIDER=mock
CLIENT_URL=http://localhost:3000
DAILY_CONTACT_LIMIT=5
```

### ৩. অ্যাপ্লিকেশন চালু করুন
```bash
# সার্ভার চালু (Port 5000):
npm run dev:server

# ক্লায়েন্ট চালু (Port 3000):
npm run dev:client
```
ব্রাউজারে যান: `http://localhost:3000`

---

## 🧪 টেস্ট পরিচালনা (Testing)

ইউনিট টেস্ট ও অনুমতি যাচাই চালাতে:
```bash
cd server
npm test
```
**যাচাইকৃত টেস্ট সিনারিওসমূহ:**
1. গেস্ট রক্তদাতা অনুসন্ধানে ফোন নম্বর গোপন থাকা যাচাই।
2. রক্তদাতার ন্যূনতম বয়স ১৮ বছর নিশ্চিতকরণ।
3. মক এসএমএস সিমুলেটর ওটিপি ডেলিভারি।
4. কন্টাক্ট রিভিল ফ্লোতে অডিট লগ ও সম্মতি যাচাই।
5. শেষ সুপার এডমিনকে পদাবনতি থেকে প্রতিরোধ।
6. মেয়াদোত্তীর্ণ অনুরোধ সক্রিয় তালিকা থেকে বাদ দেওয়া।

---

## 🔑 সুপার অ্যাডমিন কনফিগারেশন (Super Admin Configuration)

প্ল্যাটফর্মের শীর্ষ নিয়ন্ত্রক হিসেবে একটিমাত্র অথরিটেটিভ সুপার অ্যাডমিন অ্যাকাউন্ট অনুমোদিত। সর্বোচ্চ নিরাপত্তার স্বার্থে কোনো ডিফল্ট পাসওয়ার্ড বা মোবাইল নম্বর সোর্স কোডে রাখা হয় না।

এটি স্থানীয় বা ক্লাউড পরিবেশে সম্পূর্ণ গোপনীয় `.env` ফাইলের মাধ্যমে কনফিগার করতে হয়:
- `SUPER_ADMIN_PHONE`: আপনার ব্যক্তিগত মোবাইল নম্বর বা ইউজার আইডি
- `SUPER_ADMIN_PASSWORD`: আপনার গোপন পাসওয়ার্ড
- `SUPER_ADMIN_NAME`: সুপার অ্যাডমিনের নাম
- `SUPER_ADMIN_EMAIL`: ইমেইল ঠিকানা

---

## ☁️ Vercel ডিপ্লয়মেন্ট গাইড (Deploying to Vercel)

প্ল্যাটফর্মটি Vercel-এ ফুলস্ট্যাক (React Frontend + Serverless Express API + MongoDB Atlas) হিসেবে নির্বিঘ্নে হোস্টিংয়ের জন্য সম্পূর্ণ কনফিগার করা আছে।

### ধাপ ১: GitHub রিপোজিটরিতে কোড পুশ করুন
প্রজেক্টের রুট ডিরেক্টরি থেকে কোড গিটহাবে পুশ করুন:
```bash
git add .
git commit -m "Deploy: Vercel serverless integration and MongoDB Atlas configuration"
git push origin master
```

### ধাপ ২: Vercel-এ প্রজেক্ট ইম্পোর্ট করুন
1. [Vercel ড্যাশবোর্ড](https://vercel.com/dashboard)-এ যান এবং **"Add New..." > "Project"** নির্বাচন করুন।
2. আপনার GitHub রিপোজিটরিটি সিলেক্ট করে **Import** বাটনে ক্লিক করুন।
3. **Framework Preset**: `Vite` (স্বয়ংক্রিয়ভাবে ডিটেক্ট হবে)।
4. **Root Directory**: `./` (ডিফল্ট রুট)।
5. **Build and Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `client/dist`

### ধাপ ৩: Environment Variables (পরিবেশ ভেরিয়েবল) যোগ করুন
Vercel প্রজেক্ট সেটিংসে নিচের ভেরিয়েবলগুলো যুক্ত করুন:

| ভেরিয়েবল নাম (Key) | মান (Value) |
|---|---|
| `MONGO_URI` | `mongodb+srv://donor012027_db_user:FqIyqHxV9thNXl4g@cluster0.zbhuecg.mongodb.net/bangladesh_blood_db?retryWrites=true&w=majority` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `dev_bangladesh_blood_platform_key_2026` *(বা আপনার পছন্দের সিক্রেট)* |
| `SMS_PROVIDER` | `mock` |

### ধাপ ৪: ডিপ্লয় করুন (Deploy)
**Deploy** বাটনে চাপ দিন। বিল্ড সম্পন্ন হলে Vercel আপনাকে একটি লাইভ ডোমেন দেবে (যেমন: `https://your-blood-platform.vercel.app`)।
- ফ্রন্টএন্ড এবং ব্যাকএন্ড একই ডোমেনের অধীনে কাজ করবে (`/` এ React UI এবং `/api/*` এ Serverless API)।
- ডেটাবেজ স্বয়ংক্রিয়ভাবে MongoDB Atlas ক্লাস্টারের সাথে সংযুক্ত ও সিঙ্ক্রোনাইজ হবে।

---

## 📡 API ডকুমেন্টেশন (REST Endpoints)

সমস্ত এন্ডপয়েন্ট `/api/v1` প্রিফিক্সে কার্যকর:

- `POST /api/v1/auth/request-otp` - ওটিপি কোড পাঠানো
- `POST /api/v1/auth/verify-otp` - ওটিপি কোড যাচাই
- `POST /api/v1/auth/register` - নতুন রক্তদাতা/প্রত্যাশী নিবন্ধন
- `POST /api/v1/auth/login` - মোবাইল ও পাসওয়ার্ড দিয়ে লগইন
- `GET  /api/v1/auth/me` - বর্তমান লগইনকৃত ইউজারের তথ্য
- `GET  /api/v1/donors/search` - রক্তদাতা ডিরেক্টরি (ফোন নম্বর ব্যতিরেকে)
- `POST /api/v1/donors/reveal-contact/:id` - রক্তদাতার নম্বর উন্মুক্তকরণ (অথেনটিকেটেড + অডিট লগ)
- `PATCH /api/v1/donors/me` - প্রোফাইল ও রক্তদানের অবস্থা পরিবর্তন
- `POST /api/v1/donors/record-donation` - রক্তদান হিস্টোরিতে যোগকরণ
- `GET  /api/v1/requests/search` - চলমান রক্তের অনুরোধের তালিকা
- `POST /api/v1/requests` - নতুন রক্তের আবেদন পোস্ট
- `PATCH /api/v1/requests/:id/status` - অনুরোধের অবস্থা হালনাগাদ
- `GET  /api/v1/institutions` - শিক্ষা প্রতিষ্ঠান ডিরেক্টরি
- `GET  /api/v1/admin/overview` - সিস্টেমের বাস্তব মেট্রিক্স
- `PATCH /api/v1/admin/users/:id/role` - ইউজার রোল পরিবর্তন
- `GET  /api/v1/admin/contact-access-logs` - কন্টাক্ট রিভিল অডিট হিস্টোরি
- `GET  /api/v1/locations` - ৮টি বিভাগ, ৬৪টি জেলা ও প্রধান উপজেলা

