import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    return AsyncStorage.removeItem(key);
  },
  fileExists: async (fileUri: string): Promise<boolean> => {
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists;
  }
};

export const MODEL_PATH_KEY = 'phi3_model_path';
export const RAG_PATH_KEY = 'rag_json_path';

export const saveModelPath = async (path: string) => storage.setItem(MODEL_PATH_KEY, path);
export const getModelPath = async () => storage.getItem(MODEL_PATH_KEY);

export const saveRagPath = async (path: string) => storage.setItem(RAG_PATH_KEY, path);
export const getRagPath = async () => storage.getItem(RAG_PATH_KEY);

export const isFirstLaunch = async (): Promise<boolean> => {
  const hasLaunched = await storage.getItem('hasLaunched');
  if (!hasLaunched) {
    await storage.setItem('hasLaunched', 'true');
    return true;
  }
  return false;
};