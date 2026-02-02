export interface ReflectionPrompt {
  id: string;
  text: { id: string; en: string };
}

export const REFLECTION_PROMPTS: ReflectionPrompt[] = [
  {
    id: 'gratitude',
    text: {
      id: 'Apa satu hal kecil yang kamu syukuri hari ini?',
      en: 'What is one small thing you are grateful for today?',
    },
  },
  {
    id: 'patience',
    text: {
      id: 'Momen apa yang menguji kesabaranmu hari ini, dan apa yang kamu pelajari?',
      en: 'What tested your patience today, and what did you learn from it?',
    },
  },
  {
    id: 'presence',
    text: {
      id: 'Kapan kamu merasa paling hadir dan tenang hari ini?',
      en: 'When did you feel most present and calm today?',
    },
  },
  {
    id: 'dua',
    text: {
      id: 'Doa apa yang paling ingin kamu panjatkan malam ini?',
      en: 'What is the main prayer you want to whisper tonight?',
    },
  },
  {
    id: 'forgiveness',
    text: {
      id: 'Hal apa yang ingin kamu perbaiki besok?',
      en: 'What would you like to do better tomorrow?',
    },
  },
  {
    id: 'kindness',
    text: {
      id: 'Kebaikan kecil apa yang kamu lakukan atau terima hari ini?',
      en: 'What small kindness did you do or receive today?',
    },
  },
  {
    id: 'intention',
    text: {
      id: 'Niat apa yang ingin kamu bawa saat sahur besok?',
      en: 'What intention do you want to carry into tomorrow’s suhoor?',
    },
  },
];

export const getPromptForDate = (date: Date = new Date()): ReflectionPrompt => {
  const dayIndex = date.getDate() + date.getMonth() * 31;
  return REFLECTION_PROMPTS[dayIndex % REFLECTION_PROMPTS.length];
};
