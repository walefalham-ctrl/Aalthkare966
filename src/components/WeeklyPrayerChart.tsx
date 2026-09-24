import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Info,
  Calendar,
  Layers,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CoordinatesData, PreAzanSettings } from '../types/prayer';
import { calculatePrayerTimes } from '../utils/prayerCalculations';

interface WeeklyPrayerChartProps {
  location: CoordinatesData;
  settings: PreAzanSettings;
  currentTime: Date;
}

type ViewMode = 'all' | 'individual';

interface PrayerConfig {
  key: string;
  name: string;
  color: string;
  stroke: string;
  fill: string;
  description: string;
}

const PRAYERS_CONFIG: Record<string, PrayerConfig> = {
  fajr: {
    key: 'fajr',
    name: 'الفجر',
    color: '#38bdf8', // sky-400
    stroke: '#0284c7',
    fill: 'rgba(56, 189, 248, 0.15)',
    description: 'يبدأ من طلوع الفجر الصادق',
  },
  sunrise: {
    key: 'sunrise',
    name: 'الشروق',
    color: '#fbbf24', // amber-400
    stroke: '#d97706',
    fill: 'rgba(251, 191, 36, 0.15)',
    description: 'شروق الشمس ونهاية وقت الفجر',
  },
  dhuhr: {
    key: 'dhuhr',
    name: 'الظهر',
    color: '#34d399', // emerald-400
    stroke: '#059669',
    fill: 'rgba(52, 211, 153, 0.15)',
    description: 'زوال الشمس عن كبد السماء',
  },
  asr: {
    key: 'asr',
    name: 'العصر',
    color: '#f97316', // orange-500
    stroke: '#ea580c',
    fill: 'rgba(249, 115, 22, 0.15)',
    description: 'مصير ظل كل شيء مثله',
  },
  maghrib: {
    key: 'maghrib',
    name: 'المغرب',
    color: '#ec4899', // pink-500
    stroke: '#db2777',
    fill: 'rgba(236, 72, 153, 0.15)',
    description: 'غروب قرص الشمس بالكامل',
  },
  isha: {
    key: 'isha',
    name: 'العشاء',
    color: '#818cf8', // indigo-400
    stroke: '#4f46e5',
    fill: 'rgba(129, 140, 248, 0.15)',
    description: 'مغيب الشفق الأحمر',
  },
};

