/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import {
  Bell,
  MapPin,
  Compass,
  Calendar,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Heart,
} from 'lucide-react';
import {
  CoordinatesData,
  PreAzanSettings,
  PrayerTimeItem,
} from './types/prayer';
import { PRESET_CITIES } from './data/cities';
import {
  calculatePrayerTimes,
  calculateTimeRemaining,
  checkPreAzanStatus,
  checkWitrReminderStatus,
  getHijriDate,
} from './utils/prayerCalculations';
import {
  playPreAzanChime,
  triggerPreAzanAlert,
  triggerWitrAlert,
  playAzan,
  stopAzan,
  speakArabicAnnouncement,
} from './utils/audioAlerts';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  showPreAzanNotification,
  showAzanNotification,
  showWitrNotification,
} from './utils/notifications';
import { Header } from './components/Header';
import { HeroPrayerCard } from './components/HeroPrayerCard';
import { PreAzanAlertBanner } from './components/PreAzanAlertBanner';
import { WitrReminderBanner } from './components/WitrReminderBanner';
import { PrayerTimesList } from './components/PrayerTimesList';
import { LocationSelectorModal } from './components/LocationSelectorModal';
import { PreAzanSettingsModal } from './components/PreAzanSettingsModal';
import { QiblaCompass } from './components/QiblaCompass';
import { MonthlyScheduleModal } from './components/MonthlyScheduleModal';
import { AthkarSection } from './components/AthkarSection';
import { TasbihCounter } from './components/TasbihCounter';
import { WeeklyPrayerChart } from './components/WeeklyPrayerChart';

// Default initial location: Makkah Al-Mukarramah
const DEFAULT_LOCATION: CoordinatesData = {
  latitude: 21.4225,
  longitude: 39.8262,
  city: 'مكة المكرمة',
  country: 'المملكة العربية السعودية',
  isAutoDetected: false,
};

const DEFAULT_SETTINGS: PreAzanSettings = {
  enabled: true,
  minutesBefore: 15,
  soundType: 'both',
  browserNotification: true,
  azanSoundEnabled: true,
  selectedMuezzin: 'makkah',
  volume: 0.85,
  calculationMethod: 'UmmAlQura',
  madhab: 'shafi',
  witrReminder: {
    enabled: true,
    timingMode: 'lastThird',
    fixedTime: '02:30',
    minutesBeforeFajr: 45,
    soundType: 'both',
  },
};

