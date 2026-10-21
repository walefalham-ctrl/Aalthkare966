import { useState, useMemo } from 'react';
import {
  Clock,
  Bell,
  Play,
  Square,
  Volume2,
  Sparkles,
  MapPin,
  Sliders,
  Sun,
  Sunset,
  Sunrise,
  Moon,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { PrayerTimeItem, PreAzanSettings } from '../types/prayer';
import { MUEZZIN_NAMES } from '../utils/audioAlerts';

interface HeroPrayerCardProps {
  nextPrayer: PrayerTimeItem | null;
  currentPrayer: PrayerTimeItem | null;
  allPrayers?: PrayerTimeItem[];
  currentTime: Date;
  countdown: {
    hours: number;
    minutes: number;
    seconds: number;
    formatted: string;
  };
  isPreAzanWindow: boolean;
  minutesRemainingToAzan: number;
  settings: PreAzanSettings;
  isPlayingAzan: boolean;
  onPlayAzan: () => void;
  onStopAzan: () => void;
  onTestPreAzanChime: () => void;
  onOpenSettings: () => void;
}

export function HeroPrayerCard({
  nextPrayer,
  currentPrayer,
  allPrayers = [],
  currentTime,
  countdown,
  isPreAzanWindow,
  minutesRemainingToAzan,
  settings,
  isPlayingAzan,
  onPlayAzan,
  onStopAzan,
  onTestPreAzanChime,
  onOpenSettings,
}: HeroPrayerCardProps) {
  // Calculate approximate percentage of day / prayer interval passed
  const progressPercent = useMemo(() => {
    if (!currentPrayer || !nextPrayer) return 0;
    const start = currentPrayer.time.getTime();
    const end = nextPrayer.time.getTime();
    const now = currentTime.getTime();
    if (end > start) {
      return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    }
    return 0;
  }, [currentPrayer, nextPrayer, currentTime]);

  // Construct background prayer times watermark strings (repeated patterns for aesthetic wallpaper effect)
  const watermarkPrayerString = useMemo(() => {
    if (!allPrayers || allPrayers.length === 0) {
      return 'الفجر · الشروق · الظهر · العصر · المغرب · العشاء';
    }
    return allPrayers
      .map((p) => `${p.arabicName} ${p.formattedTime}`)
      .join('  •  ');
  }, [allPrayers]);

  if (!nextPrayer) return null;

  const getPrayerIcon = (id: string) => {
    switch (id) {
      case 'fajr':
        return <Sunrise className="w-3.5 h-3.5" />;
      case 'sunrise':
        return <Sun className="w-3.5 h-3.5" />;
      case 'dhuhr':
        return <Sun className="w-3.5 h-3.5" />;
      case 'asr':
        return <Sun className="w-3.5 h-3.5" />;
      case 'maghrib':
        return <Sunset className="w-3.5 h-3.5" />;
      case 'isha':
        return <Moon className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-emerald-500/30 p-6 sm:p-8 lg:p-10 shadow-2xl shadow-emerald-950/40 transition-all">
      {/* ========================================================================= */}
      {/* 1. BACKGROUND TRANSPARENT WATERMARK LAYER (كتابة مواعيد الصلاة كخلفية شفافة) */}
      {/* ========================================================================= */}
      
      {/* Atmospheric ambient lighting & radial glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-600/15 via-emerald-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-slate-950/40 to-slate-950 pointer-events-none" />

      {/* Layer A: Huge Arabic Calligraphic Name of Next Prayer Watermark */}
      <div
        aria-hidden="true"
        className="absolute -bottom-10 sm:-bottom-12 -left-6 sm:left-4 select-none pointer-events-none text-7xl sm:text-9xl lg:text-[13rem] font-black tracking-tighter text-white/[0.035] leading-none whitespace-nowrap z-0 font-serif"
      >
        {nextPrayer.arabicName}
      </div>

      {/* Layer B: Repeated Prayer Times Watermark Ribbons (Slanted transparent banners) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 flex flex-col justify-between py-2 opacity-70"
      >
        {/* Row 1 - Flowing transparent prayer times top */}
        <div className="text-white/[0.045] font-mono text-sm sm:text-base font-bold whitespace-nowrap transform -rotate-1 translate-y-1 tracking-widest">
          {watermarkPrayerString}  •  {watermarkPrayerString}  •  {watermarkPrayerString}
        </div>

        {/* Row 2 - Center watermark line with subtle emerald tint */}
        <div className="text-emerald-400/[0.05] font-sans text-lg sm:text-2xl font-black whitespace-nowrap transform rotate-1 tracking-wider">
          {watermarkPrayerString}  •  {watermarkPrayerString}  •  {watermarkPrayerString}
        </div>

        {/* Row 3 - Flowing transparent prayer times bottom */}
        <div className="text-white/[0.04] font-mono text-xs sm:text-sm font-semibold whitespace-nowrap transform -rotate-2 -translate-y-1 tracking-widest">
          {watermarkPrayerString}  •  {watermarkPrayerString}  •  {watermarkPrayerString}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TRANSLUCENT INTEGRATED PRAYER SCHEDULE HEADER (شريط مواعيد الصلاة الشفاف) */}
      {/* ========================================================================= */}
      {allPrayers.length > 0 && (
        <div className="relative z-10 mb-6 p-2 sm:p-2.5 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-white/[0.08] shadow-inner">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 text-center">
            {allPrayers.map((prayer) => {
              const isNext = prayer.id === nextPrayer.id;
              const isCurrent = currentPrayer && prayer.id === currentPrayer.id;

              return (
                <div
                  key={prayer.id}
                  className={`p-2 rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                    isNext
                      ? 'bg-emerald-500/20 border border-emerald-400/50 shadow-md shadow-emerald-950/40'
                      : isCurrent
                      ? 'bg-amber-500/10 border border-amber-500/30'
                      : 'bg-slate-950/30 border border-transparent hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className={`${
                        isNext
                          ? 'text-emerald-300'
                          : isCurrent
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {getPrayerIcon(prayer.id)}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isNext
                          ? 'text-emerald-200'
                          : isCurrent
                          ? 'text-amber-200'
                          : 'text-slate-300'
                      }`}
                    >
                      {prayer.arabicName}
                    </span>
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-mono font-bold tabular-nums tracking-tight ${
                      isNext
                        ? 'text-white font-black'
                        : isCurrent
                        ? 'text-amber-300 font-semibold'
                        : 'text-slate-400'
                    }`}
                    dir="ltr"
                  >
                    {prayer.formattedTime}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FOREGROUND HIGH-CONTRAST DATA & CONTROLS (البيانات واضحة وبارزة)        */}
      {/* ========================================================================= */}

      {/* Active Azan Banner (If Azan is Currently Playing) */}
      {isPlayingAzan ? (
        <div className="relative z-10 mb-6 flex items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-400/60 shadow-xl shadow-emerald-950/50 text-emerald-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="flex items-end gap-1 h-6">
              <span className="w-1.5 bg-emerald-400 rounded-full animate-bounce h-6"></span>
              <span className="w-1.5 bg-emerald-400 rounded-full animate-bounce h-3 delay-100"></span>
              <span className="w-1.5 bg-emerald-400 rounded-full animate-bounce h-5 delay-200"></span>
              <span className="w-1.5 bg-emerald-400 rounded-full animate-bounce h-2 delay-300"></span>
            </div>
            <div>
              <p className="text-base font-black text-white">يُرفع الآن الأذان في مدينتك</p>
              <p className="text-xs text-emerald-300">
                بصوت: {MUEZZIN_NAMES[settings.selectedMuezzin] || 'المؤذن'}
              </p>
            </div>
          </div>
          <button
            onClick={onStopAzan}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>إيقاف الأذان</span>
          </button>
        </div>
      ) : isPreAzanWindow ? (
        /* Pre-Azan Readiness Warning */
        <div className="relative z-10 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-amber-900/50 to-slate-900/90 border border-amber-400/70 shadow-xl shadow-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/25 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-amber-300">
                  استعد للصلاة
                </span>
                <span className="text-xs text-amber-200 font-medium">
                  بقي {minutesRemainingToAzan} {minutesRemainingToAzan === 1 ? 'دقيقة' : 'دقائق'} على أذان {nextPrayer.arabicName}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5">
                توضأ واستعد للمسجد واستحضر نية الصلاة والخشوع
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={onTestPreAzanChime}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-100 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>سماع النغمة</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              ضبط التنبيه
            </button>
          </div>
        </div>
      ) : null}

      {/* Main Grid: Details & Tabular Flip-Clock Countdown */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* ============================================================== */}
        {/* Left Side: Crisp Next Prayer Presentation & Quick Controls     */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-3.5 text-right">
          {/* Status Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <Clock className="w-3.5 h-3.5" />
              <span>الصلاة القادمة</span>
            </div>

            {currentPrayer && (
              <span className="text-xs text-slate-400 font-medium">
                الصلاة الحالية: <strong className="text-slate-200">{currentPrayer.arabicName}</strong>
              </span>
            )}
          </div>

          {/* Big Prayer Name & Time Display */}
          <div className="flex flex-wrap items-baseline gap-3 sm:gap-5 mt-1">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md">
              صلاة {nextPrayer.arabicName}
            </h1>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-950/40">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight tabular-nums" dir="ltr">
                {nextPrayer.formattedTime}
              </span>
            </div>
          </div>

          {/* Additional details row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
            <span className="flex items-center gap-1.5">
              <span className="text-slate-400">تنبيه الاستعداد:</span>
              {settings.enabled ? (
                <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  قبل {settings.minutesBefore} دقيقة
                </span>
              ) : (
                <span className="text-slate-500">غير مفعل</span>
              )}
            </span>

            <span className="text-slate-600 hidden sm:inline">•</span>

            <span className="text-slate-400">
              المؤذن: <span className="text-slate-200 font-medium">{MUEZZIN_NAMES[settings.selectedMuezzin] || 'الافتراضي'}</span>
            </span>
          </div>

          {/* Interactive Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-800/80">
            <button
              onClick={isPlayingAzan ? onStopAzan : onPlayAzan}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg active:scale-95 ${
                isPlayingAzan
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
              }`}
            >
              {isPlayingAzan ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>إيقاف الأذان</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>سماع الأذان الآن</span>
                </>
              )}
            </button>

            <button
              onClick={onTestPreAzanChime}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700/80 transition-colors shadow-sm"
              title="تجربة نغمة استعد للصلاة"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>تجربة إشعار الاستعداد</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
              title="ضبط الإعدادات وطريقة الحساب"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Right Side: Tabular Countdown Flip Clock & Interval Progress   */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-7 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 shadow-2xl">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-300 font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>الوقت المتبقي حتى موعد الأذان</span>
          </div>

          {/* High-Contrast Countdown Digits Box */}
          <div className="flex items-center justify-center gap-3 text-center" dir="ltr">
            {/* Hours Box */}
            <div className="flex flex-col items-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-slate-950 border border-slate-700/80 flex items-center justify-center shadow-inner shadow-black/60">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono tabular-nums">
                  {String(countdown.hours).padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs text-slate-300 font-semibold mt-1.5">ساعة</span>
            </div>

            <span className="text-2xl font-bold text-slate-600 mb-6">:</span>

            {/* Minutes Box */}
            <div className="flex flex-col items-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-slate-950 border border-slate-700/80 flex items-center justify-center shadow-inner shadow-black/60">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono tabular-nums">
                  {String(countdown.minutes).padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs text-slate-300 font-semibold mt-1.5">دقيقة</span>
            </div>

            <span className="text-2xl font-bold text-slate-600 mb-6">:</span>

            {/* Seconds Box (Highlighted in Emerald with Pulse Glow) */}
            <div className="flex flex-col items-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-slate-950 border-2 border-emerald-500/60 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tabular-nums animate-pulse">
                  {String(countdown.seconds).padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs text-emerald-400 font-bold mt-1.5">ثانية</span>
            </div>
          </div>

          {/* Interval Progress Bar */}
          <div className="w-full mt-6 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
              <span className="font-medium">انقضى من وقت الفترة:</span>
              <span className="tabular-nums font-mono font-bold text-emerald-400">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-emerald-300 rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
