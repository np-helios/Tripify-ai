import Fuse from 'fuse.js';
import * as FileSystem from 'expo-file-system';

export const loadRagData = async (ragPath: string) => {
  const content = await FileSystem.readAsStringAsync(ragPath);
  return JSON.parse(content);
};

export const searchRag = (ragData: any[], query: string) => {
  const fuse = new Fuse(ragData, { keys: ['title', 'content', 'tags'], threshold: 0.4 });
  const results = fuse.search(query);
  return results.length > 0 ? results[0].item : null;
};
 
// FAQ entry type
export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

// Robust FAQ search for RAG
export function searchFaqRag(faqArray: FaqEntry[], query: string): FaqEntry | null {
  if (!faqArray) return null;
  const lowerQuery = query.toLowerCase();
  // Try exact match first
  let result = faqArray.find((item: FaqEntry) => item.question.toLowerCase() === lowerQuery);
  if (result) return result;
  // Try substring match
  result = faqArray.find((item: FaqEntry) => lowerQuery.includes(item.question.toLowerCase()) || item.question.toLowerCase().includes(lowerQuery));
  if (result) return result;
  // Try answer substring match
  result = faqArray.find((item: FaqEntry) => item.answer && lowerQuery.includes(item.answer.toLowerCase()));
  return result || null;
}
 