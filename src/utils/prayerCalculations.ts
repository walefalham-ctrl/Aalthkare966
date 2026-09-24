import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  SunnahTimes,
  Madhab,
  Qibla,
  Prayer,
} from 'adhan';
import {
  PrayerName,
  PrayerTimeItem,
  CalculationMethodKey,
  MadhabKey,
  IslamicDateInfo,
  WitrReminderSettings,
} from '../types/prayer';

export const PRAYER_NAMES_ARABIC: Record<PrayerName, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

export const PRAYER_NAMES_ENGLISH: Record<PrayerName, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export const CALCULATION_METHOD_LABELS: Record<CalculationMethodKey, string> = {
  UmmAlQura: 'أم القرى (مكة المكرمة والسعودية)',
  MuslimWorldLeague: 'رابطة العالم الإسلامي (أوروبا ومعظم الدول)',
  Egyptian: 'الهيئة المصرية العامة للمساحة (مصر وأفريقيا)',
  NorthAmerica: 'الاتحاد الإسلامي لأمريكا الشمالية (ISNA)',
  Dubai: 'دائرة الشؤون الإسلامية (دبي والإمارات)',
  Qatar: 'وزارة الأوقاف والشؤون الإسلامية (قطر)',
  Kuwait: 'وزارة الأوقاف (الكويت)',
  Karachi: 'جامعة العلوم الإسلامية بكراتشي (باكستان والهند)',
  Singapore: 'المجلس الإسلامي بسنغافورة (MUIS)',
  MoonsightingCommittee: 'لجنة رؤية الهلال (Moonsighting Committee)',
};

/**
 * Get the calculation parameters object for adhan
 */
export function getCalculationParameters(method: CalculationMethodKey, madhab: MadhabKey) {
  let params;
  switch (method) {
    case 'UmmAlQura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'Egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'NorthAmerica':
      params = CalculationMethod.NorthAmerica();
      break;
    case 'Dubai':
      params = CalculationMethod.Dubai();
      break;
    case 'Qatar':
      params = CalculationMethod.Qatar();
      break;
    case 'Kuwait':
      params = CalculationMethod.Kuwait();
      break;
    case 'Karachi':
      params = CalculationMethod.Karachi();
      break;
    case 'Singapore':
      params = CalculationMethod.Singapore();
      break;
    case 'MoonsightingCommittee':
      params = CalculationMethod.MoonsightingCommittee();
      break;
    case 'MuslimWorldLeague':
    default:
      params = CalculationMethod.MuslimWorldLeague();
      break;
  }

  if (madhab === 'hanafi') {
    params.madhab = Madhab.Hanafi;
  } else {
    params.madhab = Madhab.Shafi;
  }

  return params;
}

/**
 * Calculate prayer times for coordinates and date
 */
