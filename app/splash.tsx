import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import GradientBackground from '@/components/GradientBackground';
import { colors, fonts, sizes, spacing } from '@/constants/theme';
import { isFirstLaunch } from '@/utils/storage';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(async () => {
      const isFirst = await isFirstLaunch();
      if (isFirst) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <GradientBackground style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🏔️</Text>
          <Text style={styles.appName}>LehMate AI</Text>
          <Text style={styles.tagline}>Your Offline AI Travel Companion for Ladakh</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.loadingText}>Loading your adventure...</Text>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: sizes.xxxl,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: sizes.md,
    fontFamily: fonts.regular,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: sizes.md * 1.4,
  },
  footer: {
    paddingBottom: spacing.xxl,
  },
  loadingText: {
    fontSize: sizes.sm,
    fontFamily: fonts.medium,
    color: colors.textLight,
  },
});