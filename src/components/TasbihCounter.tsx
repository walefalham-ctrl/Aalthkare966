import { useState } from 'react';
import { RotateCcw, Volume2, Sparkles, Check } from 'lucide-react';
import { playPreAzanChime } from '../utils/audioAlerts';

export function TasbihCounter() {
  const [selectedDhikr, setSelectedDhikr] = useState('سُبْحَانَ اللهِ');
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [totalRounds, setTotalRounds] = useState(0);

  const dhikrOptions = [
    'سُبْحَانَ اللهِ',
    'الحَمْدُ للهِ',
    'اللهُ أَكْبَرُ',
    'لَا إِلَهَ إِلَّا اللهُ',
    'أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ',
    'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',
    'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد',
  ];

  const handleTap = () => {
    // Subtle haptic
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }

    const nextCount = count + 1;
    if (target > 0 && nextCount >= target) {
      setCount(0);
      setTotalRounds((prev) => prev + 1);
      // Play soft completion chime
      playPreAzanChime(0.2);
    } else {
      setCount(nextCount);
    }
  };

  const handleReset = () => {
    setCount(0);
    setTotalRounds(0);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl flex flex-col items-center text-center">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-base font-bold text-white">المسبحة الإلكترونية</h3>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>تصفير</span>
        </button>
      </div>

      {/* Select Dhikr */}
      <div className="w-full max-w-sm mb-4">
        <select
          value={selectedDhikr}
          onChange={(e) => {
            setSelectedDhikr(e.target.value);
            setCount(0);
          }}
          className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-amiri font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 text-center"
        >
          {dhikrOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Target Selector */}
      <div className="flex items-center gap-2 mb-6">
        {[33, 100, 0].map((t) => (
          <button
            key={t}
            onClick={() => {
              setTarget(t);
              setCount(0);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
              target === t
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            {t === 0 ? 'مفتوح (بلا حد)' : `${t} تسبيحة`}
          </button>
        ))}
      </div>

      {/* Huge Tap Button */}
      <button
        onClick={handleTap}
        className="w-44 h-44 rounded-full bg-gradient-to-b from-emerald-600/30 via-slate-900 to-slate-950 border-4 border-emerald-500/40 hover:border-emerald-400 shadow-2xl shadow-emerald-950/60 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer select-none group"
      >
        <span className="text-4xl font-black text-white font-mono tabular-nums group-hover:scale-105 transition-transform">
          {count}
        </span>
        <span className="text-xs text-emerald-400 font-medium mt-1">
          {target > 0 ? `الهدف: ${target}` : 'اضغط للتسبيح'}
        </span>
      </button>

      {/* Stats */}
      <div className="mt-5 flex items-center gap-4 text-xs text-slate-400">
        <span>الدورات المكتملة: <strong className="text-white font-mono">{totalRounds}</strong></span>
        <span aria-hidden="true">·</span>
        <span>المجموع الإجمالي: <strong className="text-emerald-400 font-mono">{totalRounds * (target || 33) + count}</strong></span>
      </div>
    </div>
  );
}
