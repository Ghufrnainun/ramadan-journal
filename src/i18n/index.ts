import { id } from './id';
import { en } from './en';

export const dictionaries = { id, en };
export type Lang = keyof typeof dictionaries;
