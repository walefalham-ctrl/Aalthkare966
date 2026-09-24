import { useState } from 'react';
import {
  Moon,
  Sparkles,
  Heart,
  Volume2,
  X,
  Clock,
  CheckCircle,
  Circle,
  HelpCircle,
} from 'lucide-react';

interface WitrReminderBannerProps {
  timingDescription: string;
  onPlayChime: () => void;
  onDismiss?: () => void;
}

export function WitrReminderBanner({
  timingDescription,
  onPlayChime,
  onDismiss,
}: WitrReminderBannerProps) {
  const [completed, setCompleted] = useState(false);
  const [showDuas, setShowDuas] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-indigo-900/40 border-2 border-indigo-500/50 p-5 sm:p-6 shadow-xl shadow-indigo-950/40 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Background celestial glow */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-0 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950/60 shrink-0">
            <Moon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                تذكير صلاة الوتر والقيام
              </span>
              <span className="text-xs text-indigo-300 font-medium">
                {timingDescription}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
              <span>أوتِروا يا أهل القرآن</span>
              <span className="text-xs font-normal text-indigo-300 px-2 py-0.5 rounded-lg bg-indigo-950/80 border border-indigo-800">
                سنة نبوية مؤكدة
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onPlayChime}
            className="p-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 transition-colors"
            title="سماع نغمة التنبيه"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Prophetic Hadith Quote */}
      <div className="mt-3.5 p-3 rounded-xl bg-slate-950/60 border border-indigo-900/50 text-xs text-indigo-200 relative z-10">
        <p className="leading-relaxed font-serif italic text-slate-200">
          «إِنَّ اللَّهَ وِتْرٌ يُحِبُّ الْوِتْرَ، فَأَوْتِرُوا يَا أَهْلَ الْقُرْآنِ»
          <span className="text-[11px] text-slate-400 not-italic font-sans mr-2 block sm:inline">
            [رواه أصحاب السنن]. ركعة واحدة في خلوة الليل خير من حمر النعم.
          </span>
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="mt-4 pt-3 border-t border-indigo-900/50 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompleted(!completed)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              completed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-indigo-950/50 text-indigo-200 border border-indigo-800/80 hover:bg-indigo-900/40'
            }`}
          >
            {completed ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <Circle className="w-4 h-4 text-indigo-400" />
            )}
            <span>{completed ? 'تقبّل الله صلاتك وركوعك' : 'تحديد كـ "صليت الوتر"'}</span>
          </button>

          <button
            onClick={() => setShowDuas(!showDuas)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showDuas ? 'إخفاء دعاء القنوت' : 'دعاء القنوت المأثور'}</span>
          </button>
        </div>

        <span className="text-[11px] text-indigo-300 font-sans">
          الوقت ممتد حتى طلوع الفجر الصادق
        </span>
      </div>

      {/* Collapsible Qunoot Dua Card */}
      {showDuas && (
        <div className="mt-3 p-4 rounded-xl bg-slate-950/80 border border-indigo-800/80 text-xs space-y-2 relative z-10 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-indigo-300 font-bold">
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/20" />
            <span>من دعاء القنوت النبوي في صلاة الوتر:</span>
          </div>
          <p className="leading-loose text-slate-200 font-serif text-sm">
            «اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ، وَإِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، وَلَا يَعِزُّ مَنْ عَادَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ».
          </p>
        </div>
      )}
    </div>
  );
}
