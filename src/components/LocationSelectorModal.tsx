import { useState } from 'react';
import {
  X,
  MapPin,
  Navigation,
  Search,
  Check,
  Compass,
  Radio,
  AlertCircle,
} from 'lucide-react';
import { CoordinatesData } from '../types/prayer';
import { PRESET_CITIES, PresetCity } from '../data/cities';

interface LocationSelectorModalProps {
  currentLocation: CoordinatesData;
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (data: CoordinatesData) => void;
  isWatchingLocation: boolean;
  onToggleWatchLocation: () => void;
}

export function LocationSelectorModal({
  currentLocation,
  isOpen,
  onClose,
  onSelectLocation,
  isWatchingLocation,
  onToggleWatchLocation,
}: LocationSelectorModalProps) {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [latInput, setLatInput] = useState(String(currentLocation.latitude));
  const [lngInput, setLngInput] = useState(String(currentLocation.longitude));
  const [cityNameInput, setCityNameInput] = useState(currentLocation.city);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Filter preset cities
  const filteredCities = PRESET_CITIES.filter(
    (c) =>
      c.name.includes(searchQuery) ||
      c.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.includes(searchQuery) ||
      c.countryEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle GPS Auto Detect
  const handleAutoLocate = () => {
    if (!('geolocation' in navigator)) {
      setGeoError('المتصفح لا يدعم تحديد الموقع الجغرافي.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;

        // Try reverse geocoding via OpenStreetMap Nominatim or find closest preset city
        let detectedCity = 'موقعي الحالي';
        let detectedCountry = 'تحديد تلقائي';

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ar`,
            { headers: { 'User-Agent': 'PrayerTimesApp/1.0' } }
          );
          if (res.ok) {
            const data = await res.json();
            detectedCity =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.state ||
              'موقعي الحالي';
            detectedCountry = data.address?.country || 'تحديد تلقائي';
          }
        } catch {
          // If network fetch fails, calculate nearest preset city
          let nearest = PRESET_CITIES[0];
          let minDist = 999999;
          for (const c of PRESET_CITIES) {
            const d =
              Math.pow(c.latitude - latitude, 2) +
              Math.pow(c.longitude - longitude, 2);
            if (d < minDist) {
              minDist = d;
              nearest = c;
            }
          }
          detectedCity = nearest.name;
          detectedCountry = nearest.country;
        }

        onSelectLocation({
          latitude,
          longitude,
          city: detectedCity,
          country: detectedCountry,
          isAutoDetected: true,
        });
        onClose();
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('تم رفض إذن الوصول للموقع. يرجى تفعيل إذن الموقع في المتصفح أو إدخال الإحداثيات يدوياً.');
        } else {
          setGeoError('تعذر تحديد الموقع تلقائياً. تأكد من اتصال الإنترنت أو اختر من قائمة المدن أدناه.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle manual coordinate submission
  const handleApplyCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setGeoError('خط العرض يجب أن يكون رقماً بين -90 و 90 درجة');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setGeoError('خط الطول يجب أن يكون رقماً بين -180 و 180 درجة');
      return;
    }

    onSelectLocation({
      latitude: lat,
      longitude: lng,
      city: cityNameInput.trim() || `موقع (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
      country: 'إحداثيات مخصصة',
      isAutoDetected: false,
    });
    onClose();
  };

  const handleSelectPreset = (city: PresetCity) => {
    onSelectLocation({
      latitude: city.latitude,
      longitude: city.longitude,
      city: city.name,
      country: city.country,
      isAutoDetected: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                تحديد الموقع وحساب الإحداثيات
              </h3>
              <p className="text-xs text-slate-400">
                تتغير مواقيت الأذان تلقائياً بحسب خطوط الطول والعرض
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

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Error Message */}
          {geoError && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{geoError}</span>
            </div>
          )}

          {/* Section 1: GPS Auto Location Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">تحديد الموقع التلقائي عبر GPS</p>
                <p className="text-xs text-slate-400">
                  يكتشف خطوط الطول والعرض بدقة فائقة من جهازك
                </p>
              </div>
            </div>

            <button
              onClick={handleAutoLocate}
              disabled={isLocating}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 shrink-0"
            >
              {isLocating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جارٍ التحديد...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>تحديد موقعي الآن</span>
                </>
              )}
            </button>
          </div>

          {/* Live Watch Position Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <Radio className={`w-4 h-4 ${isWatchingLocation ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <div>
                <span className="font-semibold text-slate-200">
                  تحديث المواعيد تلقائياً أثناء السفر والتنقل
                </span>
                <p className="text-[11px] text-slate-400">
                  يعيد حساب مواقيت الصلاة في الخلفية كلما تغيرت إحداثيات موقعك
                </p>
              </div>
            </div>
            <button
              onClick={onToggleWatchLocation}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                isWatchingLocation
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isWatchingLocation ? 'مُفعّل' : 'تفعيل'}
            </button>
          </div>

          {/* Section 2: Manual Latitude & Longitude Input */}
          <form onSubmit={handleApplyCoordinates} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
            <p className="text-xs font-bold text-slate-200">
              إدخال خطوط الطول والعرض يدوياً:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  اسم المدينة / الموقع:
                </label>
                <input
                  type="text"
                  value={cityNameInput}
                  onChange={(e) => setCityNameInput(e.target.value)}
                  placeholder="مثال: الرياض"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  خط العرض (Latitude):
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  placeholder="24.7136"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  خط الطول (Longitude):
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                  placeholder="46.6753"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium border border-slate-700 transition-colors"
              >
                تطبيق الإحداثيات وتحديث المواقيت
              </button>
            </div>
          </form>

          {/* Section 3: Preset Cities Search & List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-200">
                أو اختر من أشهر المدن والعواصم:
              </p>
              <span className="text-[11px] text-slate-500">
                {filteredCities.length} مدينة متاحة
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم: مكة، القاهرة، دبي، إسطنبول، لندن..."
                className="w-full pr-9 pl-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700/70 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* City Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredCities.map((city) => {
                const isSelected =
                  Math.abs(city.latitude - currentLocation.latitude) < 0.01 &&
                  Math.abs(city.longitude - currentLocation.longitude) < 0.01;

                return (
                  <button
                    key={`${city.name}-${city.country}`}
                    onClick={() => handleSelectPreset(city)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-right transition-all ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200'
                        : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="truncate">
                      <p className="text-xs font-semibold truncate">{city.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{city.country}</p>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
