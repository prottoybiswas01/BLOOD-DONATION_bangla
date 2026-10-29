export interface Upazila {
  id: string;
  nameEn: string;
  nameBn: string;
}

export interface District {
  id: string;
  nameEn: string;
  nameBn: string;
  upazilas: Upazila[];
}

export interface Division {
  id: string;
  nameEn: string;
  nameBn: string;
  districts: District[];
}

export const BANGLADESH_DIVISIONS: Division[] = [
  {
    id: 'dhaka',
    nameEn: 'Dhaka',
    nameBn: 'ঢাকা',
    districts: [
      {
        id: 'dhaka',
        nameEn: 'Dhaka',
        nameBn: 'ঢাকা',
        upazilas: [
          { id: 'dhanmondi', nameEn: 'Dhanmondi', nameBn: 'ধানমন্ডি' },
          { id: 'mirpur', nameEn: 'Mirpur', nameBn: 'মিরপুর' },
          { id: 'uttara', nameEn: 'Uttara', nameBn: 'উত্তরা' },
          { id: 'gulshan', nameEn: 'Gulshan', nameBn: 'গুলশান' },
          { id: 'banani', nameEn: 'Banani', nameBn: 'বনানী' },
          { id: 'mohammadpur', nameEn: 'Mohammadpur', nameBn: 'মোহাম্মদপুর' },
          { id: 'motijheel', nameEn: 'Motijheel', nameBn: 'মতিঝিল' },
          { id: 'shahbagh', nameEn: 'Shahbagh', nameBn: 'শাহবাগ' },
          { id: 'savar', nameEn: 'Savar', nameBn: 'সাভার' },
          { id: 'dhamrai', nameEn: 'Dhamrai', nameBn: 'ধামরাই' },
          { id: 'keraniganj', nameEn: 'Keraniganj', nameBn: 'কেরানীগঞ্জ' },
          { id: 'badda', nameEn: 'Badda', nameBn: 'বাড্ডা' },
          { id: 'khilgaon', nameEn: 'Khilgaon', nameBn: 'খিলগাঁও' },
          { id: 'jatrabari', nameEn: 'Jatrabari', nameBn: 'যাত্রাবাড়ী' }
        ]
      },
      {
        id: 'gazipur',
        nameEn: 'Gazipur',
        nameBn: 'গাজীপুর',
        upazilas: [
          { id: 'gazipur_sadar', nameEn: 'Gazipur Sadar', nameBn: 'গাজীপুর সদর' },
          { id: 'kaliakair', nameEn: 'Kaliakair', nameBn: 'কালিয়াকৈর' },
          { id: 'kapasia', nameEn: 'Kapasia', nameBn: 'কাপাসিয়া' },
          { id: 'sreepur', nameEn: 'Sreepur', nameBn: 'শ্রীপুর' },
          { id: 'kaliganj', nameEn: 'Kaliganj', nameBn: 'কালীগঞ্জ' }
        ]
      },
      {
        id: 'narayanganj',
        nameEn: 'Narayanganj',
        nameBn: 'নারায়ণগঞ্জ',
        upazilas: [
          { id: 'narayanganj_sadar', nameEn: 'Narayanganj Sadar', nameBn: 'নারায়ণগঞ্জ সদর' },
          { id: 'bandar', nameEn: 'Bandar', nameBn: 'বন্দর' },
          { id: 'rupganj', nameEn: 'Rupganj', nameBn: 'রূপগঞ্জ' },
          { id: 'sonargaon', nameEn: 'Sonargaon', nameBn: 'সোনারগাঁও' },
          { id: 'araihazar', nameEn: 'Araihazar', nameBn: 'আড়াইহাজার' }
        ]
      },
      {
        id: 'tangail',
        nameEn: 'Tangail',
        nameBn: 'টাঙ্গাইল',
        upazilas: [
          { id: 'tangail_sadar', nameEn: 'Tangail Sadar', nameBn: 'টাঙ্গাইল সদর' },
          { id: 'mirzapur', nameEn: 'Mirzapur', nameBn: 'মির্জাপুর' },
          { id: 'ghatail', nameEn: 'Ghatail', nameBn: 'ঘাটাইল' },
          { id: 'madhupur', nameEn: 'Madhupur', nameBn: 'মধুপুর' }
        ]
      },
      {
        id: 'faridpur',
        nameEn: 'Faridpur',
        nameBn: 'ফরিদপুর',
        upazilas: [
          { id: 'faridpur_sadar', nameEn: 'Faridpur Sadar', nameBn: 'ফরিদপুর সদর' },
          { id: 'bhanga', nameEn: 'Bhanga', nameBn: 'ভাঙ্গা' },
          { id: 'boalmari', nameEn: 'Boalmari', nameBn: 'বোয়ালমারী' }
        ]
      },
      {
        id: 'manikganj',
        nameEn: 'Manikganj',
        nameBn: 'মানিকগঞ্জ',
        upazilas: [
          { id: 'manikganj_sadar', nameEn: 'Manikganj Sadar', nameBn: 'মানিকগঞ্জ সদর' },
          { id: 'singair', nameEn: 'Singair', nameBn: 'সিংগাইর' }
        ]
      },
      {
        id: 'munshiganj',
        nameEn: 'Munshiganj',
        nameBn: 'মুন্সীগঞ্জ',
        upazilas: [
          { id: 'munshiganj_sadar', nameEn: 'Munshiganj Sadar', nameBn: 'মুন্সীগঞ্জ সদর' },
          { id: 'sreenagar', nameEn: 'Sreenagar', nameBn: 'শ্রীনগর' }
        ]
      },
      {
        id: 'narsingdi',
        nameEn: 'Narsingdi',
        nameBn: 'নরসিংদী',
        upazilas: [
          { id: 'narsingdi_sadar', nameEn: 'Narsingdi Sadar', nameBn: 'নরসিংদী সদর' },
          { id: 'shibpur', nameEn: 'Shibpur', nameBn: 'শিবপুর' },
          { id: 'raipura', nameEn: 'Raipura', nameBn: 'রায়পুরা' }
        ]
      },
      {
        id: 'gopalganj',
        nameEn: 'Gopalganj',
        nameBn: 'গোপালগঞ্জ',
        upazilas: [
          { id: 'gopalganj_sadar', nameEn: 'Gopalganj Sadar', nameBn: 'গোপালগঞ্জ সদর' },
          { id: 'tungipara', nameEn: 'Tungipara', nameBn: 'টুঙ্গিপাড়া' }
        ]
      },
      {
        id: 'madaripur',
        nameEn: 'Madaripur',
        nameBn: 'মাদারীপুর',
        upazilas: [
          { id: 'madaripur_sadar', nameEn: 'Madaripur Sadar', nameBn: 'মাদারীপুর সদর' },
          { id: 'shibchar', nameEn: 'Shibchar', nameBn: 'শিবচর' }
        ]
      },
      {
        id: 'rajbari',
        nameEn: 'Rajbari',
        nameBn: 'রাজবাড়ী',
        upazilas: [
          { id: 'rajbari_sadar', nameEn: 'Rajbari Sadar', nameBn: 'রাজবাড়ী সদর' },
          { id: 'pangsha', nameEn: 'Pangsha', nameBn: 'পাংশা' }
        ]
      },
      {
        id: 'shariatpur',
        nameEn: 'Shariatpur',
        nameBn: 'শরীয়তপুর',
        upazilas: [
          { id: 'shariatpur_sadar', nameEn: 'Shariatpur Sadar', nameBn: 'শরীয়তপুর সদর' },
          { id: 'zajira', nameEn: 'Zajira', nameBn: 'জাজিরা' }
        ]
      },
      {
        id: 'kishoreganj',
        nameEn: 'Kishoreganj',
        nameBn: 'কিশোরগঞ্জ',
        upazilas: [
          { id: 'kishoreganj_sadar', nameEn: 'Kishoreganj Sadar', nameBn: 'কিশোরগঞ্জ সদর' },
          { id: 'bhairab', nameEn: 'Bhairab', nameBn: 'ভৈরব' }
        ]
      }
    ]
  },
  {
    id: 'chattogram',
    nameEn: 'Chattogram',
    nameBn: 'চট্টগ্রাম',
    districts: [
      {
        id: 'chattogram',
        nameEn: 'Chattogram',
        nameBn: 'চট্টগ্রাম',
        upazilas: [
          { id: 'kotwali_ctg', nameEn: 'Kotwali', nameBn: 'কোতোয়ালী' },
          { id: 'panchlaish', nameEn: 'Panchlaish', nameBn: 'পাঁচলাইশ' },
          { id: 'halishahar', nameEn: 'Halishahar', nameBn: 'হালিশহর' },
          { id: 'agrabad', nameEn: 'Agrabad', nameBn: 'আগ্রাবাদ' },
          { id: 'hathazari', nameEn: 'Hathazari', nameBn: 'হাটহাজারী' },
          { id: 'sitakunda', nameEn: 'Sitakunda', nameBn: 'সীতাকুণ্ড' },
          { id: 'mirsharai', nameEn: 'Mirsharai', nameBn: 'মীরসরাই' },
          { id: 'patiya', nameEn: 'Patiya', nameBn: 'পটিয়া' },
          { id: 'raozan', nameEn: 'Raozan', nameBn: 'রাউজান' }
        ]
      },
      {
        id: 'coxsbazar',
        nameEn: "Cox's Bazar",
        nameBn: 'কক্সবাজার',
        upazilas: [
          { id: 'coxsbazar_sadar', nameEn: "Cox's Bazar Sadar", nameBn: 'কক্সবাজার সদর' },
          { id: 'ramu', nameEn: 'Ramu', nameBn: 'রামু' },
          { id: 'teknaf', nameEn: 'Teknaf', nameBn: 'টেকনাফ' },
          { id: 'chakaria', nameEn: 'Chakaria', nameBn: 'চকোরিয়া' }
        ]
      },
      {
        id: 'cumilla',
        nameEn: 'Cumilla',
        nameBn: 'কুমিল্লা',
        upazilas: [
          { id: 'cumilla_adarsha_sadar', nameEn: 'Adarsha Sadar', nameBn: 'আদর্শ সদর' },
          { id: 'laksham', nameEn: 'Laksham', nameBn: 'লাকসাম' },
          { id: 'chandina', nameEn: 'Chandina', nameBn: 'চান্দিনা' },
          { id: 'debidwar', nameEn: 'Debidwar', nameBn: 'দেবিদ্বার' }
        ]
      },
      {
        id: 'feni',
        nameEn: 'Feni',
        nameBn: 'ফেনী',
        upazilas: [
          { id: 'feni_sadar', nameEn: 'Feni Sadar', nameBn: 'ফেনী সদর' },
          { id: 'daganbhuiyan', nameEn: 'Daganbhuiyan', nameBn: 'দাগনভূঞা' },
          { id: 'parshuram', nameEn: 'Parshuram', nameBn: 'পরশুরাম' }
        ]
      },
      {
        id: 'brahmanbaria',
        nameEn: 'Brahmanbaria',
        nameBn: 'ব্রাহ্মণবাড়িয়া',
        upazilas: [
          { id: 'brahmanbaria_sadar', nameEn: 'Brahmanbaria Sadar', nameBn: 'ব্রাহ্মণবাড়িয়া সদর' },
          { id: 'ashuganj', nameEn: 'Ashuganj', nameBn: 'আশুগঞ্জ' },
          { id: 'sarail', nameEn: 'Sarail', nameBn: 'সরাইল' }
        ]
      },
      {
        id: 'chandpur',
        nameEn: 'Chandpur',
        nameBn: 'চাঁদপুর',
        upazilas: [
          { id: 'chandpur_sadar', nameEn: 'Chandpur Sadar', nameBn: 'চাঁদপুর সদর' },
          { id: 'hajiganj', nameEn: 'Hajiganj', nameBn: 'হাজীগঞ্জ' },
          { id: 'matlab', nameEn: 'Matlab', nameBn: 'মতলব' }
        ]
      },
      {
        id: 'noakhali',
        nameEn: 'Noakhali',
        nameBn: 'নোয়াখালী',
        upazilas: [
          { id: 'noakhali_sadar', nameEn: 'Noakhali Sadar', nameBn: 'নোয়াখালী সদর' },
          { id: 'begumganj', nameEn: 'Begumganj', nameBn: 'বেগমগঞ্জ' },
          { id: 'senbagh', nameEn: 'Senbagh', nameBn: 'সেনবাগ' }
        ]
      },
      {
        id: 'lakshmipur',
        nameEn: 'Lakshmipur',
        nameBn: 'লক্ষ্মীপুর',
        upazilas: [
          { id: 'lakshmipur_sadar', nameEn: 'Lakshmipur Sadar', nameBn: 'লক্ষ্মীপুর সদর' },
          { id: 'ramganj', nameEn: 'Ramganj', nameBn: 'রামগঞ্জ' },
          { id: 'raipur', nameEn: 'Raipur', nameBn: 'রায়পুর' }
        ]
      },
      {
        id: 'rangamati',
        nameEn: 'Rangamati',
        nameBn: 'রাঙ্গামাটি',
        upazilas: [
          { id: 'rangamati_sadar', nameEn: 'Rangamati Sadar', nameBn: 'রাঙ্গামাটি সদর' },
          { id: 'kaptai', nameEn: 'Kaptai', nameBn: 'কাপ্তাই' }
        ]
      },
      {
        id: 'khagrachhari',
        nameEn: 'Khagrachhari',
        nameBn: 'খাগড়াছড়ি',
        upazilas: [
          { id: 'khagrachhari_sadar', nameEn: 'Khagrachhari Sadar', nameBn: 'খাগড়াছড়ি সদর' },
          { id: 'dighinala', nameEn: 'Dighinala', nameBn: 'দীঘিনালা' }
        ]
      },
      {
        id: 'bandarban',
        nameEn: 'Bandarban',
        nameBn: 'বান্দরবান',
        upazilas: [
          { id: 'bandarban_sadar', nameEn: 'Bandarban Sadar', nameBn: 'বান্দরবান সদর' },
          { id: 'thanchi', nameEn: 'Thanchi', nameBn: 'থানচি' }
        ]
      }
    ]
  },
  {
    id: 'rajshahi',
    nameEn: 'Rajshahi',
    nameBn: 'রাজশাহী',
    districts: [
      {
        id: 'rajshahi',
        nameEn: 'Rajshahi',
        nameBn: 'রাজশাহী',
        upazilas: [
          { id: 'boalia', nameEn: 'Boalia', nameBn: 'বোয়ালিয়া' },
          { id: 'rajpara', nameEn: 'Rajpara', nameBn: 'রাজপাড়া' },
          { id: 'motihar', nameEn: 'Motihar', nameBn: 'মতিহার' },
          { id: 'godagari', nameEn: 'Godagari', nameBn: 'গোদাগাড়ী' },
          { id: 'paba', nameEn: 'Paba', nameBn: 'পবা' }
        ]
      },
      {
        id: 'bogura',
        nameEn: 'Bogura',
        nameBn: 'বগুড়া',
        upazilas: [
          { id: 'bogura_sadar', nameEn: 'Bogura Sadar', nameBn: 'বগুড়া সদর' },
          { id: 'sherpur', nameEn: 'Sherpur', nameBn: 'শেরপুর' },
          { id: 'shibganj', nameEn: 'Shibganj', nameBn: 'শিবগঞ্জ' }
        ]
      },
      {
        id: 'pabna',
        nameEn: 'Pabna',
        nameBn: 'পাবনা',
        upazilas: [
          { id: 'pabna_sadar', nameEn: 'Pabna Sadar', nameBn: 'পাবনা সদর' },
          { id: 'ishwardi', nameEn: 'Ishwardi', nameBn: 'ঈশ্বরদী' }
        ]
      },
      {
        id: 'sirajganj',
        nameEn: 'Sirajganj',
        nameBn: 'সিরাজগঞ্জ',
        upazilas: [
          { id: 'sirajganj_sadar', nameEn: 'Sirajganj Sadar', nameBn: 'সিরাজগঞ্জ সদর' },
          { id: 'shahjadpur', nameEn: 'Shahjadpur', nameBn: 'শাহজাদপুর' },
          { id: 'ullapara', nameEn: 'Ullapara', nameBn: 'উল্লাপাড়া' }
        ]
      },
      {
        id: 'naogaon',
        nameEn: 'Naogaon',
        nameBn: 'নওগাঁ',
        upazilas: [
          { id: 'naogaon_sadar', nameEn: 'Naogaon Sadar', nameBn: 'নওগাঁ সদর' },
          { id: 'patnitala', nameEn: 'Patnitala', nameBn: 'পত্নীতলা' }
        ]
      },
      {
        id: 'natore',
        nameEn: 'Natore',
        nameBn: 'নাটোর',
        upazilas: [
          { id: 'natore_sadar', nameEn: 'Natore Sadar', nameBn: 'নাটোর সদর' },
          { id: 'singra', nameEn: 'Singra', nameBn: 'সিংড়া' }
        ]
      },
      {
        id: 'chapainawabganj',
        nameEn: 'Chapainawabganj',
        nameBn: 'চাঁপাইনবাবগঞ্জ',
        upazilas: [
          { id: 'nawabganj_sadar', nameEn: 'Nawabganj Sadar', nameBn: 'নবাবগঞ্জ সদর' },
          { id: 'shibganj_c', nameEn: 'Shibganj', nameBn: 'শিবগঞ্জ' }
        ]
      },
      {
        id: 'joypurhat',
        nameEn: 'Joypurhat',
        nameBn: 'জয়পুরহাট',
        upazilas: [
          { id: 'joypurhat_sadar', nameEn: 'Joypurhat Sadar', nameBn: 'জয়পুরহাট সদর' },
          { id: 'panchbibi', nameEn: 'Panchbibi', nameBn: 'পাঁচবিবি' }
        ]
      }
    ]
  },
  {
    id: 'khulna',
    nameEn: 'Khulna',
    nameBn: 'খুলনা',
    districts: [
      {
        id: 'khulna',
        nameEn: 'Khulna',
        nameBn: 'খুলনা',
        upazilas: [
          { id: 'khulna_sadar', nameEn: 'Khulna Sadar', nameBn: 'খুলনা সদর' },
          { id: 'sonadanga', nameEn: 'Sonadanga', nameBn: 'সোনাডাঙ্গা' },
          { id: 'khalishpur', nameEn: 'Khalishpur', nameBn: 'খালিশপুর' },
          { id: 'daulatpur', nameEn: 'Daulatpur', nameBn: 'দৌলতপুর' },
          { id: 'dumuria', nameEn: 'Dumuria', nameBn: 'ডুমুরিয়া' }
        ]
      },
      {
        id: 'jashore',
        nameEn: 'Jashore',
        nameBn: 'যশোর',
        upazilas: [
          { id: 'jashore_sadar', nameEn: 'Jashore Sadar', nameBn: 'যশোর সদর' },
          { id: 'jhikargachha', nameEn: 'Jhikargachha', nameBn: 'ঝিকরগাছা' },
          { id: 'keshabpur', nameEn: 'Keshabpur', nameBn: 'কেশবপুর' }
        ]
      },
      {
        id: 'kushtia',
        nameEn: 'Kushtia',
        nameBn: 'কুষ্টিয়া',
        upazilas: [
          { id: 'kushtia_sadar', nameEn: 'Kushtia Sadar', nameBn: 'কুষ্টিয়া সদর' },
          { id: 'kumarkhali', nameEn: 'Kumarkhali', nameBn: 'কুমারখালী' }
        ]
      },
      {
        id: 'satkhira',
        nameEn: 'Satkhira',
        nameBn: 'সাতক্ষীরা',
        upazilas: [
          { id: 'satkhira_sadar', nameEn: 'Satkhira Sadar', nameBn: 'সাতক্ষীরা সদর' },
          { id: 'kaliganj_sat', nameEn: 'Kaliganj', nameBn: 'কালীগঞ্জ' }
        ]
      },
      {
        id: 'bagerhat',
        nameEn: 'Bagerhat',
        nameBn: 'বাগেরহাট',
        upazilas: [
          { id: 'bagerhat_sadar', nameEn: 'Bagerhat Sadar', nameBn: 'বাগেরহাট সদর' },
          { id: 'mongla', nameEn: 'Mongla', nameBn: 'মোংলা' }
        ]
      },
      {
        id: 'jhenaidah',
        nameEn: 'Jhenaidah',
        nameBn: 'ঝিনাইদহ',
        upazilas: [
          { id: 'jhenaidah_sadar', nameEn: 'Jhenaidah Sadar', nameBn: 'ঝিনাইদহ সদর' },
          { id: 'kaliganj_jhen', nameEn: 'Kaliganj', nameBn: 'কালীগঞ্জ' }
        ]
      },
      {
        id: 'chuadanga',
        nameEn: 'Chuadanga',
        nameBn: 'চুয়াডাঙ্গা',
        upazilas: [
          { id: 'chuadanga_sadar', nameEn: 'Chuadanga Sadar', nameBn: 'চুয়াডাঙ্গা সদর' },
          { id: 'damurhuda', nameEn: 'Damurhuda', nameBn: 'দামুড়হুদা' }
        ]
      },
      {
        id: 'magura',
        nameEn: 'Magura',
        nameBn: 'মাগুরা',
        upazilas: [
          { id: 'magura_sadar', nameEn: 'Magura Sadar', nameBn: 'মাগুরা সদর' },
          { id: 'sreepur_mag', nameEn: 'Sreepur', nameBn: 'শ্রীপুর' }
        ]
      },
      {
        id: 'meherpur',
        nameEn: 'Meherpur',
        nameBn: 'মেহেরপুর',
        upazilas: [
          { id: 'meherpur_sadar', nameEn: 'Meherpur Sadar', nameBn: 'মেহেরপুর সদর' },
          { id: 'gangni', nameEn: 'Gangni', nameBn: 'গাংনী' }
        ]
      },
      {
        id: 'narail',
        nameEn: 'Narail',
        nameBn: 'নড়াইল',
        upazilas: [
          { id: 'narail_sadar', nameEn: 'Narail Sadar', nameBn: 'নড়াইল সদর' },
          { id: 'lohagagara', nameEn: 'Lohagara', nameBn: 'লোহাগড়া' }
        ]
      }
    ]
  },
  {
    id: 'barishal',
    nameEn: 'Barishal',
    nameBn: 'বরিশাল',
    districts: [
      {
        id: 'barishal',
        nameEn: 'Barishal',
        nameBn: 'বরিশাল',
        upazilas: [
          { id: 'barishal_sadar', nameEn: 'Barishal Sadar', nameBn: 'বরিশাল সদর' },
          { id: 'bakerganj', nameEn: 'Bakerganj', nameBn: 'বাকেরগঞ্জ' },
          { id: 'babuganj', nameEn: 'Babuganj', nameBn: 'বাবুগঞ্জ' }
        ]
      },
      {
        id: 'patuakhali',
        nameEn: 'Patuakhali',
        nameBn: 'পটুয়াখালী',
        upazilas: [
          { id: 'patuakhali_sadar', nameEn: 'Patuakhali Sadar', nameBn: 'পটুয়াখালী সদর' },
          { id: 'kalapara', nameEn: 'Kalapara', nameBn: 'কলাপাড়া' }
        ]
      },
      {
        id: 'bhola',
        nameEn: 'Bhola',
        nameBn: 'ভোলা',
        upazilas: [
          { id: 'bhola_sadar', nameEn: 'Bhola Sadar', nameBn: 'ভোলা সদর' },
          { id: 'charfasson', nameEn: 'Charfasson', nameBn: 'চরফ্যাশন' }
        ]
      },
      {
        id: 'pirojpur',
        nameEn: 'Pirojpur',
        nameBn: 'পিরোজপুর',
        upazilas: [
          { id: 'pirojpur_sadar', nameEn: 'Pirojpur Sadar', nameBn: 'পিরোজপুর সদর' },
          { id: 'mathbaria', nameEn: 'Mathbaria', nameBn: 'মঠবাড়িয়া' }
        ]
      },
      {
        id: 'barguna',
        nameEn: 'Barguna',
        nameBn: 'বরগুনা',
        upazilas: [
          { id: 'barguna_sadar', nameEn: 'Barguna Sadar', nameBn: 'বরগুনা সদর' },
          { id: 'amtali', nameEn: 'Amtali', nameBn: 'আমতলী' }
        ]
      },
      {
        id: 'jhalokati',
        nameEn: 'Jhalokati',
        nameBn: 'ঝালকাঠি',
        upazilas: [
          { id: 'jhalokati_sadar', nameEn: 'Jhalokati Sadar', nameBn: 'ঝালকাঠি সদর' },
          { id: 'nalchity', nameEn: 'Nalchity', nameBn: 'নলছিটি' }
        ]
      }
    ]
  },
  {
    id: 'sylhet',
    nameEn: 'Sylhet',
    nameBn: 'সিলেট',
    districts: [
      {
        id: 'sylhet',
        nameEn: 'Sylhet',
        nameBn: 'সিলেট',
        upazilas: [
          { id: 'sylhet_sadar', nameEn: 'Sylhet Sadar', nameBn: 'সিলেট সদর' },
          { id: 'beanibazar', nameEn: 'Beanibazar', nameBn: 'বিয়ানীবাজার' },
          { id: 'golapganj', nameEn: 'Golapganj', nameBn: 'গোলাপগঞ্জ' },
          { id: 'bishwanath', nameEn: 'Bishwanath', nameBn: 'বিশ্বনাথ' }
        ]
      },
      {
        id: 'moulvibazar',
        nameEn: 'Moulvibazar',
        nameBn: 'মৌলভীবাজার',
        upazilas: [
          { id: 'moulvibazar_sadar', nameEn: 'Moulvibazar Sadar', nameBn: 'মৌলভীবাজার সদর' },
          { id: 'sreemangal', nameEn: 'Sreemangal', nameBn: 'শ্রীমঙ্গল' },
          { id: 'kulaura', nameEn: 'Kulaura', nameBn: 'কুলাউড়া' }
        ]
      },
      {
        id: 'habiganj',
        nameEn: 'Habiganj',
        nameBn: 'হবিগঞ্জ',
        upazilas: [
          { id: 'habiganj_sadar', nameEn: 'Habiganj Sadar', nameBn: 'হবিগঞ্জ সদর' },
          { id: 'madhabpur', nameEn: 'Madhabpur', nameBn: 'মাধবপুর' },
          { id: 'nabiganj', nameEn: 'Nabiganj', nameBn: 'নবীগঞ্জ' }
        ]
      },
      {
        id: 'sunamganj',
        nameEn: 'Sunamganj',
        nameBn: 'সুনামগঞ্জ',
        upazilas: [
          { id: 'sunamganj_sadar', nameEn: 'Sunamganj Sadar', nameBn: 'সুনামগঞ্জ সদর' },
          { id: 'chhatak', nameEn: 'Chhatak', nameBn: 'ছাতক' },
          { id: 'tahirpur', nameEn: 'Tahirpur', nameBn: 'তাহিরপুর' }
        ]
      }
    ]
  },
  {
    id: 'rangpur',
    nameEn: 'Rangpur',
    nameBn: 'রংপুর',
    districts: [
      {
        id: 'rangpur',
        nameEn: 'Rangpur',
        nameBn: 'রংপুর',
        upazilas: [
          { id: 'rangpur_sadar', nameEn: 'Rangpur Sadar', nameBn: 'রংপুর সদর' },
          { id: 'badarganj', nameEn: 'Badarganj', nameBn: 'বদরগঞ্জ' },
          { id: 'pirganj', nameEn: 'Pirganj', nameBn: 'পীরগঞ্জ' }
        ]
      },
      {
        id: 'dinajpur',
        nameEn: 'Dinajpur',
        nameBn: 'দিনাজপুর',
        upazilas: [
          { id: 'dinajpur_sadar', nameEn: 'Dinajpur Sadar', nameBn: 'দিনাজপুর সদর' },
          { id: 'birganj', nameEn: 'Birganj', nameBn: 'বীরগঞ্জ' },
          { id: 'parbatipur', nameEn: 'Parbatipur', nameBn: 'পার্বতীপুর' }
        ]
      },
      {
        id: 'gaibandha',
        nameEn: 'Gaibandha',
        nameBn: 'গাইবান্ধা',
        upazilas: [
          { id: 'gaibandha_sadar', nameEn: 'Gaibandha Sadar', nameBn: 'গাইবান্ধা সদর' },
          { id: 'gobindaganj', nameEn: 'Gobindaganj', nameBn: 'গোবিন্দগঞ্জ' }
        ]
      },
      {
        id: 'kurigram',
        nameEn: 'Kurigram',
        nameBn: 'কুড়িগ্রাম',
        upazilas: [
          { id: 'kurigram_sadar', nameEn: 'Kurigram Sadar', nameBn: 'কুড়িগ্রাম সদর' },
          { id: 'ulipur', nameEn: 'Ulipur', nameBn: 'উলিপুর' }
        ]
      },
      {
        id: 'lalmonirhat',
        nameEn: 'Lalmonirhat',
        nameBn: 'লালমনিরহাট',
        upazilas: [
          { id: 'lalmonirhat_sadar', nameEn: 'Lalmonirhat Sadar', nameBn: 'লালমনিরহাট সদর' },
          { id: 'patgram', nameEn: 'Patgram', nameBn: 'পাটগ্রাম' }
        ]
      },
      {
        id: 'nilphamari',
        nameEn: 'Nilphamari',
        nameBn: 'নীলফামারী',
        upazilas: [
          { id: 'nilphamari_sadar', nameEn: 'Nilphamari Sadar', nameBn: 'নীলফামারী সদর' },
          { id: 'saidpur', nameEn: 'Saidpur', nameBn: 'সৈয়দপুর' }
        ]
      },
      {
        id: 'panchagarh',
        nameEn: 'Panchagarh',
        nameBn: 'পঞ্চগড়',
        upazilas: [
          { id: 'panchagarh_sadar', nameEn: 'Panchagarh Sadar', nameBn: 'পঞ্চগড় সদর' },
          { id: 'tetulia', nameEn: 'Tetulia', nameBn: 'তেঁতুলিয়া' }
        ]
      },
      {
        id: 'thakurgaon',
        nameEn: 'Thakurgaon',
        nameBn: 'ঠাকুরগাঁও',
        upazilas: [
          { id: 'thakurgaon_sadar', nameEn: 'Thakurgaon Sadar', nameBn: 'ঠাকুরগাঁও সদর' },
          { id: 'pirganj_thak', nameEn: 'Pirganj', nameBn: 'পীরগঞ্জ' }
        ]
      }
    ]
  },
  {
    id: 'mymensingh',
    nameEn: 'Mymensingh',
    nameBn: 'ময়মনসিংহ',
    districts: [
      {
        id: 'mymensingh',
        nameEn: 'Mymensingh',
        nameBn: 'ময়মনসিংহ',
        upazilas: [
          { id: 'mymensingh_sadar', nameEn: 'Mymensingh Sadar', nameBn: 'ময়মনসিংহ সদর' },
          { id: 'trishal', nameEn: 'Trishal', nameBn: 'ত্রিশাল' },
          { id: 'muktagachha', nameEn: 'Muktagachha', nameBn: 'মুক্তাগাছা' },
          { id: 'bhaluka', nameEn: 'Bhaluka', nameBn: 'ভালুকা' },
          { id: 'gafargaon', nameEn: 'Gafargaon', nameBn: 'গফরগাঁও' }
        ]
      },
      {
        id: 'jamalpur',
        nameEn: 'Jamalpur',
        nameBn: 'জামালপুর',
        upazilas: [
          { id: 'jamalpur_sadar', nameEn: 'Jamalpur Sadar', nameBn: 'জামালপুর সদর' },
          { id: 'sarishabari', nameEn: 'Sarishabari', nameBn: 'সরিষাবাড়ী' }
        ]
      },
      {
        id: 'netrokona',
        nameEn: 'Netrokona',
        nameBn: 'নেত্রকোণা',
        upazilas: [
          { id: 'netrokona_sadar', nameEn: 'Netrokona Sadar', nameBn: 'নেত্রকোণা সদর' },
          { id: 'kendua', nameEn: 'Kendua', nameBn: 'কেন্দুয়া' }
        ]
      },
      {
        id: 'sherpur',
        nameEn: 'Sherpur',
        nameBn: 'শেরপুর',
        upazilas: [
          { id: 'sherpur_sadar', nameEn: 'Sherpur Sadar', nameBn: 'শেরপুর সদর' },
          { id: 'nakla', nameEn: 'Nakla', nameBn: 'নকলা' }
        ]
      }
    ]
  }
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = typeof BLOOD_GROUPS[number];
