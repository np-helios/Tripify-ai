import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import DownloadItem from '@/components/DownloadItem';
import { colors, fonts, sizes, spacing, borderRadius, shadows } from '@/constants/theme';
import { User, Settings, CircleHelp as HelpCircle, Shield, Phone, Download, Moon, Bell } from 'lucide-react-native';
import { downloadData } from '@/data/mockData';
import { getModelPath, saveModelPath } from '@/utils/storage';
import * as FileSystem from 'expo-file-system';
import { unzip } from 'react-native-zip-archive';
import * as Updates from 'expo-updates';
import { router } from 'expo-router';

const MODEL_ZIP_URL = 'https://firebasestorage.googleapis.com/v0/b/justixai.firebasestorage.app/o/phi3-model.zip?alt=media&token=7aa7483d-3546-4701-9d6d-6688636f0e08';

export default function ProfileScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [modelStatus, setModelStatus] = useState<'installed' | 'available' | 'downloading'>('available');
  const [modelProgress, setModelProgress] = useState(0);

  useEffect(() => {
    (async () => {
      const modelPath = await getModelPath();
      const exists = modelPath && (await FileSystem.getInfoAsync(modelPath)).exists;
      setModelStatus(exists ? 'installed' : 'available');
    })();
  }, []);

  const handleDownloadPress = (item: any) => {
    // Removed verbose log for download/install
  };

  const downloadWithProgress = async (
    url: string,
    fileUri: string,
    onProgress: (progress: number) => void
  ) => {
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {},
      (progress) => {
        if (progress.totalBytesExpectedToWrite) {
          onProgress(progress.totalBytesWritten / progress.totalBytesExpectedToWrite);
        }
      }
    );
    await downloadResumable.downloadAsync();
  };

  const handleModelDownload = async () => {
    try {
      setModelStatus('downloading');
      setModelProgress(0);
      const zipPath = FileSystem.documentDirectory + 'phi3-mini.zip';
      await downloadWithProgress(MODEL_ZIP_URL, zipPath, setModelProgress);
      const unzipDir = FileSystem.documentDirectory + 'phi3-model/';
      const unzippedPath = await unzip(zipPath, unzipDir);
      const modelPath = unzippedPath + '/phi3-mini.onnx';
      await saveModelPath(modelPath);
      setModelStatus('installed');
      setModelProgress(1);
      Alert.alert('Success', 'Model downloaded and installed!');
    } catch (e) {
      setModelStatus('available');
      setModelProgress(0);
      Alert.alert('Error', 'Failed to download model. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Profile" 
        subtitle="Manage your account and settings"
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>TB</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Travel Buddy</Text>
              <Text style={styles.profileEmail}>explorer@lehmate.ai</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Moon size={20} color={colors.textLight} />
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={darkMode ? colors.card : colors.muted}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={colors.textLight} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={notifications ? colors.card : colors.muted}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Settings size={20} color={colors.textLight} />
              <Text style={styles.settingText}>General Settings</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offline Downloads</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Download size={20} color={colors.textLight} />
              <Text style={styles.settingText}>Auto-update Content</Text>
            </View>
            <Switch
              value={autoUpdate}
              onValueChange={setAutoUpdate}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={autoUpdate ? colors.card : colors.muted}
            />
          </View>
          
          {downloadData.map((item) => (
            <DownloadItem
              key={item.id}
              name={item.name}
              size={item.size}
              description={item.description}
              status={item.status as any}
              progress={item.progress}
              onPress={() => handleDownloadPress(item)}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <View style={styles.emergencyCard}>
            <Phone size={20} color={colors.error} />
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>Tourist Helpline Ladakh</Text>
              <Text style={styles.emergencyNumber}>+91-1982-252-271</Text>
              <Text style={styles.emergencyDescription}>
                24/7 assistance for tourists in Ladakh region
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Model Status</Text>
          {modelStatus !== 'installed' ? (
            <DownloadItem
              name="Phi-3 Mini (ONNX)"
              size="250MB"
              description="Offline AI model for travel assistance."
              status={modelStatus}
              progress={modelProgress}
              onPress={handleModelDownload}
            />
          ) : (
            <View style={styles.aiStatusCard}>
              <View style={styles.statusIndicator} />
              <View style={styles.aiContent}>
                <Text style={styles.aiTitle}>Phi-3 Mini (ONNX)</Text>
                <Text style={styles.aiDescription}>
                  Installed and ready
                </Text>
                <Text style={styles.aiDetails}>
                  Model size: 250MB • Offline capability: ✓
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <HelpCircle size={20} color={colors.textLight} />
            <Text style={styles.menuText}>Help & Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Shield size={20} color={colors.textLight} />
            <Text style={styles.menuText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.error, marginTop: 16 }]}
            onPress={async () => {
              const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
              await AsyncStorage.removeItem('hasLaunched');
              Alert.alert('Debug', 'Onboarding flag cleared! Navigating to splash.', [
                {
                  text: 'OK',
                  onPress: () => {
                    router.replace('/splash');
                  }
                }
              ]);
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Reset Onboarding (Debug)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: sizes.lg,
    fontFamily: fonts.bold,
    color: colors.text,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: sizes.xl,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: sizes.lg,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: sizes.md,
    fontFamily: fonts.regular,
    color: colors.text,
    marginLeft: spacing.md,
  },
  emergencyCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    ...shadows.small,
  },
  emergencyContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  emergencyTitle: {
    fontSize: sizes.md,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emergencyNumber: {
    fontSize: sizes.lg,
    fontFamily: fonts.bold,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  emergencyDescription: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  aiStatusCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...shadows.small,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    marginTop: 4,
  },
  aiContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  aiTitle: {
    fontSize: sizes.md,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  aiDescription: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  aiDetails: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  menuText: {
    fontSize: sizes.md,
    fontFamily: fonts.regular,
    color: colors.text,
    marginLeft: spacing.md,
  },
});