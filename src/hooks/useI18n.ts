import { dictionaries, Lang } from '@/i18n';

export const useI18n = (lang: Lang) => {
  const dict = dictionaries[lang] || dictionaries.id;
  return dict;
};
