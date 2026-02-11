declare global {
  interface Window {
    __APP_PUBLIC_CONFIG__?: {
      supabaseUrl?: string;
      supabaseAnonKey?: string;
    };
  }
}

const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const runtimeSupabaseUrl =
  typeof window !== 'undefined'
    ? window.__APP_PUBLIC_CONFIG__?.supabaseUrl
    : undefined;
const supabaseUrl = envSupabaseUrl || runtimeSupabaseUrl;

const FUNCTION_URL = supabaseUrl
  ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1/equran-proxy`
  : '/functions/v1/equran-proxy';

// ============ SURAH & QURAN TYPES ============
export interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
}

export interface Ayah {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
}

export interface SurahDetail extends Surah {
  ayat: Ayah[];
  suratSelanjutnya: { nomor: number; nama: string; namaLatin: string } | false;
  suratSebelumnya: { nomor: number; nama: string; namaLatin: string } | false;
}

export interface TafsirAyah {
  ayat: number;
  teks: string;
}

export interface TafsirDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  tafsir: TafsirAyah[];
}

// ============ DOA TYPES ============
export interface Doa {
  id: number;
  nama: string;
  ar: string; // Arabic text
  tr: string; // Transliteration
  idn: string; // Indonesian translation
  grup?: string;
  tag?: string[];
  tentang?: string;
}

// ============ SHALAT TYPES ============
export interface JadwalShalatItem {
  tanggal: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface JadwalShalatData {
  provinsi: string;
  kabkota: string;
  bulan: number;
  tahun: number;
  bulan_nama: string;
  jadwal: JadwalShalatItem[];
}

// ============ IMSAKIYAH TYPES ============
export interface ImsakiyahItem {
  tanggal: string;
  imsak: string;
  subuh: string;
  terbit?: string;
  dhuha?: string;
  dzuhur?: string;
  ashar?: string;
  maghrib: string; // This is iftar time during Ramadan
  isya?: string;
}

export interface ImsakiyahData {
  provinsi: string;
  kabkota: string;
  hijriah: string;
  masehi: string;
  imsakiyah: ImsakiyahItem[];
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export class EQuranApi {
  private async parseJsonResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      const text = await response.text();
      const preview = text.slice(0, 200);
      throw new Error(
        `eQuran proxy returned non-JSON response (${response.status}, ${contentType || 'unknown'}): ${preview}`,
      );
    }

    return (await response.json()) as T;
  }

  private async fetchGet<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(
        `${FUNCTION_URL}?endpoint=${encodeURIComponent(endpoint)}`,
        {
          headers: { Accept: 'application/json' },
        },
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await this.parseJsonResponse<ApiResponse<T>>(response);

      if (result.code !== 200) {
        throw new Error(result.message || 'API error');
      }

      return result.data;
    } catch (error) {
      console.error('eQuran API error:', error);
      throw error;
    }
  }

  private async fetchPost<T>(endpoint: string, body: object): Promise<T> {
    try {
      const response = await fetch(
        `${FUNCTION_URL}?endpoint=${encodeURIComponent(endpoint)}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await this.parseJsonResponse<ApiResponse<T>>(response);

      if (result.code !== 200) {
        throw new Error(result.message || 'API error');
      }

      return result.data;
    } catch (error) {
      console.error('eQuran API error:', error);
      throw error;
    }
  }

  // ============ QURAN METHODS ============
  async getAllSurahs(): Promise<Surah[]> {
    return this.fetchGet<Surah[]>('surat');
  }

  async getSurah(number: number): Promise<SurahDetail> {
    return this.fetchGet<SurahDetail>(`surat/${number}`);
  }

  async getAyah(surahNumber: number, ayahNumber: number): Promise<Ayah> {
    const surah = await this.getSurah(surahNumber);
    const ayah = surah.ayat.find((a) => a.nomorAyat === ayahNumber);
    if (!ayah) throw new Error('Ayah not found');
    return ayah;
  }

  async getTafsir(surahNumber: number): Promise<TafsirDetail> {
    return this.fetchGet<TafsirDetail>(`tafsir/${surahNumber}`);
  }

  // ============ DOA METHODS ============
  async getAllDoa(): Promise<Doa[]> {
    return this.fetchGet<Doa[]>('doa');
  }

  async getDoaById(id: number): Promise<Doa> {
    return this.fetchGet<Doa>(`doa/${id}`);
  }

  async getDoaByGrup(grup: string): Promise<Doa[]> {
    return this.fetchGet<Doa[]>(`doa?grup=${encodeURIComponent(grup)}`);
  }

  async getDoaByTag(tag: string): Promise<Doa[]> {
    return this.fetchGet<Doa[]>(`doa?tag=${encodeURIComponent(tag)}`);
  }

  // ============ SHALAT METHODS ============
  async getProvinsi(): Promise<string[]> {
    return this.fetchGet<string[]>('shalat/provinsi');
  }

  async getKabKota(provinsi: string): Promise<string[]> {
    return this.fetchPost<string[]>('shalat/kabkota', { provinsi });
  }

  async getJadwalShalat(
    provinsi: string,
    kabkota: string,
    bulan?: number,
    tahun?: number,
  ): Promise<JadwalShalatItem[]> {
    const body: {
      provinsi: string;
      kabkota: string;
      bulan?: number;
      tahun?: number;
    } = {
      provinsi,
      kabkota,
    };
    if (bulan) body.bulan = bulan;
    if (tahun) body.tahun = tahun;

    // API returns { data: { jadwal: [...] } }
    const data = await this.fetchPost<JadwalShalatData>('shalat', body);
    return data.jadwal;
  }

  // ============ IMSAKIYAH METHODS ============
  async getJadwalImsakiyah(
    provinsi: string,
    kabkota: string,
    tahun?: number,
  ): Promise<ImsakiyahItem[]> {
    const body: { provinsi: string; kabkota: string; tahun?: number } = {
      provinsi,
      kabkota,
    };
    if (tahun) body.tahun = tahun;

    // API returns { data: { imsakiyah: [...] } }
    const data = await this.fetchPost<ImsakiyahData>('imsakiyah', body);
    return data.imsakiyah;
  }
}

export const equranApi = new EQuranApi();
