import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, sizes, spacing, borderRadius, shadows } from '@/constants/theme';
import { Download, CircleCheck as CheckCircle, CircleAlert as AlertCircle, RefreshCw } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import { unzip } from 'react-native-zip-archive';
import { saveModelPath, saveRagPath } from '@/utils/storage';

const MODEL_ZIP_URL = 'https://firebasestorage.googleapis.com/v0/b/justixai.firebasestorage.app/o/onnx-distilgpt2.zip?alt=media&token=a99984c1-b6db-45c4-aca7-dc1523cb651f';
const RAG_JSON_URL = 'https://firebasestorage.googleapis.com/v0/b/justixai.firebasestorage.app/o/JSON?alt=media&token=f8e2d29f-899d-489a-ae06-246a113c54b2';

const downloadWithProgress = async (
  url: string,
  fileUri: string,
  onProgress: (progress: number) => void
) => {
  // Only log critical error if download fails, remove verbose logs
  const downloadResumable = FileSystem.createDownloadResumable(
    url,
    fileUri,
    {},
    (progress) => {
      if (progress.totalBytesExpectedToWrite) {
        const percent = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
        onProgress(percent);
      }
    }
  );
  await downloadResumable.downloadAsync();
};

const logDirContents = async (dir: string, label: string) => {
  try {
    await FileSystem.readDirectoryAsync(dir);
  } catch (e) {
    console.error(`[Setup] Failed to read directory ${dir}:`, e);
  }
};

const mergeOnnxModel = async (modelDir: string, modelName: string = 'model.onnx') => {
  try {
    const files = await FileSystem.readDirectoryAsync(modelDir);
    const dataFile = files.find(f => f.endsWith('.data'));
    if (dataFile) {
      // Only log warning if model is not compatible
      console.warn(`[Setup] Model uses external data - this may not work with onnxruntime-react-native`);
      return modelDir + '/' + modelName;
    } else {
      return modelDir + '/' + modelName;
    }
  } catch (e) {
    console.error(`[Setup] Error checking for external data:`, e);
    return modelDir + '/' + modelName;
  }
};

// Helper to find the model file recursively one level deep
const findModelFile = async (baseDir: string, modelFileName: string): Promise<string | null> => {
  // Check baseDir/modelFileName
  const directPath = baseDir + modelFileName;
  if ((await FileSystem.getInfoAsync(directPath)).exists) {
    return directPath;
  }
  // Check for nested directories one level deep
  const files = await FileSystem.readDirectoryAsync(baseDir);
  for (const file of files) {
    const fullPath = baseDir + (baseDir.endsWith('/') ? '' : '/') + file + '/' + modelFileName;
    if ((await FileSystem.getInfoAsync(fullPath)).exists) {
      return fullPath;
    }
  }
  return null;
};

interface DownloadStep {
  id: string;
  title: string;
  subtitle: string;
  fileSize: string;
  estimatedTime: string;
}

const downloadSteps: DownloadStep[] = [
  {
    id: 'ai-model',
    title: 'Onnx-distilgpt2',
    subtitle: 'Offline language model for travel assistance',
    fileSize: '500MB',
    estimatedTime: '2-3 minutes'
  },
  {
    id: 'destination-data',
    title: 'Leh-Ladakh Travel Package',
    subtitle: 'Places, routes, and cultural information',
    fileSize: '5MB',
    estimatedTime: '10 seconds'
  }
];

type DownloadStatus = 'pending' | 'downloading' | 'completed' | 'error';

