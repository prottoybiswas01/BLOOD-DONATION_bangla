/**
 * bangladeshLocations.ts
 * Authoritative Bangladesh Administrative Location Hierarchy
 * Hierarchy: Division (8) -> District (64) -> Upazila
 * Sources: bangladesh.gov.bd, cabinet.gov.bd
 * Normalized IDs, dual Bengali & English labels, canonical resolution
 */

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
          { id: 'dohar', nameEn: 'Dohar', nameBn: 'দোহার' },
          { id: 'nawabganj', nameEn: 'Nawabganj', nameBn: 'নবাবগঞ্জ' },
          { id: 'badda', nameEn: 'Badda', nameBn: 'বাড্ডা' },
          { id: 'khilgaon', nameEn: 'Khilgaon', nameBn: 'খিলগাঁও' },
          { id: 'jatrabari', nameEn: 'Jatrabari', nameBn: 'যাত্রাবাড়ী' },
          { id: 'tejgaon', nameEn: 'Tejgaon', nameBn: 'তেজগাঁও' },
          { id: 'ramna', nameEn: 'Ramna', nameBn: 'রমনা' },
          { id: 'lalbagh', nameEn: 'Lalbagh', nameBn: 'লালবাগ' },
          { id: 'paltan', nameEn: 'Paltan', nameBn: 'পল্টন' },
          { id: 'hazaribagh', nameEn: 'Hazaribagh', nameBn: 'হাজারীবাগ' },
          { id: 'demra', nameEn: 'Demra', nameBn: 'ডেমরা' },
          { id: 'sabujbagh', nameEn: 'Sabujbagh', nameBn: 'সবুজবাগ' },
          { id: 'sutrapur', nameEn: 'Sutrapur', nameBn: 'সূত্রাপুর' },
          { id: 'kotwali_dhk', nameEn: 'Kotwali', nameBn: 'কোতোয়ালী' },
          { id: 'cantonment', nameEn: 'Cantonment', nameBn: 'ক্যান্টনমেন্ট' },
          { id: 'kafrul', nameEn: 'Kafrul', nameBn: 'কাফরুল' },
          { id: 'rampura', nameEn: 'Rampura', nameBn: 'রামপুরা' },
          { id: 'khilkhet', nameEn: 'Khilkhet', nameBn: 'খিলক্ষেত' },
          { id: 'bhatara', nameEn: 'Bhatara', nameBn: 'ভাটারা' },
          { id: 'turag', nameEn: 'Turag', nameBn: 'তুরাগ' },
          { id: 'dakshinkhan', nameEn: 'Dakshinkhan', nameBn: 'দক্ষিণখান' },
          { id: 'uttarkhan', nameEn: 'Uttarkhan', nameBn: 'উত্তরখান' },
          { id: 'kamrangirchar', nameEn: 'Kamrangirchar', nameBn: 'কামরাঙ্গীরচর' },
          { id: 'chawkbazar', nameEn: 'Chawkbazar', nameBn: 'চকবাজার' },
          { id: 'wari', nameEn: 'Wari', nameBn: 'ওয়ারী' },
          { id: 'shah_ali', nameEn: 'Shah Ali', nameBn: 'শাহ আলী' },
          { id: 'kadamtali', nameEn: 'Kadamtali', nameBn: 'কদমতলী' },
          { id: 'kalabagan', nameEn: 'Kalabagan', nameBn: 'কলাবাগান' },
          { id: 'mugda', nameEn: 'Mugda', nameBn: 'মুগদা' },
          { id: 'rupnagar', nameEn: 'Rupnagar', nameBn: 'রূপনগর' },
          { id: 'vashantek', nameEn: 'Vashantek', nameBn: 'ভাষানটেক' }
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
          { id: 'kaliganj', nameEn: 'Kaliganj', nameBn: 'কালীগঞ্জ' },
          { id: 'tongi', nameEn: 'Tongi', nameBn: 'টঙ্গী' }
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
          { id: 'madhupur', nameEn: 'Madhupur', nameBn: 'মধুপুর' },
          { id: 'sakhipur', nameEn: 'Sakhipur', nameBn: 'সখিপুর' },
          { id: 'kalihati', nameEn: 'Kalihati', nameBn: 'কালিহাতী' },
          { id: 'basail', nameEn: 'Basail', nameBn: 'বাসাইল' },
          { id: 'delduar', nameEn: 'Delduar', nameBn: 'দেলদুয়ার' },
          { id: 'nagarpur', nameEn: 'Nagarpur', nameBn: 'নাগরপুর' },
          { id: 'gopalpur', nameEn: 'Gopalpur', nameBn: 'গোপালপুর' },
          { id: 'bhuapur', nameEn: 'Bhuapur', nameBn: 'ভূঞাপুর' },
          { id: 'dhanbari', nameEn: 'Dhanbari', nameBn: 'ধনবাড়ী' }
        ]
      },
      {
        id: 'faridpur',
        nameEn: 'Faridpur',
        nameBn: 'ফরিদপুর',
        upazilas: [
          { id: 'faridpur_sadar', nameEn: 'Faridpur Sadar', nameBn: 'ফরিদপুর সদর' },
          { id: 'bhanga', nameEn: 'Bhanga', nameBn: 'ভাঙ্গা' },
          { id: 'boalmari', nameEn: 'Boalmari', nameBn: 'বোয়ালমারী' },
          { id: 'sadarpur', nameEn: 'Sadarpur', nameBn: 'সদরপুর' },
          { id: 'nagarkanda', nameEn: 'Nagarkanda', nameBn: 'নগরকান্দা' },
          { id: 'madhukhali', nameEn: 'Madhukhali', nameBn: 'মধুখালী' },
          { id: 'charbhadrasan', nameEn: 'Charbhadrasan', nameBn: 'চরভদ্রাসন' },
          { id: 'alfadanga', nameEn: 'Alfadanga', nameBn: 'আলফাডাঙ্গা' },
          { id: 'saltha', nameEn: 'Saltha', nameBn: 'সালথা' }
        ]
      },
      {
        id: 'manikganj',
        nameEn: 'Manikganj',
        nameBn: 'মানিকগঞ্জ',
        upazilas: [
          { id: 'manikganj_sadar', nameEn: 'Manikganj Sadar', nameBn: 'মানিকগঞ্জ সদর' },
          { id: 'singair', nameEn: 'Singair', nameBn: 'সিংগাইর' },
          { id: 'shibalaya', nameEn: 'Shibalaya', nameBn: 'শিবালয়' },
          { id: 'saturia', nameEn: 'Saturia', nameBn: 'সাটুরিয়া' },
          { id: 'harirampur', nameEn: 'Harirampur', nameBn: 'হরিরামপুর' },
          { id: 'ghior', nameEn: 'Ghior', nameBn: 'ঘিওর' },
          { id: 'daulatpur_man', nameEn: 'Daulatpur', nameBn: 'দৌলতপুর' }
        ]
      },
      {
        id: 'munshiganj',
        nameEn: 'Munshiganj',
        nameBn: 'মুন্সীগঞ্জ',
        upazilas: [
          { id: 'munshiganj_sadar', nameEn: 'Munshiganj Sadar', nameBn: 'মুন্সীগঞ্জ সদর' },
          { id: 'tongibari', nameEn: 'Tongibari', nameBn: 'টংগিবাড়ী' },
          { id: 'serajdikhan', nameEn: 'Serajdikhan', nameBn: 'সিরাজদিখান' },
          { id: 'louhajang', nameEn: 'Louhajang', nameBn: 'লৌহজং' },
          { id: 'sreenagar', nameEn: 'Sreenagar', nameBn: 'শ্রীনগর' },
          { id: 'gazaria', nameEn: 'Gazaria', nameBn: 'গজারিয়া' }
        ]
      },
      {
        id: 'narsingdi',
        nameEn: 'Narsingdi',
        nameBn: 'নরসিংদী',
        upazilas: [
          { id: 'narsingdi_sadar', nameEn: 'Narsingdi Sadar', nameBn: 'নরসিংদী সদর' },
          { id: 'raipura', nameEn: 'Raipura', nameBn: 'রায়পুরা' },
          { id: 'shibpur', nameEn: 'Shibpur', nameBn: 'শিবপুর' },
          { id: 'belabo', nameEn: 'Belabo', nameBn: 'বেলাবো' },
          { id: 'monohardi', nameEn: 'Monohardi', nameBn: 'মনোহরদী' },
          { id: 'palash', nameEn: 'Palash', nameBn: 'পলাশ' }
        ]
      },
      {
        id: 'gopalganj',
        nameEn: 'Gopalganj',
        nameBn: 'গোপালগঞ্জ',
        upazilas: [
          { id: 'gopalganj_sadar', nameEn: 'Gopalganj Sadar', nameBn: 'গোপালগঞ্জ সদর' },
          { id: 'kashiani', nameEn: 'Kashiani', nameBn: 'কাশিয়ানী' },
          { id: 'kotalipara', nameEn: 'Kotalipara', nameBn: 'কোটালীপাড়া' },
          { id: 'muksudpur', nameEn: 'Muksudpur', nameBn: 'মুকসুদপুর' },
          { id: 'tungipara', nameEn: 'Tungipara', nameBn: 'টুঙ্গিপাড়া' }
        ]
      },
      {
        id: 'madaripur',
        nameEn: 'Madaripur',
        nameBn: 'মাদারীপুর',
        upazilas: [
          { id: 'madaripur_sadar', nameEn: 'Madaripur Sadar', nameBn: 'মাদারীপুর সদর' },
          { id: 'shibchar', nameEn: 'Shibchar', nameBn: 'শিবচর' },
          { id: 'kalkini', nameEn: 'Kalkini', nameBn: 'কালকিনি' },
          { id: 'rajoir', nameEn: 'Rajoir', nameBn: 'রাজৈর' },
          { id: 'dasar', nameEn: 'Dasar', nameBn: 'ডাসার' }
        ]
      },
      {
        id: 'rajbari',
        nameEn: 'Rajbari',
        nameBn: 'রাজবাড়ী',
        upazilas: [
          { id: 'rajbari_sadar', nameEn: 'Rajbari Sadar', nameBn: 'রাজবাড়ী সদর' },
          { id: 'goalanda', nameEn: 'Goalanda', nameBn: 'গোয়ালন্দ' },
          { id: 'pangsha', nameEn: 'Pangsha', nameBn: 'পাংশা' },
          { id: 'baliakandi', nameEn: 'Baliakandi', nameBn: 'বালিয়াকান্দি' },
          { id: 'kalukhali', nameEn: 'Kalukhali', nameBn: 'কালুখালী' }
        ]
      },
      {
        id: 'shariatpur',
        nameEn: 'Shariatpur',
        nameBn: 'শরীয়তপুর',
        upazilas: [
          { id: 'shariatpur_sadar', nameEn: 'Shariatpur Sadar', nameBn: 'শরীয়তপুর সদর' },
          { id: 'naria', nameEn: 'Naria', nameBn: 'নড়িয়া' },
          { id: 'zanjira', nameEn: 'Zanjira', nameBn: 'জাজিরা' },
          { id: 'bhedarganj', nameEn: 'Bhedarganj', nameBn: 'ভেদরগঞ্জ' },
          { id: 'damudya', nameEn: 'Damudya', nameBn: 'ডামুড্যা' },
          { id: 'gosairhat', nameEn: 'Gosairhat', nameBn: 'গোসাইরহাট' }
        ]
      },
      {
        id: 'kishoreganj',
        nameEn: 'Kishoreganj',
        nameBn: 'কিশোরগঞ্জ',
        upazilas: [
          { id: 'kishoreganj_sadar', nameEn: 'Kishoreganj Sadar', nameBn: 'কিশোরগঞ্জ সদর' },
          { id: 'bhairab', nameEn: 'Bhairab', nameBn: 'ভৈরব' },
          { id: 'bajitpur', nameEn: 'Bajitpur', nameBn: 'বাজিতপুর' },
          { id: 'kuliarchar', nameEn: 'Kuliarchar', nameBn: 'কুলিয়ারচর' },
          { id: 'pakundia', nameEn: 'Pakundia', nameBn: 'পাকুন্দিয়া' },
          { id: 'katiadi', nameEn: 'Katiadi', nameBn: 'কটিয়াদী' },
          { id: 'karimganj', nameEn: 'Karimganj', nameBn: 'করিমগঞ্জ' },
          { id: 'tarail', nameEn: 'Tarail', nameBn: 'তাড়াইল' },
          { id: 'hossainpur', nameEn: 'Hossainpur', nameBn: 'হোসেনপুর' },
          { id: 'itna', nameEn: 'Itna', nameBn: 'ইটনা' },
          { id: 'mithamain', nameEn: 'Mithamain', nameBn: 'মিঠামইন' },
          { id: 'ashtagram', nameEn: 'Ashtagram', nameBn: 'অষ্টগ্রাম' },
          { id: 'nikli', nameEn: 'Nikli', nameBn: 'নিকলী' }
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
          { id: 'chattogram_sadar', nameEn: 'Chattogram Sadar', nameBn: 'চট্টগ্রাম সদর' },
          { id: 'anwara', nameEn: 'Anwara', nameBn: 'আনোয়ারা' },
          { id: 'banshkhali', nameEn: 'Banshkhali', nameBn: 'বাঁশখালী' },
          { id: 'boalkhali', nameEn: 'Boalkhali', nameBn: 'বোয়ালখালী' },
          { id: 'chandanaish', nameEn: 'Chandanaish', nameBn: 'চন্দনাইশ' },
          { id: 'fatikchhari', nameEn: 'Fatikchhari', nameBn: 'ফটিকছড়ি' },
          { id: 'hathazari', nameEn: 'Hathazari', nameBn: 'হাটহাজারী' },
          { id: 'karnaphuli', nameEn: 'Karnaphuli', nameBn: 'কর্ণফুলী' },
          { id: 'lohagara', nameEn: 'Lohagara', nameBn: 'লোহাগাড়া' },
          { id: 'mirsharai', nameEn: 'Mirsharai', nameBn: 'মীরসরাই' },
          { id: 'patiya', nameEn: 'Patiya', nameBn: 'পটিয়া' },
          { id: 'rangunia', nameEn: 'Rangunia', nameBn: 'রাঙ্গুনিয়া' },
          { id: 'raozan', nameEn: 'Raozan', nameBn: 'রাউজান' },
          { id: 'sandwip', nameEn: 'Sandwip', nameBn: 'সন্দ্বীপ' },
          { id: 'satkania', nameEn: 'Satkania', nameBn: 'সাতকানিয়া' },
          { id: 'sitakunda', nameEn: 'Sitakunda', nameBn: 'সীতাকুণ্ড' },
          { id: 'kotwali_ctg', nameEn: 'Kotwali', nameBn: 'কোতোয়ালী' },
          { id: 'panchlaish', nameEn: 'Panchlaish', nameBn: 'পাঁচলাইশ' },
          { id: 'pahartali', nameEn: 'Pahartali', nameBn: 'পাহাড়তলী' },
          { id: 'halishahar', nameEn: 'Halishahar', nameBn: 'হালিশহর' },
          { id: 'patenga', nameEn: 'Patenga', nameBn: 'পতেঙ্গা' },
          { id: 'chandgaon', nameEn: 'Chandgaon', nameBn: 'চান্দগাঁও' }
        ]
      },
      {
        id: 'coxsbazar',
        nameEn: "Cox's Bazar",
        nameBn: 'কক্সবাজার',
        upazilas: [
          { id: 'coxsbazar_sadar', nameEn: "Cox's Bazar Sadar", nameBn: 'কক্সবাজার সদর' },
          { id: 'chakaria', nameEn: 'Chakaria', nameBn: 'চকোরিয়া' },
          { id: 'maheshkhali', nameEn: 'Maheshkhali', nameBn: 'মহেশখালী' },
          { id: 'teknaf', nameEn: 'Teknaf', nameBn: 'টেকনাফ' },
          { id: 'ukhiya', nameEn: 'Ukhiya', nameBn: 'উখিয়া' },
          { id: 'ramu', nameEn: 'Ramu', nameBn: 'রামু' },
          { id: 'pekua', nameEn: 'Pekua', nameBn: 'পেকুয়া' },
          { id: 'kutubdia', nameEn: 'Kutubdia', nameBn: 'কুতুবদিয়া' },
          { id: 'eidgaon', nameEn: 'Eidgaon', nameBn: 'ঈদগাঁও' }
        ]
      },
      {
        id: 'cumilla',
        nameEn: 'Cumilla',
        nameBn: 'কুমিল্লা',
        upazilas: [
          { id: 'cumilla_adarsha_sadar', nameEn: 'Adarsha Sadar', nameBn: 'আদর্শ সদর' },
          { id: 'cumilla_sadar_dakshin', nameEn: 'Sadar Dakshin', nameBn: 'সদর দক্ষিণ' },
          { id: 'laksham', nameEn: 'Laksham', nameBn: 'লাকসাম' },
          { id: 'chandina', nameEn: 'Chandina', nameBn: 'চান্দিনা' },
          { id: 'debidwar', nameEn: 'Debidwar', nameBn: 'দেবিদ্বার' },
          { id: 'daudkandi', nameEn: 'Daudkandi', nameBn: 'দাউদকান্দি' },
          { id: 'barura', nameEn: 'Barura', nameBn: 'বরুড়া' },
          { id: 'burichang', nameEn: 'Burichang', nameBn: 'বুড়িচং' },
          { id: 'brahmanpara', nameEn: 'Brahmanpara', nameBn: 'ব্রাহ্মণপাড়া' },
          { id: 'chauddagram', nameEn: 'Chauddagram', nameBn: 'চৌদ্দগ্রাম' },
          { id: 'homna', nameEn: 'Homna', nameBn: 'হোমনা' },
          { id: 'muradnagar', nameEn: 'Muradnagar', nameBn: 'মুরাদনগর' },
          { id: 'nangalkot', nameEn: 'Nangalkot', nameBn: 'নাঙ্গলকোট' },
          { id: 'meghna', nameEn: 'Meghna', nameBn: 'মেঘনা' },
          { id: 'titas', nameEn: 'Titas', nameBn: 'তিতাস' },
          { id: 'monohargonj', nameEn: 'Monohargonj', nameBn: 'মনোহরগঞ্জ' },
          { id: 'lalmai', nameEn: 'Lalmai', nameBn: 'লালমাই' }
        ]
      },
      {
        id: 'feni',
        nameEn: 'Feni',
        nameBn: 'ফেনী',
        upazilas: [
          { id: 'feni_sadar', nameEn: 'Feni Sadar', nameBn: 'ফেনী সদর' },
          { id: 'daganbhuiyan', nameEn: 'Daganbhuiyan', nameBn: 'দাগনভূঞা' },
          { id: 'parshuram', nameEn: 'Parshuram', nameBn: 'পরশুরাম' },
          { id: 'chhagalnaiya', nameEn: 'Chhagalnaiya', nameBn: 'ছাগলনাইয়া' },
          { id: 'sonagazi', nameEn: 'Sonagazi', nameBn: 'সোনাগাজী' },
          { id: 'fulgazi', nameEn: 'Fulgazi', nameBn: 'ফুলগাজী' }
        ]
      },
      {
        id: 'brahmanbaria',
        nameEn: 'Brahmanbaria',
        nameBn: 'ব্রাহ্মণবাড়িয়া',
        upazilas: [
          { id: 'brahmanbaria_sadar', nameEn: 'Brahmanbaria Sadar', nameBn: 'ব্রাহ্মণবাড়িয়া সদর' },
          { id: 'ashuganj', nameEn: 'Ashuganj', nameBn: 'আশুগঞ্জ' },
          { id: 'sarail', nameEn: 'Sarail', nameBn: 'সরাইল' },
          { id: 'akhaura', nameEn: 'Akhaura', nameBn: 'আখাউড়া' },
          { id: 'bancharampur', nameEn: 'Bancharampur', nameBn: 'বাঞ্ছারামপুর' },
          { id: 'kasba', nameEn: 'Kasba', nameBn: 'কসবা' },
          { id: 'nabinagar', nameEn: 'Nabinagar', nameBn: 'নবীনগর' },
          { id: 'nasirnagar', nameEn: 'Nasirnagar', nameBn: 'নাসিরনগর' },
          { id: 'bijoynagar', nameEn: 'Bijoynagar', nameBn: 'বিজয়নগর' }
        ]
      },
      {
        id: 'chandpur',
        nameEn: 'Chandpur',
        nameBn: 'চাঁদপুর',
        upazilas: [
          { id: 'chandpur_sadar', nameEn: 'Chandpur Sadar', nameBn: 'চাঁদপুর সদর' },
          { id: 'hajiganj', nameEn: 'Hajiganj', nameBn: 'হাজীগঞ্জ' },
          { id: 'matlab_uttar', nameEn: 'Matlab Uttar', nameBn: 'মতলব উত্তর' },
          { id: 'matlab_dakshin', nameEn: 'Matlab Dakshin', nameBn: 'মতলব দক্ষিণ' },
          { id: 'shahrasti', nameEn: 'Shahrasti', nameBn: 'শাহরাস্তি' },
          { id: 'kachua', nameEn: 'Kachua', nameBn: 'কচুয়া' },
          { id: 'faridganj', nameEn: 'Faridganj', nameBn: 'ফরিদগঞ্জ' },
          { id: 'haimchar', nameEn: 'Haimchar', nameBn: 'হাইমচর' }
        ]
      },
      {
        id: 'noakhali',
        nameEn: 'Noakhali',
        nameBn: 'নোয়াখালী',
        upazilas: [
          { id: 'noakhali_sadar', nameEn: 'Noakhali Sadar', nameBn: 'নোয়াখালী সদর' },
          { id: 'begumganj', nameEn: 'Begumganj', nameBn: 'বেগমগঞ্জ' },
          { id: 'senbagh', nameEn: 'Senbagh', nameBn: 'সেনবাগ' },
          { id: 'chatkhil', nameEn: 'Chatkhil', nameBn: 'চাটখিল' },
          { id: 'companiganj', nameEn: 'Companiganj', nameBn: 'কোম্পানীগঞ্জ' },
          { id: 'hatiya', nameEn: 'Hatiya', nameBn: 'হাতিয়া' },
          { id: 'kabirhat', nameEn: 'Kabirhat', nameBn: 'কবিরহাট' },
          { id: 'sonaimuri', nameEn: 'Sonaimuri', nameBn: 'সোনাইমুড়ী' },
          { id: 'subarnachar', nameEn: 'Subarnachar', nameBn: 'সুবর্ণচর' }
        ]
      },
      {
        id: 'lakshmipur',
        nameEn: 'Lakshmipur',
        nameBn: 'লক্ষ্মীপুর',
        upazilas: [
          { id: 'lakshmipur_sadar', nameEn: 'Lakshmipur Sadar', nameBn: 'লক্ষ্মীপুর সদর' },
          { id: 'ramganj', nameEn: 'Ramganj', nameBn: 'রামগঞ্জ' },
          { id: 'raipur', nameEn: 'Raipur', nameBn: 'রায়পুর' },
          { id: 'ramgati', nameEn: 'Ramgati', nameBn: 'রামগতি' },
          { id: 'kamalnagar', nameEn: 'Kamalnagar', nameBn: 'কমলনগর' }
        ]
      },
      {
        id: 'rangamati',
        nameEn: 'Rangamati',
        nameBn: 'রাঙ্গামাটি',
        upazilas: [
          { id: 'rangamati_sadar', nameEn: 'Rangamati Sadar', nameBn: 'রাঙ্গামাটি সদর' },
          { id: 'kaptai', nameEn: 'Kaptai', nameBn: 'কাপ্তাই' },
          { id: 'kawkhali_ran', nameEn: 'Kawkhali', nameBn: 'কাউখালী' },
          { id: 'baghaichhari', nameEn: 'Baghaichhari', nameBn: 'বাঘাইছড়ি' },
          { id: 'barkal', nameEn: 'Barkal', nameBn: 'বরকল' },
          { id: 'langadu', nameEn: 'Langadu', nameBn: 'লংগদু' },
          { id: 'rajasthali', nameEn: 'Rajasthali', nameBn: 'রাজস্থলী' },
          { id: 'belaichhari', nameEn: 'Belaichhari', nameBn: 'বিলাইছড়ি' },
          { id: 'juraichhari', nameEn: 'Juraichhari', nameBn: 'জুরাইছড়ি' },
          { id: 'naniarchar', nameEn: 'Naniarchar', nameBn: 'নানিয়ারচর' }
        ]
      },
      {
        id: 'khagrachhari',
        nameEn: 'Khagrachhari',
        nameBn: 'খাগড়াছড়ি',
        upazilas: [
          { id: 'khagrachhari_sadar', nameEn: 'Khagrachhari Sadar', nameBn: 'খাগড়াছড়ি সদর' },
          { id: 'dighinala', nameEn: 'Dighinala', nameBn: 'দীঘিনালা' },
          { id: 'panchhari', nameEn: 'Panchhari', nameBn: 'পানছড়ি' },
          { id: 'mahalchhari', nameEn: 'Mahalchhari', nameBn: 'মহালছড়ি' },
          { id: 'matiranga', nameEn: 'Matiranga', nameBn: 'মাটিরাঙ্গা' },
          { id: 'manikchhari', nameEn: 'Manikchhari', nameBn: 'মানিকছড়ি' },
          { id: 'ramgarh', nameEn: 'Ramgarh', nameBn: 'রামগড়' },
          { id: 'lakshmichhari', nameEn: 'Lakshmichhari', nameBn: 'লক্ষ্মীছড়ি' },
          { id: 'guimara', nameEn: 'Guimara', nameBn: 'গুইমারা' }
        ]
      },
      {
        id: 'bandarban',
        nameEn: 'Bandarban',
        nameBn: 'বান্দরবান',
        upazilas: [
          { id: 'bandarban_sadar', nameEn: 'Bandarban Sadar', nameBn: 'বান্দরবান সদর' },
          { id: 'thanchi', nameEn: 'Thanchi', nameBn: 'থানচি' },
          { id: 'lama', nameEn: 'Lama', nameBn: 'লামা' },
          { id: 'ruma', nameEn: 'Ruma', nameBn: 'রুমা' },
          { id: 'rowangchhari', nameEn: 'Rowangchhari', nameBn: 'রোয়াংছড়ি' },
          { id: 'alikadam', nameEn: 'Alikadam', nameBn: 'আলীকদম' },
          { id: 'naikhongchhari', nameEn: 'Naikhongchhari', nameBn: 'নাইক্ষ্যংছড়ি' }
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
          { id: 'paba', nameEn: 'Paba', nameBn: 'পবা' },
          { id: 'godagari', nameEn: 'Godagari', nameBn: 'গোদাগাড়ী' },
          { id: 'tanore', nameEn: 'Tanore', nameBn: 'তানোর' },
          { id: 'mohanpur', nameEn: 'Mohanpur', nameBn: 'মোহনপুর' },
          { id: 'bagmara', nameEn: 'Bagmara', nameBn: 'বাগমারা' },
          { id: 'durgapur_raj', nameEn: 'Durgapur', nameBn: 'দুর্গাপুর' },
          { id: 'puthia', nameEn: 'Puthia', nameBn: 'পুঠিয়া' },
          { id: 'charghat', nameEn: 'Charghat', nameBn: 'চারঘাট' },
          { id: 'bagha', nameEn: 'Bagha', nameBn: 'বাঘা' },
          { id: 'boalia', nameEn: 'Boalia', nameBn: 'বোয়ালিয়া' },
          { id: 'rajputra', nameEn: 'Rajputra', nameBn: 'রাজপাড়া' },
          { id: 'motihar', nameEn: 'Motihar', nameBn: 'মতিহার' },
          { id: 'shah_makhdum', nameEn: 'Shah Makhdum', nameBn: 'শাহ মখদুম' }
        ]
      },
      {
        id: 'bogura',
        nameEn: 'Bogura',
        nameBn: 'বগুড়া',
        upazilas: [
          { id: 'bogura_sadar', nameEn: 'Bogura Sadar', nameBn: 'বগুড়া সদর' },
          { id: 'shibganj_bog', nameEn: 'Shibganj', nameBn: 'শিবগঞ্জ' },
          { id: 'sonatola', nameEn: 'Sonatola', nameBn: 'সোনাতলা' },
          { id: 'gabtali', nameEn: 'Gabtali', nameBn: 'গাবতলী' },
          { id: 'shajahanpur', nameEn: 'Shajahanpur', nameBn: 'শাজাহানপুর' },
          { id: 'kahaloo', nameEn: 'Kahaloo', nameBn: 'কাহালু' },
          { id: 'nandigram', nameEn: 'Nandigram', nameBn: 'নন্দীগ্রাম' },
          { id: 'adamdighi', nameEn: 'Adamdighi', nameBn: 'আদমদীঘি' },
          { id: 'dhupchanchia', nameEn: 'Dhupchanchia', nameBn: 'দুপচাঁচিয়া' },
          { id: 'sariakandi', nameEn: 'Sariakandi', nameBn: 'সারিয়াকান্দি' },
          { id: 'sherpur_bog', nameEn: 'Sherpur', nameBn: 'শেরপুর' },
          { id: 'dhunat', nameEn: 'Dhunat', nameBn: 'ধুনট' }
        ]
      },
      {
        id: 'pabna',
        nameEn: 'Pabna',
        nameBn: 'পাবনা',
        upazilas: [
          { id: 'pabna_sadar', nameEn: 'Pabna Sadar', nameBn: 'পাবনা সদর' },
          { id: 'ishwardi', nameEn: 'Ishwardi', nameBn: 'ঈশ্বরদী' },
          { id: 'atgharia', nameEn: 'Atgharia', nameBn: 'আটঘরিয়া' },
          { id: 'bera', nameEn: 'Bera', nameBn: 'বেড়া' },
          { id: 'bhangura', nameEn: 'Bhangura', nameBn: 'ভাঙ্গুড়া' },
          { id: 'chatmohar', nameEn: 'Chatmohar', nameBn: 'চাটমোহর' },
          { id: 'faridpur_pab', nameEn: 'Faridpur', nameBn: 'ফরিদপুর' },
          { id: 'santhia', nameEn: 'Santhia', nameBn: 'সাঁথিয়া' },
          { id: 'sujanagar', nameEn: 'Sujanagar', nameBn: 'সুজানগর' }
        ]
      },
      {
        id: 'sirajganj',
        nameEn: 'Sirajganj',
        nameBn: 'সিরাজগঞ্জ',
        upazilas: [
          { id: 'sirajganj_sadar', nameEn: 'Sirajganj Sadar', nameBn: 'সিরাজগঞ্জ সদর' },
          { id: 'belkuchi', nameEn: 'Belkuchi', nameBn: 'বেলকুচি' },
          { id: 'chauhali', nameEn: 'Chauhali', nameBn: 'চৌহালী' },
          { id: 'kamarkhanda', nameEn: 'Kamarkhanda', nameBn: 'কামারখন্দ' },
          { id: 'kazipur', nameEn: 'Kazipur', nameBn: 'কাজীপুর' },
          { id: 'raiganj', nameEn: 'Raiganj', nameBn: 'রায়গঞ্জ' },
          { id: 'shahjadpur', nameEn: 'Shahjadpur', nameBn: 'শাহজাদপুর' },
          { id: 'tarash', nameEn: 'Tarash', nameBn: 'তাড়াশ' },
          { id: 'ullahpara', nameEn: 'Ullahpara', nameBn: 'উল্লাপাড়া' }
        ]
      },
      {
        id: 'naogaon',
        nameEn: 'Naogaon',
        nameBn: 'নওগাঁ',
        upazilas: [
          { id: 'naogaon_sadar', nameEn: 'Naogaon Sadar', nameBn: 'নওগাঁ সদর' },
          { id: 'mohadevpur', nameEn: 'Mohadevpur', nameBn: 'মহাদেবপুর' },
          { id: 'manda', nameEn: 'Manda', nameBn: 'মান্দা' },
          { id: 'niamatpur', nameEn: 'Niamatpur', nameBn: 'নিয়ামতপুর' },
          { id: 'atrai', nameEn: 'Atrai', nameBn: 'আত্রাই' },
          { id: 'raninagar', nameEn: 'Raninagar', nameBn: 'রাণীনগর' },
          { id: 'patnitala', nameEn: 'Patnitala', nameBn: 'পত্নীতলা' },
          { id: 'dhamoirhat', nameEn: 'Dhamoirhat', nameBn: 'ধামইরহাট' },
          { id: 'sapahar', nameEn: 'Sapahar', nameBn: 'সাপাহার' },
          { id: 'porsha', nameEn: 'Porsha', nameBn: 'পোরশা' },
          { id: 'badalgachhi', nameEn: 'Badalgachhi', nameBn: 'বদলগাছী' }
        ]
      },
      {
        id: 'natore',
        nameEn: 'Natore',
        nameBn: 'নাটোর',
        upazilas: [
          { id: 'natore_sadar', nameEn: 'Natore Sadar', nameBn: 'নাটোর সদর' },
          { id: 'singra', nameEn: 'Singra', nameBn: 'সিংড়া' },
          { id: 'baraigram', nameEn: 'Baraigram', nameBn: 'বড়াইগ্রাম' },
          { id: 'bagatipara', nameEn: 'Bagatipara', nameBn: 'বাগাতিপাড়া' },
          { id: 'lalpur', nameEn: 'Lalpur', nameBn: 'লালপুর' },
          { id: 'gurudaspur', nameEn: 'Gurudaspur', nameBn: 'গুরুদাসপুর' },
          { id: 'naldanga', nameEn: 'Naldanga', nameBn: 'নলডাঙ্গা' }
        ]
      },
      {
        id: 'chapainawabganj',
        nameEn: 'Chapainawabganj',
        nameBn: 'চাঁপাইনবাবগঞ্জ',
        upazilas: [
          { id: 'chapainawabganj_sadar', nameEn: 'Chapainawabganj Sadar', nameBn: 'চাঁপাইনবাবগঞ্জ সদর' },
          { id: 'shibganj_chapai', nameEn: 'Shibganj', nameBn: 'শিবগঞ্জ' },
          { id: 'gomastapur', nameEn: 'Gomastapur', nameBn: 'গোমস্তাপুর' },
          { id: 'nachole', nameEn: 'Nachole', nameBn: 'নাচোল' },
          { id: 'bholahat', nameEn: 'Bholahat', nameBn: 'ভোলাহাট' }
        ]
      },
      {
        id: 'joypurhat',
        nameEn: 'Joypurhat',
        nameBn: 'জয়পুরহাট',
        upazilas: [
          { id: 'joypurhat_sadar', nameEn: 'Joypurhat Sadar', nameBn: 'জয়পুরহাট সদর' },
          { id: 'panchbibi', nameEn: 'Panchbibi', nameBn: 'পাঁচবিবি' },
          { id: 'akkelpur', nameEn: 'Akkelpur', nameBn: 'আক্কেলপুর' },
          { id: 'khetlal', nameEn: 'Khetlal', nameBn: 'খেতলাল' },
          { id: 'kalai', nameEn: 'Kalai', nameBn: 'কালাই' }
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
          { id: 'daulatpur_khu', nameEn: 'Daulatpur', nameBn: 'দৌলতপুর' },
          { id: 'khan_jahan_ali', nameEn: 'Khan Jahan Ali', nameBn: 'খান জাহান আলী' },
          { id: 'dumuria', nameEn: 'Dumuria', nameBn: 'ডুমুরিয়া' },
          { id: 'batiaghata', nameEn: 'Batiaghata', nameBn: 'বটিয়াঘাটা' },
          { id: 'dacope', nameEn: 'Dacope', nameBn: 'দাকোপ' },
          { id: 'paikgachha', nameEn: 'Paikgachha', nameBn: 'পাইকগাছা' },
          { id: 'koyra', nameEn: 'Koyra', nameBn: 'কয়রা' },
          { id: 'rupsha', nameEn: 'Rupsha', nameBn: 'রূপসা' },
          { id: 'terokhada', nameEn: 'Terokhada', nameBn: 'তেরখাদা' },
          { id: 'dighalia', nameEn: 'Dighalia', nameBn: 'দিঘলিয়া' },
          { id: 'phultala', nameEn: 'Phultala', nameBn: 'ফুলতলা' }
        ]
      },
      {
        id: 'jashore',
        nameEn: 'Jashore',
        nameBn: 'যশোর',
        upazilas: [
          { id: 'abhaynagar', nameEn: 'Abhaynagar', nameBn: 'অভয়নগর' },
          { id: 'bagherpara', nameEn: 'Bagherpara', nameBn: 'বাঘারপাড়া' },
          { id: 'chaugachha', nameEn: 'Chaugachha', nameBn: 'চৌগাছা' },
          { id: 'jhikargachha', nameEn: 'Jhikargachha', nameBn: 'ঝিকরগাছা' },
          { id: 'keshabpur', nameEn: 'Keshabpur', nameBn: 'কেশবপুর' },
          { id: 'jashore_sadar', nameEn: 'Jashore Sadar', nameBn: 'যশোর সদর' },
          { id: 'manirampur', nameEn: 'Manirampur', nameBn: 'মণিরামপুর' },
          { id: 'sharsha', nameEn: 'Sharsha', nameBn: 'শার্শা' }
        ]
      },
      {
        id: 'kushtia',
        nameEn: 'Kushtia',
        nameBn: 'কুষ্টিয়া',
        upazilas: [
          { id: 'kushtia_sadar', nameEn: 'Kushtia Sadar', nameBn: 'কুষ্টিয়া সদর' },
          { id: 'kumarkhali', nameEn: 'Kumarkhali', nameBn: 'কুমারখালী' },
          { id: 'daulatpur_kus', nameEn: 'Daulatpur', nameBn: 'দৌলতপুর' },
          { id: 'mirpur_kus', nameEn: 'Mirpur', nameBn: 'মিরপুর' },
          { id: 'bheramara', nameEn: 'Bheramara', nameBn: 'ভেড়ামারা' },
          { id: 'khoksa', nameEn: 'Khoksa', nameBn: 'খোকসা' }
        ]
      },
      {
        id: 'satkhira',
        nameEn: 'Satkhira',
        nameBn: 'সাতক্ষীরা',
        upazilas: [
          { id: 'satkhira_sadar', nameEn: 'Satkhira Sadar', nameBn: 'সাতক্ষীরা সদর' },
          { id: 'assasuni', nameEn: 'Assasuni', nameBn: 'আশাশুনি' },
          { id: 'debhata', nameEn: 'Debhata', nameBn: 'দেবহাটা' },
          { id: 'kalaroa', nameEn: 'Kalaroa', nameBn: 'কলারোয়া' },
          { id: 'kaliganj_sat', nameEn: 'Kaliganj', nameBn: 'কালীগঞ্জ' },
          { id: 'shyamnagar', nameEn: 'Shyamnagar', nameBn: 'শ্যামনগর' },
          { id: 'tala', nameEn: 'Tala', nameBn: 'তালা' }
        ]
      },
      {
        id: 'bagerhat',
        nameEn: 'Bagerhat',
        nameBn: 'বাগেরহাট',
        upazilas: [
          { id: 'bagerhat_sadar', nameEn: 'Bagerhat Sadar', nameBn: 'বাগেরহাট সদর' },
          { id: 'chitalmari', nameEn: 'Chitalmari', nameBn: 'চিতলমারী' },
          { id: 'fakirhat', nameEn: 'Fakirhat', nameBn: 'ফকিরহাট' },
          { id: 'kachua_bag', nameEn: 'Kachua', nameBn: 'কচুয়া' },
          { id: 'mollahat', nameEn: 'Mollahat', nameBn: 'মোল্লাহাট' },
          { id: 'mongla', nameEn: 'Mongla', nameBn: 'মোংলা' },
          { id: 'morrelganj', nameEn: 'Morrelganj', nameBn: 'মোড়েলগঞ্জ' },
          { id: 'rampal', nameEn: 'Rampal', nameBn: 'রামপাল' },
          { id: 'sarankhola', nameEn: 'Sarankhola', nameBn: 'শরণখোলা' }
        ]
      },
      {
        id: 'jhenaidah',
        nameEn: 'Jhenaidah',
        nameBn: 'ঝিনাইদহ',
        upazilas: [
          { id: 'jhenaidah_sadar', nameEn: 'Jhenaidah Sadar', nameBn: 'ঝিনাইদহ সদর' },
          { id: 'harinakunda', nameEn: 'Harinakunda', nameBn: 'হরিণাকুণ্ডু' },
          { id: 'kaliganj_jhen', nameEn: 'Kaliganj', nameBn: 'কালীগঞ্জ' },
          { id: 'kotchandpur', nameEn: 'Kotchandpur', nameBn: 'কোটচাঁদপুর' },
          { id: 'maheshpur', nameEn: 'Maheshpur', nameBn: 'মহেশপুর' },
          { id: 'shailkupa', nameEn: 'Shailkupa', nameBn: 'শৈলকুপা' }
        ]
      },
      {
        id: 'chuadanga',
        nameEn: 'Chuadanga',
        nameBn: 'চুয়াডাঙ্গা',
        upazilas: [
          { id: 'chuadanga_sadar', nameEn: 'Chuadanga Sadar', nameBn: 'চুয়াডাঙ্গা সদর' },
          { id: 'alamdanga', nameEn: 'Alamdanga', nameBn: 'আলমডাঙ্গা' },
          { id: 'damurhuda', nameEn: 'Damurhuda', nameBn: 'দামুড়হুদা' },
          { id: 'jibannagar', nameEn: 'Jibannagar', nameBn: 'জীবননগর' }
        ]
      },
      {
        id: 'magura',
        nameEn: 'Magura',
        nameBn: 'মাগুরা',
        upazilas: [
          { id: 'magura_sadar', nameEn: 'Magura Sadar', nameBn: 'মাগুরা সদর' },
          { id: 'mohammadpur_mag', nameEn: 'Mohammadpur', nameBn: 'মোহাম্মদপুর' },
          { id: 'shalikha', nameEn: 'Shalikha', nameBn: 'শালিখা' },
          { id: 'sreepur_mag', nameEn: 'Sreepur', nameBn: 'শ্রীপুর' }
        ]
      },
      {
        id: 'meherpur',
        nameEn: 'Meherpur',
        nameBn: 'মেহেরপুর',
        upazilas: [
          { id: 'meherpur_sadar', nameEn: 'Meherpur Sadar', nameBn: 'মেহেরপুর সদর' },
          { id: 'gangni', nameEn: 'Gangni', nameBn: 'গাংনী' },
          { id: 'mujibnagar', nameEn: 'Mujibnagar', nameBn: 'মুজিবনগর' }
        ]
      },
      {
        id: 'narail',
        nameEn: 'Narail',
        nameBn: 'নড়াইল',
        upazilas: [
          { id: 'narail_sadar', nameEn: 'Narail Sadar', nameBn: 'নড়াইল সদর' },
          { id: 'kalia', nameEn: 'Kalia', nameBn: 'কালিয়া' },
          { id: 'lohagara_nar', nameEn: 'Lohagara', nameBn: 'লোহাগাড়া' }
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
          { id: 'babuganj', nameEn: 'Babuganj', nameBn: 'বাবুগঞ্জ' },
          { id: 'banaripara', nameEn: 'Banaripara', nameBn: 'বানারীপাড়া' },
          { id: 'gournadi', nameEn: 'Gournadi', nameBn: 'গৌরনদী' },
          { id: 'agailjhara', nameEn: 'Agailjhara', nameBn: 'আগৈলঝাড়া' },
          { id: 'mehendiganj', nameEn: 'Mehendiganj', nameBn: 'মেহেন্দিগঞ্জ' },
          { id: 'muladi', nameEn: 'Muladi', nameBn: 'মুলাদী' },
          { id: 'hizla', nameEn: 'Hizla', nameBn: 'হিজলা' },
          { id: 'wazirpur', nameEn: 'Wazirpur', nameBn: 'উজিরপুর' }
        ]
      },
      {
        id: 'patuakhali',
        nameEn: 'Patuakhali',
        nameBn: 'পটুয়াখালী',
        upazilas: [
          { id: 'patuakhali_sadar', nameEn: 'Patuakhali Sadar', nameBn: 'পটুয়াখালী সদর' },
          { id: 'bauphal', nameEn: 'Bauphal', nameBn: 'বাউফল' },
          { id: 'dashmina', nameEn: 'Dashmina', nameBn: 'দশমিনা' },
          { id: 'galachipa', nameEn: 'Galachipa', nameBn: 'গলাচিপা' },
          { id: 'kalapara', nameEn: 'Kalapara', nameBn: 'কলাপাড়া' },
          { id: 'mirzaganj', nameEn: 'Mirzaganj', nameBn: 'মির্জাগঞ্জ' },
          { id: 'dumki', nameEn: 'Dumki', nameBn: 'দুমকি' },
          { id: 'rangabali', nameEn: 'Rangabali', nameBn: 'রাঙ্গাবালী' }
        ]
      },
      {
        id: 'bhola',
        nameEn: 'Bhola',
        nameBn: 'ভোলা',
        upazilas: [
          { id: 'bhola_sadar', nameEn: 'Bhola Sadar', nameBn: 'ভোলা সদর' },
          { id: 'burhanuddin', nameEn: 'Burhanuddin', nameBn: 'বোরহানউদ্দিন' },
          { id: 'char_fasson', nameEn: 'Char Fasson', nameBn: 'চরফ্যাশন' },
          { id: 'daulatkhan', nameEn: 'Daulatkhan', nameBn: 'দৌলতখান' },
          { id: 'lalmohan', nameEn: 'Lalmohan', nameBn: 'লালমোহন' },
          { id: 'manpura', nameEn: 'Manpura', nameBn: 'মনপুরা' },
          { id: 'tazumuddin', nameEn: 'Tazumuddin', nameBn: 'তজুমদ্দিন' }
        ]
      },
      {
        id: 'pirojpur',
        nameEn: 'Pirojpur',
        nameBn: 'পিরোজপুর',
        upazilas: [
          { id: 'pirojpur_sadar', nameEn: 'Pirojpur Sadar', nameBn: 'পিরোজপুর সদর' },
          { id: 'bhandaria', nameEn: 'Bhandaria', nameBn: 'ভাণ্ডারিয়া' },
          { id: 'mathbaria', nameEn: 'Mathbaria', nameBn: 'মঠবাড়িয়া' },
          { id: 'nazirpur', nameEn: 'Nazirpur', nameBn: 'নাজিরপুর' },
          { id: 'nesarabad', nameEn: 'Nesarabad (Swarupkati)', nameBn: 'নেছারাবাদ (স্বরূপকাঠি)' },
          { id: 'kawkhali_pir', nameEn: 'Kawkhali', nameBn: 'কাউখালী' },
          { id: 'indurkani', nameEn: 'Indurkani', nameBn: 'ইন্দুরকানী' }
        ]
      },
      {
        id: 'barguna',
        nameEn: 'Barguna',
        nameBn: 'বরগুনা',
        upazilas: [
          { id: 'barguna_sadar', nameEn: 'Barguna Sadar', nameBn: 'বরগুনা সদর' },
          { id: 'amtali', nameEn: 'Amtali', nameBn: 'আমতলী' },
          { id: 'bamna', nameEn: 'Bamna', nameBn: 'বামনা' },
          { id: 'betagi', nameEn: 'Betagi', nameBn: 'বেতাগী' },
          { id: 'patharghata', nameEn: 'Patharghata', nameBn: 'পাথরঘাটা' },
          { id: 'taltali', nameEn: 'Taltali', nameBn: 'তালতলী' }
        ]
      },
      {
        id: 'jhalokati',
        nameEn: 'Jhalokati',
        nameBn: 'ঝালকাঠি',
        upazilas: [
          { id: 'jhalokati_sadar', nameEn: 'Jhalokati Sadar', nameBn: 'ঝালকাঠি সদর' },
          { id: 'kathalia', nameEn: 'Kathalia', nameBn: 'কাঠালিয়া' },
          { id: 'nalchhiti', nameEn: 'Nalchhiti', nameBn: 'নলছিটি' },
          { id: 'rajapur', nameEn: 'Rajapur', nameBn: 'রাজাপুর' }
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
          { id: 'bishwanath', nameEn: 'Bishwanath', nameBn: 'বিশ্বনাথ' },
          { id: 'dakshin_surma', nameEn: 'Dakshin Surma', nameBn: 'দক্ষিণ সুরমা' },
          { id: 'fenchuganj', nameEn: 'Fenchuganj', nameBn: 'ফেঞ্চুগঞ্জ' },
          { id: 'golapganj', nameEn: 'Golapganj', nameBn: 'গোলাপগঞ্জ' },
          { id: 'gowainghat', nameEn: 'Gowainghat', nameBn: 'গোয়াইনঘাট' },
          { id: 'jaintiapur', nameEn: 'Jaintiapur', nameBn: 'জৈন্তাপুর' },
          { id: 'kanaighat', nameEn: 'Kanaighat', nameBn: 'কানাইঘাট' },
          { id: 'companiganj_syl', nameEn: 'Companiganj', nameBn: 'কোম্পানীগঞ্জ' },
          { id: 'zakiganj', nameEn: 'Zakiganj', nameBn: 'জকিগঞ্জ' },
          { id: 'balaganj', nameEn: 'Balaganj', nameBn: 'বালাগঞ্জ' },
          { id: 'osmani_nagar', nameEn: 'Osmani Nagar', nameBn: 'ওসমানীনগর' }
        ]
      },
      {
        id: 'moulvibazar',
        nameEn: 'Moulvibazar',
        nameBn: 'মৌলভীবাজার',
        upazilas: [
          { id: 'moulvibazar_sadar', nameEn: 'Moulvibazar Sadar', nameBn: 'মৌলভীবাজার সদর' },
          { id: 'barlekha', nameEn: 'Barlekha', nameBn: 'বড়লেখা' },
          { id: 'juri', nameEn: 'Juri', nameBn: 'জুড়ী' },
          { id: 'kamalganj', nameEn: 'Kamalganj', nameBn: 'কমলগঞ্জ' },
          { id: 'kulaura', nameEn: 'Kulaura', nameBn: 'কুলাউড়া' },
          { id: 'rajnagar', nameEn: 'Rajnagar', nameBn: 'রাজনগর' },
          { id: 'sreemangal', nameEn: 'Sreemangal', nameBn: 'শ্রীমঙ্গল' }
        ]
      },
      {
        id: 'habiganj',
        nameEn: 'Habiganj',
        nameBn: 'হবিগঞ্জ',
        upazilas: [
          { id: 'habiganj_sadar', nameEn: 'Habiganj Sadar', nameBn: 'হবিগঞ্জ সদর' },
          { id: 'ajmiriganj', nameEn: 'Ajmiriganj', nameBn: 'আজমিরীগঞ্জ' },
          { id: 'bahubal', nameEn: 'Bahubal', nameBn: 'বাহুবল' },
          { id: 'baniyachong', nameEn: 'Baniyachong', nameBn: 'বানিয়াচং' },
          { id: 'chunarughat', nameEn: 'Chunarughat', nameBn: 'চুনারুঘাট' },
          { id: 'lakhai', nameEn: 'Lakhai', nameBn: 'লাখাই' },
          { id: 'madhabpur', nameEn: 'Madhabpur', nameBn: 'মাধবপুর' },
          { id: 'nabiganj', nameEn: 'Nabiganj', nameBn: 'নবীগঞ্জ' },
          { id: 'sayestaganj', nameEn: 'Sayestaganj', nameBn: 'শায়েস্তাগঞ্জ' }
        ]
      },
      {
        id: 'sunamganj',
        nameEn: 'Sunamganj',
        nameBn: 'সুনামগঞ্জ',
        upazilas: [
          { id: 'sunamganj_sadar', nameEn: 'Sunamganj Sadar', nameBn: 'সুনামগঞ্জ সদর' },
          { id: 'bishwamvarpur', nameEn: 'Bishwamvarpur', nameBn: 'বিশ্বম্ভরপুর' },
          { id: 'chhatak', nameEn: 'Chhatak', nameBn: 'ছাতক' },
          { id: 'derai', nameEn: 'Derai', nameBn: 'দিরাই' },
          { id: 'dharamapasha', nameEn: 'Dharamapasha', nameBn: 'ধর্মপাশা' },
          { id: 'dowarabazar', nameEn: 'Dowarabazar', nameBn: 'দোয়ারাবাজার' },
          { id: 'jagannathpur', nameEn: 'Jagannathpur', nameBn: 'জগন্নাথপুর' },
          { id: 'jamalganj', nameEn: 'Jamalganj', nameBn: 'জামালগঞ্জ' },
          { id: 'sullah', nameEn: 'Sullah', nameBn: 'শাল্লা' },
          { id: 'tahirpur', nameEn: 'Tahirpur', nameBn: 'তাহিরপুর' },
          { id: 'shantiganj', nameEn: 'Shantiganj', nameBn: 'শান্তিগঞ্জ' },
          { id: 'madhyanagar', nameEn: 'Madhyanagar', nameBn: 'মধ্যনগর' }
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
          { id: 'gangachhara', nameEn: 'Gangachhara', nameBn: 'গংগাচড়া' },
          { id: 'kaunia', nameEn: 'Kaunia', nameBn: 'কাউনিয়া' },
          { id: 'mithapukur', nameEn: 'Mithapukur', nameBn: 'মিঠাপুকুর' },
          { id: 'pirgachha', nameEn: 'Pirgachha', nameBn: 'পীরগাছা' },
          { id: 'pirganj_ran', nameEn: 'Pirganj', nameBn: 'পীরগঞ্জ' },
          { id: 'taraganj', nameEn: 'Taraganj', nameBn: 'তারাগঞ্জ' }
        ]
      },
      {
        id: 'dinajpur',
        nameEn: 'Dinajpur',
        nameBn: 'দিনাজপুর',
        upazilas: [
          { id: 'dinajpur_sadar', nameEn: 'Dinajpur Sadar', nameBn: 'দিনাজপুর সদর' },
          { id: 'birampur', nameEn: 'Birampur', nameBn: 'বিরামপুর' },
          { id: 'birganj', nameEn: 'Birganj', nameBn: 'বীরগঞ্জ' },
          { id: 'birol', nameEn: 'Birol', nameBn: 'বিরল' },
          { id: 'bochaganj', nameEn: 'Bochaganj', nameBn: 'বোচাগঞ্জ' },
          { id: 'chirirbandar', nameEn: 'Chirirbandar', nameBn: 'চিরিরবন্দর' },
          { id: 'phulbari_din', nameEn: 'Phulbari', nameBn: 'ফুলবাড়ী' },
          { id: 'ghoraghat', nameEn: 'Ghoraghat', nameBn: 'ঘোড়াঘাট' },
          { id: 'hakimpur', nameEn: 'Hakimpur', nameBn: 'হাকিমপুর' },
          { id: 'kaharole', nameEn: 'Kaharole', nameBn: 'কাহারোল' },
          { id: 'khansama', nameEn: 'Khansama', nameBn: 'খানসামা' },
          { id: 'nawabganj_din', nameEn: 'Nawabganj', nameBn: 'নবাবগঞ্জ' },
          { id: 'parbatipur', nameEn: 'Parbatipur', nameBn: 'পার্বতীপুর' }
        ]
      },
      {
        id: 'gaibandha',
        nameEn: 'Gaibandha',
        nameBn: 'গাইবান্ধা',
        upazilas: [
          { id: 'gaibandha_sadar', nameEn: 'Gaibandha Sadar', nameBn: 'গাইবান্ধা সদর' },
          { id: 'phulchhari', nameEn: 'Phulchhari', nameBn: 'ফুলছড়ি' },
          { id: 'gobindaganj', nameEn: 'Gobindaganj', nameBn: 'গোবিন্দগঞ্জ' },
          { id: 'palashbari', nameEn: 'Palashbari', nameBn: 'পলাশবাড়ী' },
          { id: 'sadullapur', nameEn: 'Sadullapur', nameBn: 'সাদুল্লাপুর' },
          { id: 'sughatta', nameEn: 'Sughatta', nameBn: 'সাঘাটা' },
          { id: 'sundarganj', nameEn: 'Sundarganj', nameBn: 'সুন্দরগঞ্জ' }
        ]
      },
      {
        id: 'kurigram',
        nameEn: 'Kurigram',
        nameBn: 'কুড়িগ্রাম',
        upazilas: [
          { id: 'kurigram_sadar', nameEn: 'Kurigram Sadar', nameBn: 'কুড়িগ্রাম সদর' },
          { id: 'bhurungamari', nameEn: 'Bhurungamari', nameBn: 'ভুরুঙ্গামারী' },
          { id: 'char_rajibpur', nameEn: 'Char Rajibpur', nameBn: 'চর রাজিবপুর' },
          { id: 'chilmari', nameEn: 'Chilmari', nameBn: 'চিলমারী' },
          { id: 'phulbari_kur', nameEn: 'Phulbari', nameBn: 'ফুলবাড়ী' },
          { id: 'nageshwari', nameEn: 'Nageshwari', nameBn: 'নাগেশ্বরী' },
          { id: 'rajarhat', nameEn: 'Rajarhat', nameBn: 'রাজারহাট' },
          { id: 'raomari', nameEn: 'Raomari', nameBn: 'রৌমারী' },
          { id: 'ulipur', nameEn: 'Ulipur', nameBn: 'উলিপুর' }
        ]
      },
      {
        id: 'lalmonirhat',
        nameEn: 'Lalmonirhat',
        nameBn: 'লালমনিরহাট',
        upazilas: [
          { id: 'lalmonirhat_sadar', nameEn: 'Lalmonirhat Sadar', nameBn: 'লালমনিরহাট সদর' },
          { id: 'aditmari', nameEn: 'Aditmari', nameBn: 'আদিতমারী' },
          { id: 'hatibandha', nameEn: 'Hatibandha', nameBn: 'হাতীবান্ধা' },
          { id: 'kaliganj_lal', nameEn: 'Kaliganj', nameBn: 'কালীগঞ্জ' },
          { id: 'patgram', nameEn: 'Patgram', nameBn: 'পাটগ্রাম' }
        ]
      },
      {
        id: 'nilphamari',
        nameEn: 'Nilphamari',
        nameBn: 'নীলফামারী',
        upazilas: [
          { id: 'nilphamari_sadar', nameEn: 'Nilphamari Sadar', nameBn: 'নীলফামারী সদর' },
          { id: 'dimla', nameEn: 'Dimla', nameBn: 'ডিমলা' },
          { id: 'domar', nameEn: 'Domar', nameBn: 'ডোমার' },
          { id: 'jaldhaka', nameEn: 'Jaldhaka', nameBn: 'জলঢাকা' },
          { id: 'kishoreganj_nil', nameEn: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ' },
          { id: 'syedpur', nameEn: 'Syedpur', nameBn: 'সৈয়দপুর' }
        ]
      },
      {
        id: 'panchagarh',
        nameEn: 'Panchagarh',
        nameBn: 'পঞ্চগড়',
        upazilas: [
          { id: 'panchagarh_sadar', nameEn: 'Panchagarh Sadar', nameBn: 'পঞ্চগড় সদর' },
          { id: 'atwari', nameEn: 'Atwari', nameBn: 'আটোয়ারী' },
          { id: 'boda', nameEn: 'Boda', nameBn: 'বোদা' },
          { id: 'debiganj', nameEn: 'Debiganj', nameBn: 'দেবীগঞ্জ' },
          { id: 'tetulia', nameEn: 'Tetulia', nameBn: 'তেঁতুলিয়া' }
        ]
      },
      {
        id: 'thakurgaon',
        nameEn: 'Thakurgaon',
        nameBn: 'ঠাকুরগাঁও',
        upazilas: [
          { id: 'thakurgaon_sadar', nameEn: 'Thakurgaon Sadar', nameBn: 'ঠাকুরগাঁও সদর' },
          { id: 'baliadangi', nameEn: 'Baliadangi', nameBn: 'বালিয়াডাঙ্গী' },
          { id: 'haripur', nameEn: 'Haripur', nameBn: 'হরিপুর' },
          { id: 'pirganj_thak', nameEn: 'Pirganj', nameBn: 'পীরগঞ্জ' },
          { id: 'ranisankhail', nameEn: 'Ranisankhail', nameBn: 'রাণীশংকৈল' }
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
          { id: 'bhaluka', nameEn: 'Bhaluka', nameBn: 'ভালুকা' },
          { id: 'dhobaura', nameEn: 'Dhobaura', nameBn: 'ধোবাউড়া' },
          { id: 'fulbaria', nameEn: 'Fulbaria', nameBn: 'ফুলবাড়ীয়া' },
          { id: 'gafargaon', nameEn: 'Gafargaon', nameBn: 'গফরগাঁও' },
          { id: 'gauripur', nameEn: 'Gauripur', nameBn: 'গৌরীপুর' },
          { id: 'haluaghat', nameEn: 'Haluaghat', nameBn: 'হালুয়াঘাট' },
          { id: 'ishwarganj', nameEn: 'Ishwarganj', nameBn: 'ঈশ্বরগঞ্জ' },
          { id: 'muktagachha', nameEn: 'Muktagachha', nameBn: 'মুক্তাগাছা' },
          { id: 'nandail', nameEn: 'Nandail', nameBn: 'নান্দাইল' },
          { id: 'phulpur', nameEn: 'Phulpur', nameBn: 'ফুলপুর' },
          { id: 'trishal', nameEn: 'Trishal', nameBn: 'ত্রিশাল' },
          { id: 'tara_khanda', nameEn: 'Tara Khanda', nameBn: 'তারাকান্দা' }
        ]
      },
      {
        id: 'jamalpur',
        nameEn: 'Jamalpur',
        nameBn: 'জামালপুর',
        upazilas: [
          { id: 'jamalpur_sadar', nameEn: 'Jamalpur Sadar', nameBn: 'জামালপুর সদর' },
          { id: 'bakshiganj', nameEn: 'Bakshiganj', nameBn: 'বকশীগঞ্জ' },
          { id: 'dewanganj', nameEn: 'Dewanganj', nameBn: 'দেওয়ানগঞ্জ' },
          { id: 'islampur', nameEn: 'Islampur', nameBn: 'ইসলামপুর' },
          { id: 'madarganj', nameEn: 'Madarganj', nameBn: 'মাদারগঞ্জ' },
          { id: 'melandaha', nameEn: 'Melandaha', nameBn: 'মেলান্দহ' },
          { id: 'sarishabari', nameEn: 'Sarishabari', nameBn: 'সরিষাবাড়ী' }
        ]
      },
      {
        id: 'netrokona',
        nameEn: 'Netrokona',
        nameBn: 'নেত্রকোণা',
        upazilas: [
          { id: 'netrokona_sadar', nameEn: 'Netrokona Sadar', nameBn: 'নেত্রকোণা সদর' },
          { id: 'atpara', nameEn: 'Atpara', nameBn: 'আটপাড়া' },
          { id: 'barhatta', nameEn: 'Barhatta', nameBn: 'বারহাট্টা' },
          { id: 'durgapur_net', nameEn: 'Durgapur', nameBn: 'দুর্গাপুর' },
          { id: 'khaliajuri', nameEn: 'Khaliajuri', nameBn: 'খালিয়াজুরী' },
          { id: 'kalmakanda', nameEn: 'Kalmakanda', nameBn: 'কলমাকান্দা' },
          { id: 'kendua', nameEn: 'Kendua', nameBn: 'কেন্দুয়া' },
          { id: 'madan', nameEn: 'Madan', nameBn: 'মদন' },
          { id: 'mohanganj', nameEn: 'Mohanganj', nameBn: 'মোহনগঞ্জ' },
          { id: 'purbadhala', nameEn: 'Purbadhala', nameBn: 'পূর্বধলা' }
        ]
      },
      {
        id: 'sherpur',
        nameEn: 'Sherpur',
        nameBn: 'শেরপুর',
        upazilas: [
          { id: 'sherpur_sadar', nameEn: 'Sherpur Sadar', nameBn: 'শেরপুর সদর' },
          { id: 'jhenaigati', nameEn: 'Jhenaigati', nameBn: 'ঝিনাইগাতী' },
          { id: 'nakla', nameEn: 'Nakla', nameBn: 'নকলা' },
          { id: 'nalitabari', nameEn: 'Nalitabari', nameBn: 'নালিতাবাড়ী' },
          { id: 'sreebardi', nameEn: 'Sreebardi', nameBn: 'শ্রীবরদী' }
        ]
      }
    ]
  }
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = typeof BLOOD_GROUPS[number];