// Convert minutes to readable 12-hour or 24-hour time "05:14 ص"
function formatMinutesToTime(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  const period = h24 >= 12 ? 'م' : 'ص';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h12)}:${pad(m)} ${period}`;
}

export function WeeklyPrayerChart({
  location,
  settings,
  currentTime,
}: WeeklyPrayerChartProps) {
  const [selectedPrayer, setSelectedPrayer] = useState<string>('all');
  const [chartType, setChartType] = useState<'line' | 'area'>('line');

  // Build current week data (7 days: starting from Saturday or beginning of current week)
  const weeklyData = useMemo(() => {
    const data = [];
    const baseDate = new Date(currentTime);
    
    // Find the start of the current week (Saturday in Islamic/Arab calendar, or 0 = Sunday)
    // In Arab world, Saturday is day 6 or Sunday is 0. Let's make the week start from current week's Saturday:
    const dayOfWeek = baseDate.getDay(); // 0 is Sunday, 6 is Saturday
    // Calculate days back to Saturday: if dayOfWeek is Saturday (6), diff is 0; if Sunday (0), diff is 1; etc.
    const diffToSaturday = (dayOfWeek + 1) % 7; 
    
    const weekStart = new Date(baseDate);
    weekStart.setDate(baseDate.getDate() - diffToSaturday);
    weekStart.setHours(0, 0, 0, 0);

    const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + i);

      const calculated = calculatePrayerTimes(
        location.latitude,
        location.longitude,
        dayDate,
        settings.calculationMethod,
        settings.madhab
      );

      const isToday =
        dayDate.getDate() === currentTime.getDate() &&
        dayDate.getMonth() === currentTime.getMonth() &&
        dayDate.getFullYear() === currentTime.getFullYear();

      // Extract minutes from midnight for each prayer
      const getPrayerMinutes = (id: string) => {
        const item = calculated.items.find((p) => p.id === id);
        if (!item) return 0;
        const d = item.time;
        return d.getHours() * 60 + d.getMinutes();
      };

      const getFormatted = (id: string) => {
        const item = calculated.items.find((p) => p.id === id);
        return item?.formattedTime || '';
      };

      const fajrMin = getPrayerMinutes('fajr');
      const sunriseMin = getPrayerMinutes('sunrise');
      const dhuhrMin = getPrayerMinutes('dhuhr');
      const asrMin = getPrayerMinutes('asr');
      const maghribMin = getPrayerMinutes('maghrib');
      const ishaMin = getPrayerMinutes('isha');

      const dayName = arabicDays[dayDate.getDay()];
      const dayMonth = `${dayDate.getDate()}/${dayDate.getMonth() + 1}`;

      data.push({
        dayName,
        dayMonth,
        fullLabel: `${dayName} (${dayMonth})`,
        isToday,
        date: dayDate,
        fajr: fajrMin,
        sunrise: sunriseMin,
        dhuhr: dhuhrMin,
        asr: asrMin,
        maghrib: maghribMin,
        isha: ishaMin,
        fajrTime: getFormatted('fajr'),
        sunriseTime: getFormatted('sunrise'),
        dhuhrTime: getFormatted('dhuhr'),
        asrTime: getFormatted('asr'),
        maghribTime: getFormatted('maghrib'),
        ishaTime: getFormatted('isha'),
      });
    }

    return data;
  }, [location.latitude, location.longitude, settings.calculationMethod, settings.madhab, currentTime]);

  // Calculate change between first day and last day of the week
  const weeklyTrends = useMemo(() => {
    if (weeklyData.length < 2) return [];
    const first = weeklyData[0];
    const last = weeklyData[weeklyData.length - 1];

    return Object.keys(PRAYERS_CONFIG).map((pKey) => {
      const firstRow = first as Record<string, any>;
      const lastRow = last as Record<string, any>;
      const diffMinutes = (lastRow[pKey] as number) - (firstRow[pKey] as number);
      return {
        key: pKey,
        name: PRAYERS_CONFIG[pKey].name,
        color: PRAYERS_CONFIG[pKey].color,
        diffMinutes,
        firstTime: firstRow[`${pKey}Time`] as string,
        lastTime: lastRow[`${pKey}Time`] as string,
      };
    });
  }, [weeklyData]);

  // Compute Y-domain based on selected view
  const yDomain = useMemo(() => {
    if (selectedPrayer !== 'all') {
      // @ts-expect-error dynamic access
      const values = weeklyData.map((d) => d[selectedPrayer] as number);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const padding = Math.max(3, Math.ceil((max - min) * 0.5) || 5);
      return [min - padding, max + padding];
    }
    // All prayers: from slightly before Fajr to slightly after Isha
    const allMins = weeklyData.flatMap((d) => [d.fajr, d.isha]);
    return [Math.floor(Math.min(...allMins) - 20), Math.ceil(Math.max(...allMins) + 20)];
  }, [weeklyData, selectedPrayer]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint = payload[0]?.payload;
    if (!dataPoint) return null;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-right font-sans min-w-[200px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
          <span className="font-bold text-xs text-white">
            {dataPoint.fullLabel}
          </span>
          {dataPoint.isToday && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              اليوم
            </span>
          )}
        </div>

        <div className="space-y-1.5 text-xs">
          {selectedPrayer === 'all' ? (
            Object.keys(PRAYERS_CONFIG).map((pKey) => {
              const conf = PRAYERS_CONFIG[pKey];
              const timeStr = dataPoint[`${pKey}Time`];
              return (
                <div key={pKey} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: conf.color }}
                    />
                    <span className="text-slate-300 font-medium">{conf.name}:</span>
                  </div>
                  <span className="font-mono font-semibold text-white tabular-nums" dir="ltr">
                    {timeStr}
                  </span>
                </div>
              );
            })
          ) : (
            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: PRAYERS_CONFIG[selectedPrayer].color }}
                  />
                  <span className="text-slate-200 font-bold text-sm">
                    {PRAYERS_CONFIG[selectedPrayer].name}:
                  </span>
                </div>
                <span className="font-mono font-bold text-base text-emerald-300 tabular-nums" dir="ltr">
                  {dataPoint[`${selectedPrayer}Time`]}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {PRAYERS_CONFIG[selectedPrayer].description}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header with Title and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                منحنى تغير مواعيد الصلاة خلال الأسبوع
              </h3>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                مباشر وفلكي
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              يوضح اتجاهات التبكير والتأخير الدقيقة لمواقيت الصلوات في {location.city}
            </p>
          </div>
        </div>

        {/* Chart Style Toggle: Line vs Area */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                chartType === 'line'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              خطوط
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                chartType === 'area'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              مساحي
            </button>
          </div>
        </div>
      </div>

      {/* Prayer Filter Badges (All or Specific Prayer) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedPrayer('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
            selectedPrayer === 'all'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/40'
              : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>كل الصلوات (عرض شامل)</span>
        </button>

        {Object.entries(PRAYERS_CONFIG).map(([key, conf]) => {
          const isSelected = selectedPrayer === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedPrayer(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-800 text-white border-slate-600 shadow-sm'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
              style={{
                borderColor: isSelected ? conf.color : undefined,
                backgroundColor: isSelected ? `${conf.color}20` : undefined,
                color: isSelected ? conf.color : undefined,
              }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: conf.color }}
              />
              <span>{conf.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Recharts Graphic Container */}
      <div className="w-full h-72 sm:h-80 pt-2" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart
              data={weeklyData}
              margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.35}
                vertical={false}
              />
              <XAxis
                dataKey="dayName"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Tajawal, sans-serif' }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                domain={yDomain}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) => formatMinutesToTime(val)}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              {selectedPrayer === 'all' && (
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={32}
                  formatter={(value) => {
                    const conf = PRAYERS_CONFIG[value];
                    return (
                      <span className="text-xs text-slate-300 font-sans font-medium px-1">
                        {conf ? conf.name : value}
                      </span>
                    );
                  }}
                />
              )}

              {/* Render Lines */}
              {selectedPrayer === 'all' ? (
                Object.keys(PRAYERS_CONFIG).map((pKey) => {
                  const conf = PRAYERS_CONFIG[pKey];
                  return (
                    <Line
                      key={pKey}
                      type="monotone"
                      dataKey={pKey}
                      name={pKey}
                      stroke={conf.color}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: conf.color, strokeWidth: 1, stroke: '#0f172a' }}
                      activeDot={{ r: 5, fill: conf.color, stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  );
                })
              ) : (
                <Line
                  type="monotone"
                  dataKey={selectedPrayer}
                  name={selectedPrayer}
                  stroke={PRAYERS_CONFIG[selectedPrayer].color}
                  strokeWidth={3.5}
                  dot={{ r: 4, fill: PRAYERS_CONFIG[selectedPrayer].color, strokeWidth: 2, stroke: '#0f172a' }}
                  activeDot={{ r: 7, fill: '#ffffff', stroke: PRAYERS_CONFIG[selectedPrayer].color, strokeWidth: 3 }}
                />
              )}
            </LineChart>
          ) : (
            <AreaChart
              data={weeklyData}
              margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
            >
              <defs>
                {Object.keys(PRAYERS_CONFIG).map((pKey) => (
                  <linearGradient key={`grad-${pKey}`} id={`grad-${pKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRAYERS_CONFIG[pKey].color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={PRAYERS_CONFIG[pKey].color} stopOpacity={0.0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.35}
                vertical={false}
              />
              <XAxis
                dataKey="dayName"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Tajawal, sans-serif' }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                domain={yDomain}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) => formatMinutesToTime(val)}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              {selectedPrayer === 'all' && (
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={32}
                  formatter={(value) => {
                    const conf = PRAYERS_CONFIG[value];
                    return (
                      <span className="text-xs text-slate-300 font-sans font-medium px-1">
                        {conf ? conf.name : value}
                      </span>
                    );
                  }}
                />
              )}

              {selectedPrayer === 'all' ? (
                Object.keys(PRAYERS_CONFIG).map((pKey) => {
                  const conf = PRAYERS_CONFIG[pKey];
                  return (
                    <Area
                      key={pKey}
                      type="monotone"
                      dataKey={pKey}
                      name={pKey}
                      stroke={conf.color}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#grad-${pKey})`}
                    />
                  );
                })
              ) : (
                <Area
                  type="monotone"
                  dataKey={selectedPrayer}
                  name={selectedPrayer}
                  stroke={PRAYERS_CONFIG[selectedPrayer].color}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={`url(#grad-${selectedPrayer})`}
                  dot={{ r: 4, fill: PRAYERS_CONFIG[selectedPrayer].color, strokeWidth: 1, stroke: '#0f172a' }}
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Weekly Trend Summary Cards */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">
              ملخص حركة المواقيت هذا الأسبوع (من أول الأسبوع إلى نهايته):
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            7 أيام متتالية
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {weeklyTrends.map((trend) => {
            const isAdvance = trend.diffMinutes < 0;
            const isDelay = trend.diffMinutes > 0;
            const isStable = trend.diffMinutes === 0;

            return (
              <div
                key={trend.key}
                onClick={() => setSelectedPrayer(trend.key)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer text-right ${
                  selectedPrayer === trend.key
                    ? 'bg-slate-800/90 border-slate-600 shadow-md'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: trend.color }}
                    />
                    {trend.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                      isAdvance
                        ? 'bg-sky-500/15 text-sky-300'
                        : isDelay
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isAdvance
                      ? `تبكير ${Math.abs(trend.diffMinutes)} د`
                      : isDelay
                      ? `تأخير ${trend.diffMinutes} د`
                      : 'ثابت'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800/60" dir="ltr">
                  <span>{trend.firstTime}</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-slate-200 font-medium">{trend.lastTime}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
