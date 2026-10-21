import { useState, useEffect } from 'react';
import { X, Compass as CompassIcon, Navigation, Info } from 'lucide-react';
import { calculateQiblaBearing } from '../utils/prayerCalculations';

interface QiblaCompassProps {
  latitude: number;
  longitude: number;
  city: string;
  isOpen: boolean;
  onClose: () => void;
}

export function QiblaCompass({
  latitude,
  longitude,
  city,
  isOpen,
  onClose,
}: QiblaCompassProps) {
  const [deviceAlpha, setDeviceAlpha] = useState<number | null>(null);
  const [hasCompassSensor, setHasCompassSensor] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // @ts-expect-error webkitCompassHeading for iOS
      const heading = e.webkitCompassHeading ?? (e.alpha !== null ? 360 - e.alpha : null);
      if (heading !== null) {
        setDeviceAlpha(heading);
        setHasCompassSensor(true);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const { degrees, compassDirectionText, distanceKm } = calculateQiblaBearing(
    latitude,
    longitude
  );

  // Needle angle: if device orientation is active, needle rotates relative to device; otherwise points at bearing angle
  const needleRotation =
    deviceAlpha !== null ? (degrees - deviceAlpha + 360) % 360 : degrees;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <CompassIcon className="w-5 h-5" />
          <h3 className="text-lg font-bold text-white">بوصلة اتجاه القبلة</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          باتجاه الكعبة المشرفة بمكة المكرمة من {city}
        </p>

        {/* Visual Compass Graphic */}
        <div className="relative w-64 h-64 flex items-center justify-center rounded-full border-4 border-slate-800 bg-slate-950/80 shadow-inner my-2">
          {/* Degree ticks around border */}
          <div className="absolute inset-2 rounded-full border border-slate-700/50" />

          {/* Cardinal Directions */}
          <span className="absolute top-3 text-xs font-bold text-rose-500 font-mono">
            N (ش)
          </span>
          <span className="absolute right-3 text-xs font-bold text-slate-400 font-mono">
            E (ق)
          </span>
          <span className="absolute bottom-3 text-xs font-bold text-slate-400 font-mono">
            S (ج)
          </span>
          <span className="absolute left-3 text-xs font-bold text-slate-400 font-mono">
            W (غ)
          </span>

          {/* Compass Needle (Kaaba pointer) */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${needleRotation}deg)` }}
          >
            {/* Top Kaaba indicator arrow */}
            <div className="flex flex-col items-center -translate-y-12">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 mb-1 border border-emerald-400">
                <span className="text-[10px] font-black">🕋</span>
              </div>
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[18px] border-b-emerald-500" />
            </div>

            {/* Needle center pivot */}
            <div className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 shadow z-10" />

            {/* Bottom opposite needle tip */}
            <div className="flex flex-col items-center translate-y-12">
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[14px] border-t-slate-600" />
            </div>
          </div>
        </div>

        {/* Metrics Readout */}
        <div className="grid grid-cols-2 gap-3 w-full mt-6 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block mb-1">زاوية القبلة من الشمال:</span>
            <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
              {degrees}° {compassDirectionText}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block mb-1">المسافة إلى مكة:</span>
            <span className="text-lg font-bold text-slate-200 font-mono tabular-nums">
              {distanceKm.toLocaleString('ar-EG')} كم
            </span>
          </div>
        </div>

        {/* Device orientation info */}
        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>
            {hasCompassSensor
              ? 'مستشعر البوصلة يعمل بنشاط على هاتفك.'
              : 'وجّه هاتفك بحيث يشير السهم الأخضر نحو اتجاه القبلة (الكعبة المشرفة).'}
          </span>
        </div>
      </div>
    </div>
  );
}
