import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Check } from 'lucide-react';
import { INDONESIA_CITIES, getProvinces, getCitiesByProvince, City } from '@/data/indonesia-cities';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LocationStepProps {
  lang: 'id' | 'en';
  initialCity?: { city: string; province: string } | null;
  onNext: (location: { city: string; province: string }) => void;
  onBack: () => void;
}

const content = {
  id: {
    title: 'Pilih Lokasi',
    subtitle: 'Untuk jadwal sholat yang akurat sesuai kotamu.',
    searchPlaceholder: 'Cari kota...',
    selectProvince: 'Pilih Provinsi',
    detectLocation: 'Deteksi Otomatis',
    next: 'Lanjut',
    back: 'Kembali',
  },
  en: {
    title: 'Select Location',
    subtitle: 'For accurate prayer times in your city.',
    searchPlaceholder: 'Search city...',
    selectProvince: 'Select Province',
    detectLocation: 'Auto Detect',
    next: 'Continue',
    back: 'Back',
  },
};

const LocationStep: React.FC<LocationStepProps> = ({ lang, initialCity, onNext, onBack }) => {
  const t = content[lang];
  const [search, setSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(
    initialCity ? { name: initialCity.city, province: initialCity.province } : null
  );

  const provinces = getProvinces();

  const filteredCities = search
    ? INDONESIA_CITIES.filter(
        c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.province.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 10)
    : selectedProvince
    ? getCitiesByProvince(selectedProvince)
    : [];

  const handleSelect = (city: City) => {
    setSelectedCity(city);
    setSearch('');
  };

  const handleContinue = () => {
    if (selectedCity) {
      onNext({ city: selectedCity.name, province: selectedCity.province });
    }
  };

  return (
    <div className="pt-8">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="font-serif text-2xl text-white mb-2">{t.title}</h2>
        <p className="text-slate-400">{t.subtitle}</p>
      </motion.div>

      {/* Search Input */}
      <motion.div
        className="relative mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 z-10" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
        />
      </motion.div>

      {/* Search Results */}
      {search && filteredCities.length > 0 && (
        <motion.div
          className="mb-6 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          {filteredCities.map((city, i) => (
            <button
              key={`${city.province}-${city.name}`}
              onClick={() => handleSelect(city)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700/50 transition-colors ${
                i !== filteredCities.length - 1 ? 'border-b border-slate-700/50' : ''
              }`}
            >
              <div>
                <p className="text-white">{city.name}</p>
                <p className="text-xs text-slate-400">{city.province}</p>
              </div>
              {selectedCity?.name === city.name && selectedCity?.province === city.province && (
                <Check className="w-5 h-5 text-amber-400" />
              )}
            </button>
          ))}
        </motion.div>
      )}

      {/* Province Selector (when not searching) - Using Shadcn Select */}
      {!search && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Select
            value={selectedProvince || ''}
            onValueChange={(value) => setSelectedProvince(value || null)}
          >
            <SelectTrigger className="w-full h-14 bg-slate-800/80 border-slate-700 rounded-xl text-white focus:ring-amber-500/50 focus:border-amber-500/50">
              <SelectValue placeholder={t.selectProvince} />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white z-50 max-h-[300px]">
              {provinces.map(p => (
                <SelectItem 
                  key={p} 
                  value={p}
                  className="focus:bg-slate-700 focus:text-amber-400 cursor-pointer"
                >
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* City List from Province */}
      {!search && selectedProvince && filteredCities.length > 0 && (
        <motion.div
          className="mb-6 grid grid-cols-2 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {filteredCities.map(city => (
            <button
              key={`${city.province}-${city.name}`}
              onClick={() => handleSelect(city)}
              className={`px-4 py-3 rounded-xl border text-left transition-all ${
                selectedCity?.name === city.name && selectedCity?.province === city.province
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              {city.name}
            </button>
          ))}
        </motion.div>
      )}

      {/* Selected City Display */}
      {selectedCity && (
        <motion.div
          className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <MapPin className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-white font-medium">{selectedCity.name}</p>
            <p className="text-xs text-amber-400/70">{selectedCity.province}</p>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent">
        <div className="flex gap-3 max-w-md mx-auto">
          <button
            onClick={onBack}
            className="flex-1 py-4 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800/50 transition-all"
          >
            {t.back}
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedCity}
            className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
              selectedCity
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {t.next}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationStep;
