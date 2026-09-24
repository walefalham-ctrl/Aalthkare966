import { useState } from 'react';
import {
  MapPin,
  Bell,
  Compass,
  Calendar,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CoordinatesData, IslamicDateInfo } from '../types/prayer';

interface HeaderProps {
  location: CoordinatesData;
  hijriDate: IslamicDateInfo;
  onOpenLocation: () => void;
  onOpenSettings: () => void;
  onOpenQibla: () => void;
  onOpenMonthly: () => void;
  isPreAzanActive: boolean;
  preAzanMinutes: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function Header({
  location,
  hijriDate,
  onOpenLocation,
  onOpenSettings,
  onOpenQibla,
  onOpenMonthly,
  isPreAzanActive,
  preAzanMinutes,
  isMuted,
  onToggleMute,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Zone 1: Single text element wordmark with subtle mosque emblem */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-lg shadow-emerald-950/40 text-emerald-100 font-bold shrink-0">
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C11.5 2 11 2.4 11 3V4.1C7.6 4.6 5 7.5 5 11V16L3 18V19H21V18L19 16V11C19 7.5 16.4 4.6 13 4.1V3C13 2.4 12.5 2 12 2ZM7 11C7 8.2 9.2 6 12 6C14.8 6 17 8.2 17 11V17H7V11ZM10 20C10 21.1 10.9 22 12 22C13.1 22 14 21.1 14 20H10Z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              مواقيت الصلاة والأذان
              {isPreAzanActive && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>{hijriDate.dayName}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-medium">{hijriDate.formattedHijri}</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="hidden sm:inline text-slate-400">{hijriDate.gregorianDateString}</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Location selector pill */}
        <button
          onClick={onOpenLocation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-xs sm:text-sm text-slate-200 transition-colors shadow-sm max-w-[200px] sm:max-w-xs truncate"
          title="تغيير الموقع الجغرافي أو خطوط الطول والعرض"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate font-medium">{location.city || 'تحديد الموقع'}</span>
          <span className="text-slate-400 text-xs hidden md:inline truncate">
            ({location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°)
          </span>
        </button>

        {/* Zone 3: Actions & utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg border transition-colors ${
              isMuted
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/40'
                : 'bg-slate-900 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
            title={isMuted ? 'الصوت مكتوم - اضغط للتشغيل' : 'الصوت مفعل - اضغط للكتم'}
            aria-label="تبديل كتم الصوت"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Qibla Compass Trigger */}
          <button
            onClick={onOpenQibla}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
            title="اتجاه القبلة"
            aria-label="اتجاه القبلة"
          >
            <Compass className="w-4 h-4 text-amber-400" />
          </button>

          {/* Monthly Schedule Trigger */}
          <button
            onClick={onOpenMonthly}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors hidden sm:flex"
            title="تقويم مواقيت الشهر"
            aria-label="تقويم مواقيت الشهر"
          >
            <Calendar className="w-4 h-4 text-teal-400" />
          </button>

          {/* Pre-Azan & App Settings */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
              isPreAzanActive
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-sm'
            }`}
            title="إعدادات إشعار استعد للصلاة والأذان"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden md:inline">استعد للصلاة</span>
            <span className="md:hidden">تنبيه</span>
          </button>
        </div>
      </div>
    </header>
  );
}
