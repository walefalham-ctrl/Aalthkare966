import { useState } from 'react';
import { Sparkles, RotateCcw, Check, BookOpen } from 'lucide-react';
import { POST_PRAYER_ATHKAR, ThikrItem } from '../data/athkar';

export function AthkarSection() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const handleIncrement = (id: string, max: number) => {
    setCounts((prev) => {
      const current = prev[id] || 0;
      if (current >= max) return prev;
      // Optional haptic vibration if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(25);
      }
      return { ...prev, [id]: current + 1 };
    });
  };

  const handleReset = (id: string) => {
    setCounts((prev) => ({ ...prev, [id]: 0 }));
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              أذكار ما بعد الصلاة المكتوبة
            </h2>
            <p className="text-xs text-slate-400">
              الأذكار المأثورة عن النبي ﷺ دبر كل صلاة مكتوبة
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {POST_PRAYER_ATHKAR.map((item) => {
          const currentCount = counts[item.id] || 0;
          const isDone = currentCount >= item.repeat;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                isDone
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-200'
              }`}
            >
              <div>
                <p className="text-sm font-amiri leading-relaxed font-semibold text-white">
                  {item.text}
                </p>
                {item.virtue && (
                  <p className="text-[11px] text-emerald-400/90 mt-2 font-medium">
                    ✦ {item.virtue} {item.reference && `(${item.reference})`}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleIncrement(item.id, item.repeat)}
                  disabled={isDone}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    isDone
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isDone ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>اكتمل الذكر ({item.repeat})</span>
                    </>
                  ) : (
                    <>
                      <span>تكرار:</span>
                      <span className="font-mono text-sm tabular-nums">
                        {currentCount} / {item.repeat}
                      </span>
                    </>
                  )}
                </button>

                {currentCount > 0 && (
                  <button
                    onClick={() => handleReset(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
                    title="إعادة التصفير"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
