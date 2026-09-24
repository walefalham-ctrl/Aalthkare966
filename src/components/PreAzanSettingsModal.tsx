import { useState } from 'react';
import {
  X,
  Bell,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  Compass,
  Check,
  Sparkles,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Moon,
} from 'lucide-react';
import {
  PreAzanSettings,
  ReminderSoundType,
  MuezzinKey,
  CalculationMethodKey,
  MadhabKey,
  WitrTimingMode,
  WitrReminderSettings,
} from '../types/prayer';
import { CALCULATION_METHOD_LABELS } from '../utils/prayerCalculations';
import { MUEZZIN_NAMES } from '../utils/audioAlerts';

interface PreAzanSettingsModalProps {
  settings: PreAzanSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (newSettings: PreAzanSettings) => void;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => Promise<void>;
  onTestPreAzanAlert: () => void;
  onTestWitrAlert?: () => void;
}

export function PreAzanSettingsModal({
  settings,
  isOpen,
  onClose,
  onUpdateSettings,
  notificationPermission,
  onRequestNotificationPermission,
  onTestPreAzanAlert,
  onTestWitrAlert,
}: PreAzanSettingsModalProps) {
  if (!isOpen) return null;

  const defaultWitr: WitrReminderSettings = {
    enabled: true,
    timingMode: 'lastThird',
    fixedTime: '02:30',
    minutesBeforeFajr: 45,
    soundType: 'both',
  };

  const [localSettings, setLocalSettings] = useState<PreAzanSettings>({
    ...settings,
    witrReminder: settings.witrReminder || defaultWitr,
  });

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const minutesOptions = [5, 10, 15, 20, 30];

  const soundOptions: { type: ReminderSoundType; label: string; desc: string }[] = [
    { type: 'chime', label: 'نغمة هادئة', desc: 'نغمات رنين روحانية لطيفة' },
    { type: 'voice', label: 'تنبيه صوتي', desc: 'نداء صوتي باللغة العربية: استعد للصلاة' },
    { type: 'both', label: 'نغمة + صوت', desc: 'سماع النغمة يليها النداء الصوتي' },
    { type: 'silent', label: 'صامت', desc: 'إشعار مرئي على الشاشة فقط' },
  ];

  const muezzinOptions: { key: MuezzinKey; label: string }[] = [
    { key: 'makkah', label: 'أذان الحرم المكي الشريف' },
    { key: 'madinah', label: 'أذان المسجد النبوي الشريف' },
    { key: 'alaqsa', label: 'أذان المسجد الأقصى المبارك' },
    { key: 'abdulbasit', label: 'الشيخ عبد الباسط عبد الصمد' },
    { key: 'alafasy', label: 'الشيخ مشاري راشد العفاسي' },
    { key: 'synth', label: 'نغمة إلكترونية مهدئة (بدون إنترنت)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                إعدادات إشعار «استعد للصلاة» والأذان
              </h3>
              <p className="text-xs text-slate-400">
                تخصيص وقت التنبيه، نوع الصوت، وصوت الأذان
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Main Toggle: Enable Pre-Azan Reminder */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>تفعيل إشعار «استعد للصلاة» قبل الأذان</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  مهم للتبكير
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                ينبهك قبل موعد الأذان لتتجهز بالوضوء والسنن الراتبة
              </p>
            </div>

            <button
              onClick={() =>
                setLocalSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
              }
              className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center p-0.5 ${
                localSettings.enabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  localSettings.enabled ? 'translate-x-0' : '-translate-x-5.5'
                }`}
              />
            </button>
          </div>

          {/* Time Window (Minutes Before) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200">
              موعد إشعار الاستعداد قبل الأذان:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {minutesOptions.map((mins) => (
                <button
                  key={mins}
                  onClick={() =>
                    setLocalSettings((prev) => ({ ...prev, minutesBefore: mins }))
                  }
                  className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
                    localSettings.minutesBefore === mins
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-950/40'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {mins} دقيقة
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              سيظهر التنبيه ويُسمع الصوت قبل الأذان بـ {localSettings.minutesBefore} دقيقة بالضبط.
            </p>
          </div>

          {/* Sound Type Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200">
              نوع تنبيه الاستعداد:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {soundOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() =>
                    setLocalSettings((prev) => ({ ...prev, soundType: opt.type }))
                  }
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-right transition-all ${
                    localSettings.soundType === opt.type
                      ? 'bg-amber-950/40 border-amber-500/80 text-amber-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      localSettings.soundType === opt.type
                        ? 'border-amber-400 bg-amber-500'
                        : 'border-slate-600'
                    }`}
                  >
                    {localSettings.soundType === opt.type && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Browser Notifications Permission */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">إشعارات المتصفح والنظام</p>
                <p className="text-[11px] text-slate-400">
                  تلقي إشعار استعد للصلاة حتى لو كان التطبيق في الخلفية
                </p>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  notificationPermission === 'granted'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : notificationPermission === 'denied'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {notificationPermission === 'granted'
                  ? 'مُفعّل ومسموح'
                  : notificationPermission === 'denied'
                  ? 'محظور في المتصفح'
                  : 'في انتظار الإذن'}
              </span>
            </div>

            {notificationPermission !== 'granted' && (
              <button
                onClick={onRequestNotificationPermission}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>طلب السماح بإشعارات المتصفح</span>
              </button>
            )}
          </div>

          {/* Azan Playback & Muezzin Choice */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">تشغيل صوت الأذان كاملاً عند دخول الوقت</p>
                <p className="text-[11px] text-slate-400">
                  سماع صوت الأذان تلقائياً عند حلول موعد الصلاة
                </p>
              </div>
              <button
                onClick={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    azanSoundEnabled: !prev.azanSoundEnabled,
                  }))
                }
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  localSettings.azanSoundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    localSettings.azanSoundEnabled ? 'translate-x-0' : '-translate-x-5'
                  }`}
                />
              </button>
            </div>

            {localSettings.azanSoundEnabled && (
              <>
                <div className="pt-2">
                  <label className="block text-[11px] text-slate-300 mb-1.5">
                    اختر صوت المؤذن:
                  </label>
                  <select
                    value={localSettings.selectedMuezzin}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        selectedMuezzin: e.target.value as MuezzinKey,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {muezzinOptions.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Volume Slider */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                    <span>مستوى صوت التنبيه والأذان:</span>
                    <span className="font-mono">{Math.round(localSettings.volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={localSettings.volume}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        volume: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>

          {/* Calculation Method & Madhab */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
            <p className="text-xs font-bold text-white">طريقة الحساب الفلكي والمذهب الفقهي:</p>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                الهيئة الفلكية لحساب أوقات الفجر والعشاء:
              </label>
              <select
                value={localSettings.calculationMethod}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    calculationMethod: e.target.value as CalculationMethodKey,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {Object.entries(CALCULATION_METHOD_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                طريقة حساب وقت صلاة العصر:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLocalSettings((prev) => ({ ...prev, madhab: 'shafi' }))}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-colors ${
                    localSettings.madhab === 'shafi'
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  الجمهور (شافعي، مالكي، حنبلي)
                </button>
                <button
                  onClick={() => setLocalSettings((prev) => ({ ...prev, madhab: 'hanafi' }))}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-colors ${
                    localSettings.madhab === 'hanafi'
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  المذهب الحنفي
                </button>
              </div>
            </div>
          </div>

          {/* Witr Prayer Late Night Reminder Section */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-indigo-950/20 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>تذكير صلاة الوتر في الثلث الأخير من الليل</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                      سنة مؤكدة
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    إشعار وتنبيه صوتي مخصص يوقظك أو ينبهك للوتر قبل الفجر
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    witrReminder: {
                      ...(prev.witrReminder || defaultWitr),
                      enabled: !(prev.witrReminder?.enabled ?? true),
                    },
                  }))
                }
                className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                  localSettings.witrReminder?.enabled ? 'bg-indigo-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    localSettings.witrReminder?.enabled ? 'translate-x-0' : '-translate-x-5.5'
                  }`}
                />
              </button>
            </div>

            {localSettings.witrReminder?.enabled && (
              <div className="space-y-3 pt-2 border-t border-indigo-950/80">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    توقيت إرسال تذكير الوتر:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          witrReminder: {
                            ...(prev.witrReminder || defaultWitr),
                            timingMode: 'lastThird',
                          },
                        }))
                      }
                      className={`p-2.5 rounded-xl border text-right transition-all text-xs font-semibold ${
                        localSettings.witrReminder?.timingMode === 'lastThird'
                          ? 'bg-indigo-950/60 border-indigo-400 text-indigo-200 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="font-bold">ثلث الليل الأخير (فلكياً)</p>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                        أفضل أوقات استجابة الدعاء والتنزل الإلهي
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          witrReminder: {
                            ...(prev.witrReminder || defaultWitr),
                            timingMode: 'beforeFajr',
                          },
                        }))
                      }
                      className={`p-2.5 rounded-xl border text-right transition-all text-xs font-semibold ${
                        localSettings.witrReminder?.timingMode === 'beforeFajr'
                          ? 'bg-indigo-950/60 border-indigo-400 text-indigo-200 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="font-bold">قبل أذان الفجر بوقت محدد</p>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                        ليتسنى لك السحور وركعات الوتر
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          witrReminder: {
                            ...(prev.witrReminder || defaultWitr),
                            timingMode: 'middleOfNight',
                          },
                        }))
                      }
                      className={`p-2.5 rounded-xl border text-right transition-all text-xs font-semibold ${
                        localSettings.witrReminder?.timingMode === 'middleOfNight'
                          ? 'bg-indigo-950/60 border-indigo-400 text-indigo-200 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="font-bold">منتصف الليل الشرعي</p>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                        نصف المسافة بين المغرب والفجر
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          witrReminder: {
                            ...(prev.witrReminder || defaultWitr),
                            timingMode: 'fixedTime',
                          },
                        }))
                      }
                      className={`p-2.5 rounded-xl border text-right transition-all text-xs font-semibold ${
                        localSettings.witrReminder?.timingMode === 'fixedTime'
                          ? 'bg-indigo-950/60 border-indigo-400 text-indigo-200 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="font-bold">ساعة ثابتة مخصصة</p>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                        حدد ساعة معينة بالدقيقة كل ليلة
                      </p>
                    </button>
                  </div>
                </div>

                {/* Sub-options based on timingMode */}
                {localSettings.witrReminder?.timingMode === 'beforeFajr' && (
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-300">كم دقيقة قبل أذان الفجر؟</span>
                    <div className="flex items-center gap-1.5">
                      {[30, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              witrReminder: {
                                ...(prev.witrReminder || defaultWitr),
                                minutesBeforeFajr: mins,
                              },
                            }))
                          }
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                            (localSettings.witrReminder?.minutesBeforeFajr || 45) === mins
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {mins} دقيقة
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {localSettings.witrReminder?.timingMode === 'fixedTime' && (
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-300">الوقت المخصص ليلاً:</span>
                    <input
                      type="time"
                      value={localSettings.witrReminder?.fixedTime || '02:30'}
                      onChange={(e) =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          witrReminder: {
                            ...(prev.witrReminder || defaultWitr),
                            fixedTime: e.target.value,
                          },
                        }))
                      }
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {/* Sound type for Witr */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    صوت تذكير الوتر:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                    {(
                      [
                        { id: 'both', label: 'نغمة + صوت' },
                        { id: 'chime', label: 'نغمة هادئة' },
                        { id: 'voice', label: 'نداء صوتي' },
                        { id: 'silent', label: 'صامت' },
                      ] as const
                    ).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            witrReminder: {
                              ...(prev.witrReminder || defaultWitr),
                              soundType: s.id,
                            },
                          }))
                        }
                        className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                          (localSettings.witrReminder?.soundType || 'both') === s.id
                            ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 font-bold'
                            : 'bg-slate-950/50 border-slate-800 text-slate-400'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {onTestWitrAlert && (
                  <button
                    type="button"
                    onClick={onTestWitrAlert}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>تجربة إشعار وصوت صلاة الوتر الآن</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Instant Test Alert Button */}
          <div className="pt-2">
            <button
              onClick={onTestPreAzanAlert}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 border border-amber-500/50 text-amber-200 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4 animate-bounce" />
              <span>تجربة إشعار «استعد للصلاة» الآن (معاينة حية)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0 bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md shadow-emerald-950/40"
          >
            حفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
}
