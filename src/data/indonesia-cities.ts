/**
 * Indonesian Cities for Location Selection
 * Major cities grouped by province
 */

export interface City {
  name: string;
  province: string;
}

export const INDONESIA_CITIES: City[] = [
  // DKI Jakarta
  { name: 'Jakarta Pusat', province: 'DKI Jakarta' },
  { name: 'Jakarta Selatan', province: 'DKI Jakarta' },
  { name: 'Jakarta Barat', province: 'DKI Jakarta' },
  { name: 'Jakarta Timur', province: 'DKI Jakarta' },
  { name: 'Jakarta Utara', province: 'DKI Jakarta' },
  
  // Jawa Barat
  { name: 'Bandung', province: 'Jawa Barat' },
  { name: 'Bekasi', province: 'Jawa Barat' },
  { name: 'Depok', province: 'Jawa Barat' },
  { name: 'Bogor', province: 'Jawa Barat' },
  { name: 'Cirebon', province: 'Jawa Barat' },
  { name: 'Tasikmalaya', province: 'Jawa Barat' },
  { name: 'Sukabumi', province: 'Jawa Barat' },
  
  // Jawa Tengah
  { name: 'Semarang', province: 'Jawa Tengah' },
  { name: 'Solo', province: 'Jawa Tengah' },
  { name: 'Pekalongan', province: 'Jawa Tengah' },
  { name: 'Tegal', province: 'Jawa Tengah' },
  { name: 'Magelang', province: 'Jawa Tengah' },
  { name: 'Purwokerto', province: 'Jawa Tengah' },
  
  // DI Yogyakarta
  { name: 'Yogyakarta', province: 'DI Yogyakarta' },
  { name: 'Sleman', province: 'DI Yogyakarta' },
  { name: 'Bantul', province: 'DI Yogyakarta' },
  
  // Jawa Timur
  { name: 'Surabaya', province: 'Jawa Timur' },
  { name: 'Malang', province: 'Jawa Timur' },
  { name: 'Sidoarjo', province: 'Jawa Timur' },
  { name: 'Kediri', province: 'Jawa Timur' },
  { name: 'Jember', province: 'Jawa Timur' },
  { name: 'Madiun', province: 'Jawa Timur' },
  
  // Banten
  { name: 'Tangerang', province: 'Banten' },
  { name: 'Tangerang Selatan', province: 'Banten' },
  { name: 'Serang', province: 'Banten' },
  { name: 'Cilegon', province: 'Banten' },
  
  // Sumatera Utara
  { name: 'Medan', province: 'Sumatera Utara' },
  { name: 'Binjai', province: 'Sumatera Utara' },
  { name: 'Pematangsiantar', province: 'Sumatera Utara' },
  
  // Sumatera Selatan
  { name: 'Palembang', province: 'Sumatera Selatan' },
  { name: 'Lubuklinggau', province: 'Sumatera Selatan' },
  
  // Sumatera Barat
  { name: 'Padang', province: 'Sumatera Barat' },
  { name: 'Bukittinggi', province: 'Sumatera Barat' },
  
  // Riau
  { name: 'Pekanbaru', province: 'Riau' },
  { name: 'Dumai', province: 'Riau' },
  
  // Kepulauan Riau
  { name: 'Batam', province: 'Kepulauan Riau' },
  { name: 'Tanjungpinang', province: 'Kepulauan Riau' },
  
  // Lampung
  { name: 'Bandar Lampung', province: 'Lampung' },
  { name: 'Metro', province: 'Lampung' },
  
  // Aceh
  { name: 'Banda Aceh', province: 'Aceh' },
  { name: 'Lhokseumawe', province: 'Aceh' },
  
  // Kalimantan
  { name: 'Balikpapan', province: 'Kalimantan Timur' },
  { name: 'Samarinda', province: 'Kalimantan Timur' },
  { name: 'Banjarmasin', province: 'Kalimantan Selatan' },
  { name: 'Pontianak', province: 'Kalimantan Barat' },
  { name: 'Palangkaraya', province: 'Kalimantan Tengah' },
  
  // Sulawesi
  { name: 'Makassar', province: 'Sulawesi Selatan' },
  { name: 'Manado', province: 'Sulawesi Utara' },
  { name: 'Palu', province: 'Sulawesi Tengah' },
  { name: 'Kendari', province: 'Sulawesi Tenggara' },
  
  // Bali & Nusa Tenggara
  { name: 'Denpasar', province: 'Bali' },
  { name: 'Mataram', province: 'Nusa Tenggara Barat' },
  { name: 'Kupang', province: 'Nusa Tenggara Timur' },
  
  // Maluku & Papua
  { name: 'Ambon', province: 'Maluku' },
  { name: 'Jayapura', province: 'Papua' },
  { name: 'Sorong', province: 'Papua Barat' },
];

export const getProvinces = (): string[] => {
  const provinces = new Set(INDONESIA_CITIES.map(c => c.province));
  return Array.from(provinces).sort();
};

export const getCitiesByProvince = (province: string): City[] => {
  return INDONESIA_CITIES.filter(c => c.province === province);
};
