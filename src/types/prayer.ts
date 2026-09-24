export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimeItem {
  id: PrayerName;
  arabicName: string;
  englishName: string;
  time: Date;
  formattedTime: string;
  isNext: boolean;
  isCurrent: boolean;
  completed?: boolean;
}

export interface CoordinatesData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  isAutoDetected: boolean;
}

export type CalculationMethodKey =
  | 'UmmAlQura'
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'NorthAmerica'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'Karachi'
  | 'Singapore'
  | 'MoonsightingCommittee';

export type MadhabKey = 'shafi' | 'hanafi';

export type ReminderSoundType = 'chime' | 'voice' | 'both' | 'silent';

export type MuezzinKey =
  | 'makkah'
  | 'madinah'
  | 'alaqsa'
  | 'abdulbasit'
  | 'alafasy'
  | 'synth';

export type WitrTimingMode = 'lastThird' | 'middleOfNight' | 'fixedTime' | 'beforeFajr';

export interface WitrReminderSettings {
  enabled: boolean;
  timingMode: WitrTimingMode; // 'lastThird' (ثلث الليل الأخير), 'middleOfNight' (منتصف الليل), 'fixedTime' (وقت مخصص), 'beforeFajr' (قبل الفجر بدقائق)
  fixedTime: string; // "02:30" (24h)
  minutesBeforeFajr: number; // e.g. 45 or 60 mins before Fajr
  soundType: ReminderSoundType;
}

export interface PreAzanSettings {
  enabled: boolean;
  minutesBefore: number; // e.g., 5, 10, 15, 20, 30
  soundType: ReminderSoundType;
  browserNotification: boolean;
  azanSoundEnabled: boolean;
  selectedMuezzin: MuezzinKey;
  volume: number; // 0 to 1
  calculationMethod: CalculationMethodKey;
  madhab: MadhabKey;
  witrReminder?: WitrReminderSettings;
}

export interface IslamicDateInfo {
  dayName: string;
  hijriDay: number;
  hijriMonthName: string;
  hijriYear: number;
  gregorianDateString: string;
  formattedHijri: string;
}
