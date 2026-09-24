import { useState } from 'react';
import { X, Calendar, Printer, Download } from 'lucide-react';
import { CoordinatesData, PreAzanSettings } from '../types/prayer';
import { calculatePrayerTimes, formatTimeString } from '../utils/prayerCalculations';

interface MonthlyScheduleModalProps {
  location: CoordinatesData;
  settings: PreAzanSettings;
  isOpen: boolean;
  onClose: () => void;
}

export function MonthlyScheduleModal({
  location,
  settings,
  isOpen,
  onClose,
}: MonthlyScheduleModalProps) {
  if (!isOpen) return null;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  // Calculate days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Intl.DateTimeFormat('ar-EG', { month: 'long', year: 'numeric' }).format(today);

  // Generate prayer times for each day in month
  const monthlyData = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const times = calculatePrayerTimes(
      location.latitude,
      location.longitude,
      d,
      settings.calculationMethod,
      settings.madhab
    );

    const isToday = day === today.getDate();
    monthlyData.push({
      day,
      date: d,
      isToday,
      dayOfWeek: new Intl.DateTimeFormat('ar-EG', { weekday: 'short' }).format(d),
      fajr: times.items.find((p) => p.id === 'fajr')?.formattedTime || '',
      sunrise: times.items.find((p) => p.id === 'sunrise')?.formattedTime || '',
      dhuhr: times.items.find((p) => p.id === 'dhuhr')?.formattedTime || '',
      asr: times.items.find((p) => p.id === 'asr')?.formattedTime || '',
      maghrib: times.items.find((p) => p.id === 'maghrib')?.formattedTime || '',
      isha: times.items.find((p) => p.id === 'isha')?.formattedTime || '',
    });
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col print:border-none print:shadow-none print:max-h-full print:bg-white print:text-black">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0 print:border-b-2 print:border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center print:hidden">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white print:text-black">
                جدول مواقيت الصلاة لشهر {monthName}
              </h3>
              <p className="text-xs text-slate-400 print:text-slate-600">
                مواقيت {location.city} ({location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="طباعة الجدول"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-auto p-4">
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 print:bg-slate-100 print:text-slate-800">
                <th className="p-2 font-semibold">اليوم</th>
                <th className="p-2 font-semibold">التاريخ</th>
                <th className="p-2 font-semibold text-emerald-400 print:text-black">الفجر</th>
                <th className="p-2 font-semibold text-amber-400 print:text-black">الشروق</th>
                <th className="p-2 font-semibold">الظهر</th>
                <th className="p-2 font-semibold">العصر</th>
                <th className="p-2 font-semibold">المغرب</th>
                <th className="p-2 font-semibold">العشاء</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row) => (
                <tr
                  key={row.day}
                  className={`border-b border-slate-800/60 transition-colors font-mono tabular-nums ${
                    row.isToday
                      ? 'bg-emerald-950/40 text-emerald-200 font-bold border-emerald-500/50 print:bg-slate-200'
                      : 'hover:bg-slate-800/40 text-slate-300 print:text-black'
                  }`}
                >
                  <td className="p-2 font-sans font-medium text-slate-200">
                    {row.dayOfWeek}
                  </td>
                  <td className="p-2">
                    {row.day} {monthName}
                  </td>
                  <td className="p-2 text-emerald-300 print:text-black">{row.fajr}</td>
                  <td className="p-2 text-amber-300/80 print:text-black">{row.sunrise}</td>
                  <td className="p-2">{row.dhuhr}</td>
                  <td className="p-2">{row.asr}</td>
                  <td className="p-2">{row.maghrib}</td>
                  <td className="p-2">{row.isha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