export default function App() {
  // --- Persistent State ---
  const [location, setLocation] = useState<CoordinatesData>(() => {
    try {
      const saved = localStorage.getItem('prayer_location');
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });

  const [settings, setSettings] = useState<PreAzanSettings>(() => {
    try {
      const saved = localStorage.getItem('prayer_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [completedPrayers, setCompletedPrayers] = useState<Record<string, boolean>>(() => {
    try {
      const todayKey = new Date().toDateString();
      const saved = localStorage.getItem(`prayers_completed_${todayKey}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // --- Runtime Clock & Audio State ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPlayingAzan, setIsPlayingAzan] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState<'prayers' | 'athkar' | 'tasbih'>('prayers');

  // Modals state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isQiblaModalOpen, setIsQiblaModalOpen] = useState(false);
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);

  // Simulated test alert state
  const [simulatedPreAzan, setSimulatedPreAzan] = useState<boolean>(false);
  const [simulatedWitr, setSimulatedWitr] = useState<boolean>(false);

  // Track triggers so notifications don't fire repeatedly every second
  const lastAlertPrayerRef = useRef<string | null>(null);
  const lastAzanPrayerRef = useRef<string | null>(null);
  const lastWitrAlertRef = useRef<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('prayer_location', JSON.stringify(location));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [location]);

  useEffect(() => {
    try {
      localStorage.setItem('prayer_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      const todayKey = new Date().toDateString();
      localStorage.setItem(`prayers_completed_${todayKey}`, JSON.stringify(completedPrayers));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [completedPrayers]);

  // Attempt initial GPS check if first visit and browser allows
  useEffect(() => {
    if (!localStorage.getItem('prayer_location_set') && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation((prev) => ({
            ...prev,
            latitude,
            longitude,
            city: 'موقعي الحالي',
            country: 'تحديد تلقائي',
            isAutoDetected: true,
          }));
          localStorage.setItem('prayer_location_set', 'true');
        },
        () => {
          // If denied, keep Makkah default gracefully
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Live Clock Tick every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Watch position if enabled
  useEffect(() => {
    if (isWatchingLocation && 'geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
        },
        (err) => console.warn('Watch location error:', err),
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
      );
    } else if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isWatchingLocation]);

  // --- Calculate Prayer Times dynamically ---
  const {
    items: prayerItems,
    nextPrayerItem,
    currentPrayerItem,
    qiyamTimes,
    duhaTime,
  } = calculatePrayerTimes(
    location.latitude,
    location.longitude,
    currentTime,
    settings.calculationMethod,
    settings.madhab
  );

  const countdown = calculateTimeRemaining(
    nextPrayerItem ? nextPrayerItem.time : new Date(),
    currentTime
  );

  const hijriDate = getHijriDate(currentTime);

  // Check pre-Azan status: "استعد للصلاة"
  const preAzanStatus = checkPreAzanStatus(
    nextPrayerItem,
    settings.minutesBefore,
    currentTime
  );

  const isPreAzanActive =
    (settings.enabled && preAzanStatus.isPreAzanWindow) || simulatedPreAzan;

  const minutesRemainingToAzan = simulatedPreAzan
    ? settings.minutesBefore
    : preAzanStatus.minutesRemainingToAzan;

  // Fajr prayer time for Witr calculation
  const fajrItem = prayerItems.find((p) => p.id === 'fajr');
  const fajrTime = fajrItem ? fajrItem.time : new Date(currentTime.getTime() + 5 * 3600 * 1000);

  // Check late night Witr status
  const witrStatus = checkWitrReminderStatus(
    settings.witrReminder,
    qiyamTimes,
    fajrTime,
    currentTime
  );

  const isWitrActive = (settings.witrReminder?.enabled && witrStatus.isWitrActive) || simulatedWitr;
  const witrDescription = witrStatus.description || 'ثلث الليل الأخير';

  // Handle Automatic Witr Late-Night Notification & Audio trigger
  useEffect(() => {
    if (!settings.witrReminder?.enabled || !witrStatus.isWitrActive) {
      return;
    }

    const todayDateStr = currentTime.toDateString();
    const witrKey = `witr-${todayDateStr}`;

    if (lastWitrAlertRef.current !== witrKey) {
      lastWitrAlertRef.current = witrKey;

      if (!isMuted) {
        triggerWitrAlert(
          settings.witrReminder.soundType,
          settings.volume
        );
      }

      if (settings.browserNotification) {
        showWitrNotification(witrStatus.description);
      }
    }
  }, [
    witrStatus.isWitrActive,
    witrStatus.description,
    settings.witrReminder?.enabled,
    settings.witrReminder?.soundType,
    settings.volume,
    settings.browserNotification,
    currentTime,
    isMuted,
  ]);

  // Handle Automatic Pre-Azan Notification & Audio trigger
  useEffect(() => {
    if (!settings.enabled || !nextPrayerItem || nextPrayerItem.id === 'sunrise') {
      return;
    }

    // Trigger pre-azan alert exactly once when entering pre-azan window
    if (preAzanStatus.isPreAzanWindow) {
      const alertKey = `${nextPrayerItem.id}-${nextPrayerItem.time.toDateString()}`;
      if (lastAlertPrayerRef.current !== alertKey) {
        lastAlertPrayerRef.current = alertKey;

        // Sound trigger
        if (!isMuted) {
          triggerPreAzanAlert(
            nextPrayerItem.arabicName,
            preAzanStatus.minutesRemainingToAzan,
            settings.soundType,
            settings.volume
          );
        }

        // Browser notification trigger
        if (settings.browserNotification) {
          showPreAzanNotification(
            nextPrayerItem.arabicName,
            preAzanStatus.minutesRemainingToAzan
          );
        }
      }
    }
  }, [
    preAzanStatus.isPreAzanWindow,
    nextPrayerItem,
    settings.enabled,
    settings.soundType,
    settings.volume,
    settings.browserNotification,
    isMuted,
  ]);

  // Handle Automatic Full Azan when countdown reaches 0 / target time
  useEffect(() => {
    if (!nextPrayerItem || nextPrayerItem.id === 'sunrise') return;

    // Check if time is within 10 seconds of prayer time
    const diff = Math.abs(currentTime.getTime() - nextPrayerItem.time.getTime());
    if (diff < 3000) {
      const azanKey = `${nextPrayerItem.id}-${nextPrayerItem.time.toDateString()}`;
      if (lastAzanPrayerRef.current !== azanKey) {
        lastAzanPrayerRef.current = azanKey;

        if (settings.azanSoundEnabled && !isMuted) {
          setIsPlayingAzan(true);
          playAzan(
            settings.selectedMuezzin,
            settings.volume,
            () => setIsPlayingAzan(false)
          );
        }

        if (settings.browserNotification) {
          showAzanNotification(nextPrayerItem.arabicName);
        }
      }
    }
  }, [
    currentTime,
    nextPrayerItem,
    settings.azanSoundEnabled,
    settings.selectedMuezzin,
    settings.volume,
    settings.browserNotification,
    isMuted,
  ]);

  // Handlers
  const handlePlayAzan = () => {
    setIsPlayingAzan(true);
    playAzan(settings.selectedMuezzin, isMuted ? 0 : settings.volume, () => {
      setIsPlayingAzan(false);
    });
  };

  const handleStopAzan = () => {
    stopAzan();
    setIsPlayingAzan(false);
  };

  const handlePlayPrayerAzan = (prayer: PrayerTimeItem) => {
    setIsPlayingAzan(true);
    playAzan(settings.selectedMuezzin, isMuted ? 0 : settings.volume, () => {
      setIsPlayingAzan(false);
    });
  };

  const handleTestPreAzanAlert = () => {
    setSimulatedPreAzan(true);
    triggerPreAzanAlert(
      nextPrayerItem?.arabicName || 'الظهر',
      settings.minutesBefore,
      settings.soundType,
      isMuted ? 0 : settings.volume
    );
    showPreAzanNotification(
      nextPrayerItem?.arabicName || 'الظهر',
      settings.minutesBefore
    );

    // Auto clear simulated status after 12 seconds
    setTimeout(() => {
      setSimulatedPreAzan(false);
    }, 12000);
  };

  const handleTestWitrAlert = () => {
    setSimulatedWitr(true);
    triggerWitrAlert(
      settings.witrReminder?.soundType || 'both',
      isMuted ? 0 : settings.volume
    );
    showWitrNotification(witrDescription);

    // Auto clear simulated status after 15 seconds
    setTimeout(() => {
      setSimulatedWitr(false);
    }, 15000);
  };

  const handleToggleComplete = (prayerId: string) => {
    setCompletedPrayers((prev) => ({
      ...prev,
      [prayerId]: !prev[prayerId],
    }));
  };

  const handleRequestNotification = async () => {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      showPreAzanNotification(nextPrayerItem?.arabicName || 'الظهر', settings.minutesBefore);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Bar Header */}
      <Header
        location={location}
        hijriDate={hijriDate}
        onOpenLocation={() => setIsLocationModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenQibla={() => setIsQiblaModalOpen(true)}
        onOpenMonthly={() => setIsMonthlyModalOpen(true)}
        isPreAzanActive={isPreAzanActive}
        preAzanMinutes={settings.minutesBefore}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs (Prayers, Athkar, Tasbih) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('prayers')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'prayers'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            مواقيت الصلاة والأذان
          </button>
          <button
            onClick={() => setActiveTab('athkar')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'athkar'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            أذكار ما بعد الصلاة
          </button>
          <button
            onClick={() => setActiveTab('tasbih')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'tasbih'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            المسبحة الإلكترونية
          </button>
        </div>

        {activeTab === 'prayers' && (
          <>
            {/* Witr Late Night Reminder Banner (Appears late at night or when tested) */}
            {isWitrActive && (
              <WitrReminderBanner
                timingDescription={witrDescription}
                onPlayChime={() => triggerWitrAlert(settings.witrReminder?.soundType || 'both', settings.volume)}
                onDismiss={() => setSimulatedWitr(false)}
              />
            )}

            {/* Pre-Azan Alert Banner (Appears when within pre-azan window or on test) */}
            {isPreAzanActive && (
              <PreAzanAlertBanner
                prayerName={nextPrayerItem?.arabicName || 'الصلاة'}
                minutesRemaining={minutesRemainingToAzan}
                onPlayChime={() => playPreAzanChime(settings.volume)}
                onDismiss={() => setSimulatedPreAzan(false)}
              />
            )}

            {/* Hero Prayer Card (Dominant Visual Anchor) */}
            <HeroPrayerCard
              nextPrayer={nextPrayerItem}
              currentPrayer={currentPrayerItem}
              allPrayers={prayerItems}
              currentTime={currentTime}
              countdown={countdown}
              isPreAzanWindow={isPreAzanActive}
              minutesRemainingToAzan={minutesRemainingToAzan}
              settings={settings}
              isPlayingAzan={isPlayingAzan}
              onPlayAzan={handlePlayAzan}
              onStopAzan={handleStopAzan}
              onTestPreAzanChime={handleTestPreAzanAlert}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />

            {/* Daily Prayer Times Grid & Checklist */}
            <PrayerTimesList
              items={prayerItems}
              currentPrayer={currentPrayerItem}
              qiyamTimes={qiyamTimes}
              duhaTime={duhaTime}
              onPlayPrayerAzan={handlePlayPrayerAzan}
              completedPrayers={completedPrayers}
              onToggleComplete={handleToggleComplete}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />

            {/* Weekly Prayer Times Trend Chart using Recharts */}
            <WeeklyPrayerChart
              location={location}
              settings={settings}
              currentTime={currentTime}
            />

            {/* Quick Utility Feature Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <button
                onClick={() => setIsQiblaModalOpen(true)}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-colors text-right group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 transition-colors">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">بوصلة القبلة الدقيقة</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    تحديد اتجاه الكعبة المشرفة من موقعك
                  </p>
                </div>
              </button>

              <button
                onClick={() => setIsMonthlyModalOpen(true)}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-colors text-right group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 group-hover:bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">إمساكية الشهر بالكامل</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    جدول الصلوات لجميع أيام الشهر للطباعة
                  </p>
                </div>
              </button>

              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-colors text-right group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 transition-colors">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">تخصيص وقت الاستعداد</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    تعديل تنبيه {settings.minutesBefore} دقيقة وصوت الأذان
                  </p>
                </div>
              </button>
            </div>
          </>
        )}

        {activeTab === 'athkar' && <AthkarSection />}

        {activeTab === 'tasbih' && <TasbihCounter />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 py-6 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>مواقيت الصلاة والأذان التلقائي</span>
            <span aria-hidden="true">·</span>
            <span>خط العرض: {location.latitude.toFixed(3)}°</span>
            <span aria-hidden="true">·</span>
            <span>خط الطول: {location.longitude.toFixed(3)}°</span>
          </div>
          <div className="text-slate-400">
            طريقة الحساب: {settings.calculationMethod} · المذهب: {settings.madhab === 'shafi' ? 'الجمهور' : 'الحنفي'}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LocationSelectorModal
        currentLocation={location}
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={(newLoc) => setLocation(newLoc)}
        isWatchingLocation={isWatchingLocation}
        onToggleWatchLocation={() => setIsWatchingLocation(!isWatchingLocation)}
      />

      <PreAzanSettingsModal
        settings={settings}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
        notificationPermission={getNotificationPermissionStatus()}
        onRequestNotificationPermission={handleRequestNotification}
        onTestPreAzanAlert={handleTestPreAzanAlert}
        onTestWitrAlert={handleTestWitrAlert}
      />

      <QiblaCompass
        latitude={location.latitude}
        longitude={location.longitude}
        city={location.city}
        isOpen={isQiblaModalOpen}
        onClose={() => setIsQiblaModalOpen(false)}
      />

      <MonthlyScheduleModal
        location={location}
        settings={settings}
        isOpen={isMonthlyModalOpen}
        onClose={() => setIsMonthlyModalOpen(false)}
      />
    </div>
  );
}
