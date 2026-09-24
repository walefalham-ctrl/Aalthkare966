import { useState } from 'react';
import {
  Bell,
  Sparkles,
  Droplets,
  Footprints,
  Volume2,
  X,
  Check,
} from 'lucide-react';
import { PRE_PRAYER_TIPS } from '../data/athkar';

interface PreAzanAlertBannerProps {
  prayerName: string;
  minutesRemaining: number;
  onPlayChime: () => void;
  onDismiss?: () => void;
}

export function PreAzanAlertBanner({
  prayerName,
  minutesRemaining,
  onPlayChime,
  onDismiss,
}: PreAzanAlertBannerProps) {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const steps = [
    { id: 'wudu', label: 'إسباغ الوضوء والتطهر', icon: Droplets },
    { id: 'early', label: 'التبكير إلى المسجد بسكينة', icon: Footprints },
    { id: 'niyyah', label: 'استحضار النية وتفريغ القلب من الشواغل', icon: Sparkles },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-amber-950/20 border-2 border-amber-500/50 p-5 sm:p-6 shadow-xl shadow-amber-950/20">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-950/50 shrink-0 animate-bounce duration-1000">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                تنبيه قبل الأذان
              </span>
              <span className="text-xs text-amber-400 font-mono tabular-nums">
                بقي {minutesRemaining} {minutesRemaining === 1 ? 'دقيقة' : 'دقائق'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              استعد لصلاة {prayerName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPlayChime}
            className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition-colors"
            title="إعادة سماع نغمة الاستعداد"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sunnah preparation checklist */}
      <div className="mt-4 pt-4 border-t border-amber-500/20">
        <p className="text-xs font-semibold text-amber-300 mb-2.5">
          سنن وآداب الاستعداد للصلاة:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isDone = !!completedSteps[step.id];
            return (
              <button
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs text-right transition-all ${
                  isDone
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : 'border border-slate-600 bg-slate-800'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Icon className="w-3 h-3 text-slate-400" />}
                </div>
                <span className="font-medium">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hadith / spiritual thought */}
      <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 font-amiri leading-relaxed">
        قال رسول الله ﷺ: «ألا أدلكم على ما يمحو الله به الخطايا ويرفع به الدرجات؟ إسباغ الوضوء على المكاره، وكثرة الخطى إلى المساجد، وانتظار الصلاة بعد الصلاة، فذلكم الرباط».
      </div>
    </div>
  );
}
