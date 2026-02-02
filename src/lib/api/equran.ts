import { supabase } from '@/integrations/supabase/client';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/equran-proxy`;

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

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

class EQuranApi {
  private async fetch<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${FUNCTION_URL}?endpoint=${encodeURIComponent(endpoint)}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (result.code !== 200) {
        throw new Error(result.message || 'API error');
      }

      return result.data;
    } catch (error) {
      console.error('eQuran API error:', error);
      throw error;
    }
  }

  async getAllSurahs(): Promise<Surah[]> {
    return this.fetch<Surah[]>('surat');
  }

  async getSurah(number: number): Promise<SurahDetail> {
    return this.fetch<SurahDetail>(`surat/${number}`);
  }

  async getAyah(surahNumber: number, ayahNumber: number): Promise<Ayah> {
    const surah = await this.getSurah(surahNumber);
    const ayah = surah.ayat.find(a => a.nomorAyat === ayahNumber);
    if (!ayah) throw new Error('Ayah not found');
    return ayah;
  }

  async getTafsir(surahNumber: number): Promise<TafsirDetail> {
    return this.fetch<TafsirDetail>(`tafsir/${surahNumber}`);
  }
}

export const equranApi = new EQuranApi();