/**
 * Historical and informal spelling aliases map -> canonical slug ID
 */
export const LOCATION_ALIASES: Record<string, string> = {
  // Legacy English spellings
  'jessore': 'jashore',
  'chittagong': 'chattogram',
  'bogra': 'bogura',
  'barisal': 'barishal',
  'comilla': 'cumilla',
  'coxs_bazar': 'coxsbazar',
  "cox's_bazar": 'coxsbazar',
  'coxsbazaar': 'coxsbazar',
  'cox_bazar': 'coxsbazar',
  'jhalokathi': 'jhalokati',
  'jhalakathi': 'jhalokati',
  'dacca': 'dhaka',
  'moulvibazar': 'moulvibazar',
  'maulvibazar': 'moulvibazar',
  'netrakona': 'netrokona',
  'chapainababganj': 'chapainawabganj',
  'nawabganj': 'chapainawabganj',
  
  // Bengali text normalization map
  'যশোর': 'jashore',
  'চট্টগ্রাম': 'chattogram',
  'বগুড়া': 'bogura',
  'বরিশাল': 'barishal',
  'কুমিল্লা': 'cumilla',
  'কক্সবাজার': 'coxsbazar',
  'ঢাকা': 'dhaka',
  'খুলনা': 'khulna',
  'রাজশাহী': 'rajshahi',
  'সিলেট': 'sylhet',
  'রংপুর': 'rangpur',
  'ময়মনসিংহ': 'mymensingh'
};

