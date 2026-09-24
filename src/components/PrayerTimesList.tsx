import { useState } from 'react';
import {
  Sun,
  Sunrise,
  Sunset,
  Moon,
  CloudSun,
  CheckCircle,
  Circle,
  Clock,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { PrayerTimeItem, PrayerName } from '../types/prayer';
import { formatTimeString } from '../utils/prayerCalculations';

interface PrayerTimesListProps {
  items: PrayerTimeItem[];
  currentPrayer: PrayerTimeItem | null;
  qiyamTimes: { middleOfTheNight: Date; lastThirdOfTheNight: Date };
  duhaTime: Date;
  onPlayPrayerAzan: (prayer: PrayerTimeItem) => void;
  completedPrayers: Record<string, boolean>;
  onToggleComplete: (prayerId: string) => void;
  onOpenSettings?: () => void;
}

export function PrayerTimesList({
  items,
  currentPrayer,
  qiyamTimes,
  duhaTime,
  onPlayPrayerAzan,
  completedPrayers,
  onToggleComplete,
  onOpenSettings,
}: PrayerTimesListProps) {
  const getPrayerIcon = (id: PrayerName) => {
    switch (id) {
      case 'fajr':
        return Sunrise;
      case 'sunrise':
        return Sun;
      case 'dhuhr':
        return Sun;
      case 'asr':
        return CloudSun;
      case 'maghrib':
        return Sunset;
      case 'isha':
        return Moon;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            مواقيت الصلوات اليومية
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تُحسب بالدقة الفلكية وتتحدث تلقائياً حسب موقعك الجغرافي
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>تتبع أداء الصلوات</span>
        </div>
      </div>

      {/* Grid of prayer cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {items.map((item) => {
          const Icon = getPrayerIcon(item.id);
          const isCompleted = !!completedPrayers[item.id];
          const isSunrise = item.id === 'sunrise';

          return (
            <div
              key={item.id}
              className={`relative overflow-hidden rounded-xl border p-4.5 transition-all ${
                item.isNext
                  ? 'bg-slate-900/90 border-emerald-500/80 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                  : item.isCurrent
                  ? 'bg-slate-900/70 border-teal-500/50'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700/80'
              }`}
            >
              {/* Active / Next Badges */}
              {item.isNext && (
                <div className="absolute top-0 left-0 bg-emerald-500 text-slate-950 font-bold text-[10px] px-2.5 py-0.5 rounded-br-lg">
                  الصلاة القادمة
                </div>
              )}
              {item.isCurrent && !item.isNext && (
                <div className="absolute top-0 left-0 bg-teal-600/80 text-white font-medium text-[10px] px-2.5 py-0.5 rounded-br-lg">
                  الصلاة الحالية
                </div>
              )}

              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      item.isNext
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isSunrise
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800/80 text-slate-300 border border-slate-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      {item.arabicName}
                      {isSunrise && (
                        <span className="text-[10px] font-normal text-slate-400">
                          (شروق الشمس)
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      {item.englishName}
                    </span>
                  </div>
                </div>

                {/* Prayer Time Display */}
                <div className="text-left" dir="ltr">
                  <div className="text-xl font-black text-white font-mono tabular-nums">
                    {item.formattedTime}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Completion Checkbox & Audio Preview */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                {!isSunrise ? (
                  <button
                    onClick={() => onToggleComplete(item.id)}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${
                      isCompleted
                        ? 'text-emerald-400 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                    <span>{isCompleted ? 'تمت الصلاة' : 'تحديد كـ "صليت"'}</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-500">انتهاء وقت الفجر</span>
                )}

                {!isSunrise && (
                  <button
                    onClick={() => onPlayPrayerAzan(item)}
                    className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-emerald-300 transition-colors"
                    title={`سماع أذان صلاة ${item.arabicName}`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sunnah & Optional Prayer Times Accordion Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>أوقات مستحبة ونوافل (الضحى، قيام الليل والوتر):</span>
          </div>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 font-medium"
            >
              <Moon className="w-3 h-3" />
              <span>ضبط تذكير الوتر</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
            <span className="text-slate-400">صلاة الضحى تبدأ:</span>
            <span className="font-mono font-bold text-teal-300 tabular-nums">
              {formatTimeString(duhaTime)}
            </span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
            <span className="text-slate-400">منتصف الليل الشرعي:</span>
            <span className="font-mono font-bold text-slate-200 tabular-nums">
              {formatTimeString(qiyamTimes.middleOfTheNight)}
            </span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-indigo-900/40 bg-indigo-950/20">
            <div className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-indigo-200">ثلث الليل الأخير (الوتر):</span>
            </div>
            <span className="font-mono font-bold text-indigo-300 tabular-nums">
              {formatTimeString(qiyamTimes.lastThirdOfTheNight)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
