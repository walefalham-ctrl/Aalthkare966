export interface PresetCity {
  name: string;
  nameEn: string;
  country: string;
  countryEn: string;
  latitude: number;
  longitude: number;
  defaultMethod?: string;
}

export const PRESET_CITIES: PresetCity[] = [
  // المملكة العربية السعودية
  { name: 'مكة المكرمة', nameEn: 'Makkah', country: 'السعودية', countryEn: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, defaultMethod: 'UmmAlQura' },
  { name: 'المدينة المنورة', nameEn: 'Madinah', country: 'السعودية', countryEn: 'Saudi Arabia', latitude: 24.5247, longitude: 39.5692, defaultMethod: 'UmmAlQura' },
  { name: 'الرياض', nameEn: 'Riyadh', country: 'السعودية', countryEn: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753, defaultMethod: 'UmmAlQura' },
  { name: 'جدة', nameEn: 'Jeddah', country: 'السعودية', countryEn: 'Saudi Arabia', latitude: 21.5433, longitude: 39.1728, defaultMethod: 'UmmAlQura' },
  { name: 'الدمام', nameEn: 'Dammam', country: 'السعودية', countryEn: 'Saudi Arabia', latitude: 26.4207, longitude: 50.0888, defaultMethod: 'UmmAlQura' },

  // مصر
  { name: 'القاهرة', nameEn: 'Cairo', country: 'مصر', countryEn: 'Egypt', latitude: 30.0444, longitude: 31.2357, defaultMethod: 'Egyptian' },
  { name: 'الإسكندرية', nameEn: 'Alexandria', country: 'مصر', countryEn: 'Egypt', latitude: 31.2001, longitude: 29.9187, defaultMethod: 'Egyptian' },
  { name: 'الجيزة', nameEn: 'Giza', country: 'مصر', countryEn: 'Egypt', latitude: 30.0131, longitude: 31.2089, defaultMethod: 'Egyptian' },

  // الإمارات
  { name: 'دبي', nameEn: 'Dubai', country: 'الإمارات', countryEn: 'UAE', latitude: 25.2048, longitude: 55.2708, defaultMethod: 'Dubai' },
  { name: 'أبوظبي', nameEn: 'Abu Dhabi', country: 'الإمارات', countryEn: 'UAE', latitude: 24.4539, longitude: 54.3773, defaultMethod: 'Dubai' },
  { name: 'الشارقة', nameEn: 'Sharjah', country: 'الإمارات', countryEn: 'UAE', latitude: 25.3463, longitude: 55.4209, defaultMethod: 'Dubai' },

  // بلاد الشام والعراق
  { name: 'القدس الشريف', nameEn: 'Jerusalem', country: 'فلسطين', countryEn: 'Palestine', latitude: 31.7683, longitude: 35.2137, defaultMethod: 'MuslimWorldLeague' },
  { name: 'عمان', nameEn: 'Amman', country: 'الأردن', countryEn: 'Jordan', latitude: 31.9454, longitude: 35.9284, defaultMethod: 'MuslimWorldLeague' },
  { name: 'دمشق', nameEn: 'Damascus', country: 'سوريا', countryEn: 'Syria', latitude: 33.5138, longitude: 36.2765, defaultMethod: 'MuslimWorldLeague' },
  { name: 'بيروت', nameEn: 'Beirut', country: 'لبنان', countryEn: 'Lebanon', latitude: 33.8938, longitude: 35.5018, defaultMethod: 'MuslimWorldLeague' },
  { name: 'بغداد', nameEn: 'Baghdad', country: 'العراق', countryEn: 'Iraq', latitude: 33.3152, longitude: 44.3661, defaultMethod: 'MuslimWorldLeague' },
  { name: 'أربيل', nameEn: 'Erbil', country: 'العراق', countryEn: 'Iraq', latitude: 36.1901, longitude: 44.0091, defaultMethod: 'MuslimWorldLeague' },

  // الخليج العربي
  { name: 'الكويت', nameEn: 'Kuwait City', country: 'الكويت', countryEn: 'Kuwait', latitude: 29.3759, longitude: 47.9774, defaultMethod: 'Kuwait' },
  { name: 'الدوحة', nameEn: 'Doha', country: 'قطر', countryEn: 'Qatar', latitude: 25.2854, longitude: 51.5310, defaultMethod: 'Qatar' },
  { name: 'المنامة', nameEn: 'Manama', country: 'البحرين', countryEn: 'Bahrain', latitude: 26.2285, longitude: 50.5860, defaultMethod: 'MuslimWorldLeague' },
  { name: 'مسقط', nameEn: 'Muscat', country: 'عُمان', countryEn: 'Oman', latitude: 23.5880, longitude: 58.3829, defaultMethod: 'MuslimWorldLeague' },

  // المغرب العربي وشمال أفريقيا
  { name: 'الرباط', nameEn: 'Rabat', country: 'المغرب', countryEn: 'Morocco', latitude: 34.0209, longitude: -6.8416, defaultMethod: 'MuslimWorldLeague' },
  { name: 'الدار البيضاء', nameEn: 'Casablanca', country: 'المغرب', countryEn: 'Morocco', latitude: 33.5731, longitude: -7.5898, defaultMethod: 'MuslimWorldLeague' },
  { name: 'تونس', nameEn: 'Tunis', country: 'تونس', countryEn: 'Tunisia', latitude: 36.8065, longitude: 10.1815, defaultMethod: 'MuslimWorldLeague' },
  { name: 'الجزائر', nameEn: 'Algiers', country: 'الجزائر', countryEn: 'Algeria', latitude: 36.7538, longitude: 3.0588, defaultMethod: 'MuslimWorldLeague' },
  { name: 'طرابلس', nameEn: 'Tripoli', country: 'ليبيا', countryEn: 'Libya', latitude: 32.8872, longitude: 13.1913, defaultMethod: 'MuslimWorldLeague' },
  { name: 'الخرطوم', nameEn: 'Khartoum', country: 'السودان', countryEn: 'Sudan', latitude: 15.5007, longitude: 32.5599, defaultMethod: 'Egyptian' },
  { name: 'صنعاء', nameEn: 'Sanaa', country: 'اليمن', countryEn: 'Yemen', latitude: 15.3694, longitude: 44.1910, defaultMethod: 'UmmAlQura' },

  // آسيا وتركيا
  { name: 'إسطنبول', nameEn: 'Istanbul', country: 'تركيا', countryEn: 'Turkey', latitude: 41.0082, longitude: 28.9784, defaultMethod: 'MuslimWorldLeague' },
  { name: 'أنقرة', nameEn: 'Ankara', country: 'تركيا', countryEn: 'Turkey', latitude: 39.9334, longitude: 32.8597, defaultMethod: 'MuslimWorldLeague' },
  { name: 'جاكرتا', nameEn: 'Jakarta', country: 'إندونيسيا', countryEn: 'Indonesia', latitude: -6.2088, longitude: 106.8456, defaultMethod: 'MuslimWorldLeague' },
  { name: 'كوالالمبور', nameEn: 'Kuala Lumpur', country: 'ماليزيا', countryEn: 'Malaysia', latitude: 3.1390, longitude: 101.6869, defaultMethod: 'MuslimWorldLeague' },
  { name: 'كراتشي', nameEn: 'Karachi', country: 'باكستان', countryEn: 'Pakistan', latitude: 24.8607, longitude: 67.0011, defaultMethod: 'Karachi' },
  { name: 'إسلام آباد', nameEn: 'Islamabad', country: 'باكستان', countryEn: 'Pakistan', latitude: 33.6844, longitude: 73.0479, defaultMethod: 'Karachi' },
  { name: 'دكا', nameEn: 'Dhaka', country: 'بنغلاديش', countryEn: 'Bangladesh', latitude: 23.8103, longitude: 90.4125, defaultMethod: 'Karachi' },

  // أوروبا وأمريكا
  { name: 'لندن', nameEn: 'London', country: 'بريطانيا', countryEn: 'UK', latitude: 51.5074, longitude: -0.1278, defaultMethod: 'MuslimWorldLeague' },
  { name: 'باريس', nameEn: 'Paris', country: 'فرنسا', countryEn: 'France', latitude: 48.8566, longitude: 2.3522, defaultMethod: 'MuslimWorldLeague' },
  { name: 'برلين', nameEn: 'Berlin', country: 'ألمانيا', countryEn: 'Germany', latitude: 52.5200, longitude: 13.4050, defaultMethod: 'MuslimWorldLeague' },
  { name: 'نيويورك', nameEn: 'New York', country: 'أمريكا', countryEn: 'USA', latitude: 40.7128, longitude: -74.0060, defaultMethod: 'NorthAmerica' },
  { name: 'واشنطن', nameEn: 'Washington', country: 'أمريكا', countryEn: 'USA', latitude: 38.9072, longitude: -77.0369, defaultMethod: 'NorthAmerica' },
  { name: 'تورونتو', nameEn: 'Toronto', country: 'كندا', countryEn: 'Canada', latitude: 43.6532, longitude: -79.3832, defaultMethod: 'NorthAmerica' },
  { name: 'سيدني', nameEn: 'Sydney', country: 'أستراليا', countryEn: 'Australia', latitude: -33.8688, longitude: 151.2093, defaultMethod: 'MuslimWorldLeague' },
];
