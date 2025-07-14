import * as FileSystem from 'expo-file-system';
import { unzip } from 'react-native-zip-archive';

const zipUrl = 'https://firebasestorage.googleapis.com/v0/b/justixai.firebasestorage.app/o/onnx-distilgpt2.zip?alt=media&token=a99984c1-b6db-45c4-aca7-dc1523cb651f';
const zipPath = `${FileSystem.documentDirectory}onnx-distilgpt2.zip`;
const unzipPath = `${FileSystem.documentDirectory}onnx-distilgpt2/`;

export async function ensureModelReady(): Promise<string> {
  const modelFile = `${unzipPath}model.onnx`;
  const modelExists = (await FileSystem.getInfoAsync(modelFile)).exists;
  if (modelExists) return unzipPath;

  const downloadResumable = FileSystem.createDownloadResumable(zipUrl, zipPath);
  const downloadResult = await downloadResumable.downloadAsync();
  if (!downloadResult || downloadResult.status !== 200) throw new Error('Model download failed');

  await unzip(zipPath.replace('file://', ''), unzipPath.replace('file://', ''));
  await FileSystem.deleteAsync(zipPath, { idempotent: true });

  return unzipPath;
} 