/**
 * Normalizes input slug to lowercase trimmed canonical ID
 */
export function normalizeLocationSlug(input?: string): string {
  if (!input) return '';
  const clean = input.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return LOCATION_ALIASES[clean] || LOCATION_ALIASES[input.trim()] || clean;
}

/**
 * Validates division -> district -> upazila hierarchy
 */
export function validateLocationHierarchy(
  divisionInput?: string,
  districtInput?: string,
  upazilaInput?: string
): { valid: boolean; error?: string; canonical?: { division: string; district: string; upazila?: string } } {
  if (!divisionInput || !districtInput) {
    return { valid: false, error: 'বিভাগ এবং জেলা উভয়ই বাধ্যতামূলক।' };
  }

  const normDiv = normalizeLocationSlug(divisionInput);
  const normDist = normalizeLocationSlug(districtInput);

  const division = BANGLADESH_DIVISIONS.find(
    d => d.id === normDiv || d.nameEn.toLowerCase() === normDiv || d.nameBn === divisionInput
  );

  if (!division) {
    return { valid: false, error: `অকার্যকর বিভাগ: '${divisionInput}'` };
  }

  const district = division.districts.find(
    dst => dst.id === normDist || dst.nameEn.toLowerCase() === normDist || dst.nameBn === districtInput
  );

  if (!district) {
    return { 
      valid: false, 
      error: `জেলা '${districtInput}' ${division.nameBn} (${division.nameEn}) বিভাগের অধীনে পাওয়া যায়নি।` 
    };
  }

  let canonicalUpazila: string | undefined = undefined;
  if (upazilaInput && upazilaInput.trim().length > 0) {
    const normUpz = normalizeLocationSlug(upazilaInput);
    const upazila = district.upazilas.find(
      u => u.id === normUpz || u.nameEn.toLowerCase() === normUpz || u.nameBn === upazilaInput.trim()
    );
    if (!upazila) {
      return {
        valid: false,
        error: `উপজেলা '${upazilaInput}' ${district.nameBn} (${district.nameEn}) জেলার অধীনে অন্তর্ভুক্ত নয়।`
      };
    }
    canonicalUpazila = upazila.id;
  }

  return {
    valid: true,
    canonical: {
      division: division.id,
      district: district.id,
      upazila: canonicalUpazila
    }
  };
}

/**
 * Resolves a district and its parent division from a single district slug/name
 */
export function resolveCanonicalDistrict(districtInput?: string): { divisionId: string; districtId: string; districtNameBn: string; districtNameEn: string } | null {
  if (!districtInput) return null;
  const norm = normalizeLocationSlug(districtInput);
  
  for (const div of BANGLADESH_DIVISIONS) {
    const found = div.districts.find(d => d.id === norm || d.nameEn.toLowerCase() === norm || d.nameBn === districtInput.trim());
    if (found) {
      return {
        divisionId: div.id,
        districtId: found.id,
        districtNameBn: found.nameBn,
        districtNameEn: found.nameEn
      };
    }
  }
  return null;
}