export function calculatePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  method: CalculationMethodKey = 'UmmAlQura',
  madhab: MadhabKey = 'shafi'
): {
  items: PrayerTimeItem[];
  nextPrayerItem: PrayerTimeItem | null;
  currentPrayerItem: PrayerTimeItem | null;
  qiyamTimes: { middleOfTheNight: Date; lastThirdOfTheNight: Date };
  duhaTime: Date;
  rawPrayerTimes: PrayerTimes;
} {
  const coordinates = new Coordinates(latitude, longitude);
  const params = getCalculationParameters(method, madhab);
  const prayerTimes = new PrayerTimes(coordinates, date, params);
  const sunnahTimes = new SunnahTimes(prayerTimes);

  // Duha starts ~15-20 mins after sunrise
  const duhaTime = new Date(prayerTimes.sunrise.getTime() + 20 * 60 * 1000);

  const rawList: { id: PrayerName; time: Date }[] = [
    { id: 'fajr', time: prayerTimes.fajr },
    { id: 'sunrise', time: prayerTimes.sunrise },
    { id: 'dhuhr', time: prayerTimes.dhuhr },
    { id: 'asr', time: prayerTimes.asr },
    { id: 'maghrib', time: prayerTimes.maghrib },
    { id: 'isha', time: prayerTimes.isha },
  ];

  const now = date.getTime();

  // Find next prayer
  // In adhan library: prayerTimes.nextPrayer() returns 'fajr', 'sunrise', etc. or 'none'
  const nextAdhanPrayer = prayerTimes.nextPrayer();
  let nextPrayerId: PrayerName | null = null;

  if (nextAdhanPrayer !== Prayer.None) {
    switch (nextAdhanPrayer) {
      case Prayer.Fajr: nextPrayerId = 'fajr'; break;
      case Prayer.Sunrise: nextPrayerId = 'sunrise'; break;
      case Prayer.Dhuhr: nextPrayerId = 'dhuhr'; break;
      case Prayer.Asr: nextPrayerId = 'asr'; break;
      case Prayer.Maghrib: nextPrayerId = 'maghrib'; break;
      case Prayer.Isha: nextPrayerId = 'isha'; break;
    }
  } else {
    // If none left today, next prayer is Fajr tomorrow
    nextPrayerId = 'fajr';
  }

  // Find current prayer
  const currentAdhanPrayer = prayerTimes.currentPrayer();
  let currentPrayerId: PrayerName | null = null;
  if (currentAdhanPrayer !== Prayer.None) {
    switch (currentAdhanPrayer) {
      case Prayer.Fajr: currentPrayerId = 'fajr'; break;
      case Prayer.Sunrise: currentPrayerId = 'sunrise'; break;
      case Prayer.Dhuhr: currentPrayerId = 'dhuhr'; break;
      case Prayer.Asr: currentPrayerId = 'asr'; break;
      case Prayer.Maghrib: currentPrayerId = 'maghrib'; break;
      case Prayer.Isha: currentPrayerId = 'isha'; break;
    }
  }

  // If next is fajr and now is after isha, next prayer time is tomorrow's fajr
  const items: PrayerTimeItem[] = rawList.map((item) => {
    let targetTime = item.time;
    // If next is fajr and currently after isha, fajr target is tomorrow
    if (item.id === 'fajr' && nextAdhanPrayer === Prayer.None) {
      const tomorrow = new Date(date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowTimes = new PrayerTimes(coordinates, tomorrow, params);
      targetTime = tomorrowTimes.fajr;
    }

    return {
      id: item.id,
      arabicName: PRAYER_NAMES_ARABIC[item.id],
      englishName: PRAYER_NAMES_ENGLISH[item.id],
      time: targetTime,
      formattedTime: formatTimeString(item.time),
      isNext: item.id === nextPrayerId,
      isCurrent: item.id === currentPrayerId,
    };
  });

  let nextPrayerItem = items.find((i) => i.isNext) || items[0];
  if (nextAdhanPrayer === Prayer.None) {
    // Calculate tomorrow's Fajr for accurate countdown
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = new PrayerTimes(coordinates, tomorrow, params);
    nextPrayerItem = {
      id: 'fajr',
      arabicName: PRAYER_NAMES_ARABIC.fajr,
      englishName: PRAYER_NAMES_ENGLISH.fajr,
      time: tomorrowTimes.fajr,
      formattedTime: formatTimeString(tomorrowTimes.fajr),
      isNext: true,
      isCurrent: false,
    };
  }

  const currentPrayerItem = items.find((i) => i.isCurrent) || null;

  return {
    items,
    nextPrayerItem,
    currentPrayerItem,
    qiyamTimes: {
      middleOfTheNight: sunnahTimes.middleOfTheNight,
      lastThirdOfTheNight: sunnahTimes.lastThirdOfTheNight,
    },
    duhaTime,
    rawPrayerTimes: prayerTimes,
  };
}

/**
 * Format time to 12-hour Arabic (e.g. "04:32 ص" / "05:15 م")
 */
export function formatTimeString(date: Date, showPeriod: boolean = true): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'م' : 'ص';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12

  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');

  if (!showPeriod) {
    return `${hoursStr}:${minutesStr}`;
  }
  return `${hoursStr}:${minutesStr} ${period}`;
}