export default function SetupScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('pending');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const downloadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentDownload = downloadSteps[currentStep];
  const isLastStep = currentStep === downloadSteps.length - 1;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: downloadProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [downloadProgress]);

  // Cleanup intervals and timeouts on unmount
  useEffect(() => {
    return () => {
      if (downloadIntervalRef.current) {
        clearInterval(downloadIntervalRef.current);
      }
      if (autoProgressTimeoutRef.current) {
        clearTimeout(autoProgressTimeoutRef.current);
      }
    };
  }, []);

  const clearAllTimers = () => {
    if (downloadIntervalRef.current) {
      clearInterval(downloadIntervalRef.current);
      downloadIntervalRef.current = null;
    }
    if (autoProgressTimeoutRef.current) {
      clearTimeout(autoProgressTimeoutRef.current);
      autoProgressTimeoutRef.current = null;
    }
  };

  const handleDownload = async () => {
    setDownloadStatus('downloading');
    setDownloadProgress(0);
    setErrorMessage('');
    try {
      const documentsDir = FileSystem.documentDirectory;
      await logDirContents(documentsDir!, 'Documents (before)');
      if (currentStep === 0) {
        // Download model zip with progress
        const zipPath = FileSystem.documentDirectory + 'onnx-distilgpt2.zip';
        await downloadWithProgress(MODEL_ZIP_URL, zipPath, setDownloadProgress);
        await logDirContents(documentsDir!, 'Documents (after model zip download)');
        // Unzip (strip file:// for react-native-zip-archive)
        const unzipDir = FileSystem.documentDirectory + 'onnx-distilgpt2/';
        const zipPathForUnzip = zipPath.replace('file://', '');
        const unzipDirForUnzip = unzipDir.replace('file://', '');
        const unzippedPath = await unzip(zipPathForUnzip, unzipDirForUnzip);
        await logDirContents(unzipDir, 'onnx-distilgpt2 (after unzip)');
        // Flatten nested directory if present
        const files = await FileSystem.readDirectoryAsync(unzipDir);
        if (files.length === 1) {
          const maybeNested = files[0];
          const nestedDir = unzipDir + maybeNested + '/';
          const nestedExists = (await FileSystem.getInfoAsync(nestedDir)).isDirectory;
          if (nestedExists) {
            const nestedFiles = await FileSystem.readDirectoryAsync(nestedDir);
            for (const file of nestedFiles) {
              await FileSystem.moveAsync({
                from: nestedDir + file,
                to: unzipDir + file,
              });
            }
            await FileSystem.deleteAsync(nestedDir, { idempotent: true });
            await logDirContents(unzipDir, 'onnx-distilgpt2 (after flatten)');
          }
        }
        // Ensure required files exist and rename/copy if needed
        const modelFileName = 'model.onnx';
        const vocabFileName = 'vocab.json';
        const mergesFileName = 'merges.txt';
        const modelFilePath = unzipDir + modelFileName;
        const targetModelPath = unzipDir + 'model.onnx';
        // Rename/copy model.onnx if needed
        if ((await FileSystem.getInfoAsync(modelFilePath)).exists) {
          if (!(await FileSystem.getInfoAsync(targetModelPath)).exists) {
            await FileSystem.copyAsync({ from: modelFilePath, to: targetModelPath });
          }
        }
        // Check for vocab.json and merges.txt
        if (!((await FileSystem.getInfoAsync(unzipDir + vocabFileName)).exists)) {
          console.error(`[Setup] vocab.json not found in model directory!`);
        }
        if (!((await FileSystem.getInfoAsync(unzipDir + mergesFileName)).exists)) {
          console.error(`[Setup] merges.txt not found in model directory!`);
        }
        // Save the model directory path (not file path)
        await saveModelPath(unzipDir);
      } else {
        // Download RAG JSON with progress
        const ragPath = FileSystem.documentDirectory + 'rag.json';
        await downloadWithProgress(RAG_JSON_URL, ragPath, setDownloadProgress);
        // Only log error if RAG file is missing
        await logDirContents(documentsDir!, 'Documents (after RAG download)');
        const ragExists = (await FileSystem.getInfoAsync(ragPath)).exists;
        if (!ragExists) {
          console.error(`[Setup] RAG file not found after download: ${ragPath}`);
          throw new Error('RAG file not found after download.');
        }
        await saveRagPath(ragPath);
      }
      await logDirContents(documentsDir!, 'Documents (end of step)');
      setDownloadStatus('completed');
      setDownloadProgress(1);
      Alert.alert('Success', 'Download completed!');
      setTimeout(() => handleNextStep(), 1000);
    } catch (e) {
      console.error('[Setup] Download or unzip error:', e);
      setDownloadStatus('error');
      setDownloadProgress(0);
      setErrorMessage('Download failed. Please try again.');
    }
  };

  const handleNextStep = () => {
    // Prevent multiple simultaneous transitions
    if (isTransitioning) {
      return;
    }

    setIsTransitioning(true);
    clearAllTimers();

    if (isLastStep) {
      // All downloads completed, navigate to main app
      router.replace('/(tabs)');
      return;
    }

    // Animate transition to next step
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    });

    // Update step state
    setCurrentStep(prev => prev + 1);
    setDownloadStatus('pending');
    setDownloadProgress(0);
    setErrorMessage('');
  };

  const retryDownload = () => {
    clearAllTimers();
    setDownloadStatus('pending');
    setDownloadProgress(0);
    setErrorMessage('');
    setIsTransitioning(false);
    
    // Animate retry button
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getStatusIcon = () => {
    switch (downloadStatus) {
      case 'completed':
        return <CheckCircle size={24} color={colors.success} />;
      case 'error':
        return <AlertCircle size={24} color={colors.error} />;
      case 'downloading':
        return (
          <Animated.View 
            style={{ 
              transform: [{ 
                rotate: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0deg', '360deg'],
                })
              }] 
            }}
          >
            <Download size={24} color={colors.primary} />
          </Animated.View>
        );
      default:
        return <Download size={24} color={colors.textLight} />;
    }
  };

  const getStatusText = () => {
    switch (downloadStatus) {
      case 'downloading':
        return `Downloading... ${Math.round(downloadProgress * 100)}%`;
      case 'completed':
        return 'Download completed!';
      case 'error':
        return 'Download failed';
      default:
        return 'Ready to download';
    }
  };

  const getButtonText = () => {
    if (isTransitioning) return 'Please wait...';
    if (downloadStatus === 'error') return 'Retry Download';
    if (downloadStatus === 'completed' && isLastStep) return 'Continue to App';
    if (downloadStatus === 'completed') return 'Next Step';
    if (downloadStatus === 'downloading') return 'Downloading...';
    return 'Start Download';
  };

  const handleButtonPress = () => {
    if (isTransitioning || downloadStatus === 'downloading') {
      return;
    }

    if (downloadStatus === 'error') {
      retryDownload();
    } else if (downloadStatus === 'completed') {
      if (isLastStep) {
        setIsTransitioning(true);
        router.replace('/(tabs)');
      } else {
        handleNextStep();
      }
    } else if (downloadStatus === 'pending') {
      handleDownload();
    }
  };

  const isButtonDisabled = downloadStatus === 'downloading' || isTransitioning;

  if (!currentDownload) {
    return null; // Safety check
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Getting Your AI Travel Assistant Ready</Text>
          <Text style={styles.subtitle}>
            Setting up offline capabilities for your Ladakh adventure
          </Text>
        </View>

        <View style={styles.progressIndicator}>
          <View style={styles.stepIndicators}>
            {downloadSteps.map((_, index) => (
              <View key={index} style={styles.stepIndicatorContainer}>
                <View
                  style={[
                    styles.stepDot,
                    index < currentStep && styles.stepDotCompleted,
                    index === currentStep && styles.stepDotActive,
                  ]}
                >
                  {index < currentStep && (
                    <CheckCircle size={16} color={colors.card} />
                  )}
                  {index === currentStep && downloadStatus === 'completed' && (
                    <CheckCircle size={16} color={colors.card} />
                  )}
                </View>
                {index < downloadSteps.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      index < currentStep && styles.stepLineCompleted,
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
          <Text style={styles.stepText}>
            Step {currentStep + 1} of {downloadSteps.length}
          </Text>
        </View>

        <Animated.View
          style={[
            styles.downloadCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.downloadHeader}>
            <View style={styles.downloadInfo}>
              <Text style={styles.downloadTitle}>{currentDownload.title}</Text>
              <Text style={styles.downloadSubtitle}>{currentDownload.subtitle}</Text>
            </View>
            <View style={styles.statusIcon}>
              {getStatusIcon()}
            </View>
          </View>

          <View style={styles.downloadDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>File Size:</Text>
              <Text style={styles.detailValue}>{currentDownload.fileSize}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estimated Time:</Text>
              <Text style={styles.detailValue}>{currentDownload.estimatedTime}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.statusText}>{getStatusText()}</Text>
              {downloadStatus === 'downloading' && (
                <Text style={styles.progressPercentage}>
                  {Math.round(downloadProgress * 100)}%
                </Text>
              )}
            </View>
            
            <View style={styles.progressBarContainer}>
              {downloadStatus === 'downloading' ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              )}
            </View>
          </View>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.downloadButton,
              isButtonDisabled && styles.downloadButtonDisabled,
              downloadStatus === 'completed' && !isButtonDisabled && styles.downloadButtonCompleted,
              downloadStatus === 'error' && styles.downloadButtonError,
            ]}
            onPress={handleButtonPress}
            disabled={isButtonDisabled}
            activeOpacity={0.8}
          >
            {downloadStatus === 'error' && !isTransitioning && (
              <RefreshCw size={20} color={colors.card} style={{ marginRight: spacing.sm }} />
            )}
            <Text
              style={[
                styles.downloadButtonText,
                isButtonDisabled && styles.downloadButtonTextDisabled,
              ]}
            >
              {getButtonText()}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            These downloads enable offline functionality in remote areas of Ladakh
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: sizes.xxl,
    fontFamily: fonts.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: sizes.md,
    fontFamily: fonts.regular,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: sizes.md * 1.4,
  },
  progressIndicator: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  stepIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepDotCompleted: {
    backgroundColor: colors.success,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  stepLineCompleted: {
    backgroundColor: colors.success,
  },
  stepText: {
    fontSize: sizes.sm,
    fontFamily: fonts.medium,
    color: colors.textLight,
  },
  downloadCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.medium,
  },
  downloadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  downloadInfo: {
    flex: 1,
  },
  downloadTitle: {
    fontSize: sizes.lg,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  downloadSubtitle: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  statusIcon: {
    marginLeft: spacing.md,
  },
  downloadDetails: {
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  detailValue: {
    fontSize: sizes.sm,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusText: {
    fontSize: sizes.md,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  progressPercentage: {
    fontSize: sizes.md,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '10',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.error,
    marginLeft: spacing.sm,
    flex: 1,
  },
  downloadButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.small,
  },
  downloadButtonDisabled: {
    backgroundColor: colors.muted,
  },
  downloadButtonCompleted: {
    backgroundColor: colors.success,
  },
  downloadButtonError: {
    backgroundColor: colors.error,
  },
  downloadButtonText: {
    fontSize: sizes.md,
    fontFamily: fonts.semiBold,
    color: colors.card,
  },
  downloadButtonTextDisabled: {
    color: colors.textLight,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
    textAlign: 'center',
  },
});