export interface DhikrReadItem {
  type: string;
  arab: string;
  indo: string;
  ulang: string;
}

export interface HadithItem {
  no: string;
  judul: string;
  arab: string;
  indo: string;
}

const BASE_URL = '/api-muslim/v1';

export async function getDhikr(
  type: 'pagi' | 'petang' | 'solat',
): Promise<DhikrReadItem[]> {
  try {
    const response = await fetch(`${BASE_URL}/dzikir`);
    if (!response.ok) throw new Error('Failed to fetch dhikr');

    // The API returns all types in one list, so we filter.
    // However, the 'type' field in the API for solat might be 'solat' or similar.
    // Based on inspection: types are "pagi", "sore" (evening), "solat"
    const json = await response.json();
    const allItems: DhikrReadItem[] = json.data;

    // Map our 'petang' to API's 'sore' if needed
    const apiType = type === 'petang' ? 'sore' : type;

    return allItems.filter((item) => item.type === apiType);
  } catch (error) {
    console.error('Error fetching dhikr:', error);
    return [];
  }
}

export async function getHadithList(): Promise<HadithItem[]> {
  try {
    const response = await fetch(`${BASE_URL}/hadits`);
    if (!response.ok) throw new Error('Failed to fetch hadith');
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching hadith:', error);
    return [];
  }
}