/**
 * Format time to 24-hour format
 */
export function formatTime24(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Calculate Qibla direction in degrees from true North
 */
export function calculateQiblaBearing(latitude: number, longitude: number): {
  degrees: number;
  compassDirectionText: string;
  distanceKm: number;
} {
  const coordinates = new Coordinates(latitude, longitude);
  const qiblaAngle = Qibla(coordinates);

  // Calculate distance to Kaaba (Haversine formula)
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;
  const R = 6371; // Earth radius in km

  const dLat = ((kaabaLat - latitude) * Math.PI) / 180;
  const dLng = ((kaabaLng - longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((latitude * Math.PI) / 180) *
      Math.cos((kaabaLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  // Direction name in Arabic
  const deg = (qiblaAngle + 360) % 360;
  let dirText = 'الشمال';
  if (deg >= 22.5 && deg < 67.5) dirText = 'شمال شرق';
  else if (deg >= 67.5 && deg < 112.5) dirText = 'الشرق';
  else if (deg >= 112.5 && deg < 157.5) dirText = 'جنوب شرق';
  else if (deg >= 157.5 && deg < 202.5) dirText = 'الجنوب';
  else if (deg >= 202.5 && deg < 247.5) dirText = 'جنوب غرب';
  else if (deg >= 247.5 && deg < 292.5) dirText = 'الغرب';
  else if (deg >= 292.5 && deg < 337.5) dirText = 'شمال غرب';

  return {
    degrees: Math.round(qiblaAngle * 10) / 10,
    compassDirectionText: dirText,
    distanceKm,
  };
}

/**
 * Get Islamic / Hijri date details
 */
export function getHijriDate(date: Date = new Date()): IslamicDateInfo {
  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayName = dayNames[date.getDay()];

  try {
    // Attempt standard Intl formatting with Islamic Umm al-Qura calendar
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    let day = 1;
    let month = '';
    let year = 1448;

    for (const p of parts) {
      if (p.type === 'day') day = parseInt(p.value, 10) || 1;
      if (p.type === 'month') month = p.value;
      if (p.type === 'year') year = parseInt(p.value, 10) || 1448;
    }

    const gregorianFormatter = new Intl.DateTimeFormat('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return {
      dayName,
      hijriDay: day,
      hijriMonthName: month || 'رمضان',
      hijriYear: year,
      gregorianDateString: gregorianFormatter.format(date),
      formattedHijri: `${day} ${month} ${year} هـ`,
    };
  } catch {
    // Fallback if Intl is unavailable
    return {
      dayName,
      hijriDay: date.getDate(),
      hijriMonthName: 'شهر الله',
      hijriYear: 1448,
      gregorianDateString: date.toLocaleDateString('ar-EG'),
      formattedHijri: `${date.getDate()} هـ`,
    };
  }
}

/**
 * Calculate countdown details between now and target prayer
 */
export function calculateTimeRemaining(targetTime: Date, now: Date = new Date()) {
  const diffMs = targetTime.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      totalSeconds: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: '00:00:00',
      isNow: true,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return {
    totalSeconds,
    hours,
    minutes,
    seconds,
    formatted: `${hh}:${mm}:${ss}`,
    isNow: false,
  };
}

/**
 * Checks if the current time falls inside the "استعد للصلاة" (Pre-Azan) window
 */
export function checkPreAzanStatus(
  nextPrayerItem: PrayerTimeItem | null,
  minutesBefore: number,
  now: Date = new Date()
): {
  isPreAzanWindow: boolean;
  minutesRemainingToAzan: number;
  prayerName: string;
} {
  if (!nextPrayerItem) {
    return { isPreAzanWindow: false, minutesRemainingToAzan: 0, prayerName: '' };
  }

  // Don't alert for sunrise as a prayer (Sunrise is not an azan prayer, it's end of Fajr)
  if (nextPrayerItem.id === 'sunrise') {
    return { isPreAzanWindow: false, minutesRemainingToAzan: 0, prayerName: '' };
  }

  const diffMs = nextPrayerItem.time.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));

  // If time until prayer is between 0 and minutesBefore (inclusive)
  const isPreAzanWindow = diffMs > 0 && diffMinutes <= minutesBefore;

  return {
    isPreAzanWindow,
    minutesRemainingToAzan: Math.max(1, diffMinutes),
    prayerName: nextPrayerItem.arabicName,
  };
}

/**
 * Calculates the exact target date/time for the Witr reminder based on user setting mode
 */
export function calculateWitrTargetTime(
  witrSettings: WitrReminderSettings,
  qiyamTimes: { middleOfTheNight: Date; lastThirdOfTheNight: Date },
  fajrTime: Date,
  now: Date = new Date()
): { targetTime: Date; description: string } {
  const mode = witrSettings.timingMode || 'lastThird';

  if (mode === 'lastThird') {
    return {
      targetTime: qiyamTimes.lastThirdOfTheNight,
      description: 'ثلث الليل الأخير (أفضل أوقات القيام)',
    };
  }

  if (mode === 'middleOfNight') {
    return {
      targetTime: qiyamTimes.middleOfTheNight,
      description: 'منتصف الليل الشرعي',
    };
  }

  if (mode === 'beforeFajr') {
    const mins = witrSettings.minutesBeforeFajr || 45;
    const target = new Date(fajrTime.getTime() - mins * 60 * 1000);
    return {
      targetTime: target,
      description: `قبل أذان الفجر بـ ${mins} دقيقة`,
    };
  }

  // Fixed Time mode (e.g. "02:30")
  const [hoursStr, minutesStr] = (witrSettings.fixedTime || '02:30').split(':');
  const h = parseInt(hoursStr, 10) || 2;
  const m = parseInt(minutesStr, 10) || 30;

  const target = new Date(now);
  target.setHours(h, m, 0, 0);

  // If fixed time has already passed today by more than 1 hour and it's late night, it might be for tonight or next morning
  return {
    targetTime: target,
    description: `الساعة ${formatTimeString(target)} (وقت مخصص)`,
  };
}

/**
 * Checks if current time is within Witr reminder trigger window
 */
export function checkWitrReminderStatus(
  witrSettings: WitrReminderSettings | undefined,
  qiyamTimes: { middleOfTheNight: Date; lastThirdOfTheNight: Date },
  fajrTime: Date,
  now: Date = new Date()
): {
  isWitrActive: boolean;
  targetTime: Date;
  description: string;
  timeRemaining: { hours: number; minutes: number; seconds: number; isPassed: boolean };
} {
  if (!witrSettings || !witrSettings.enabled) {
    return {
      isWitrActive: false,
      targetTime: qiyamTimes.lastThirdOfTheNight,
      description: '',
      timeRemaining: { hours: 0, minutes: 0, seconds: 0, isPassed: true },
    };
  }

  const { targetTime, description } = calculateWitrTargetTime(
    witrSettings,
    qiyamTimes,
    fajrTime,
    now
  );

  const diffMs = targetTime.getTime() - now.getTime();
  // Active banner window: from 15 minutes before target time until 45 minutes after target time (during late night)
  const isWitrActive = diffMs <= 0 && Math.abs(diffMs) <= 45 * 60 * 1000;

  const totalSecs = Math.abs(Math.floor(diffMs / 1000));
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  return {
    isWitrActive,
    targetTime,
    description,
    timeRemaining: {
      hours,
      minutes,
      seconds,
      isPassed: diffMs <= 0,
    },
  };
}
