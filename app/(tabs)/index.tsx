import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Header from '@/components/Header';
import QuickAccessCard from '@/components/QuickAccessCard';
import { colors, fonts, sizes, spacing, borderRadius, shadows } from '@/constants/theme';

export default function HomeScreen() {
  const handleQuickAccess = (route: string) => {
    switch (route) {
      case '/chat':
        router.push('/(tabs)/chat');
        break;
      case '/maps':
        router.push('/(tabs)/maps');
        break;
      case '/places':
        router.push('/(tabs)/places');
        break;
      case '/planner':
        router.push('/(tabs)/planner');
        break;
      case '/downloads':
        router.push('/(tabs)/profile');
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Namaste, Explorer! 👋" 
        subtitle="Ready for your Ladakh adventure?"
        showNotifications
        onNotificationPress={() => console.log('Notifications')}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            <QuickAccessCard
              title="Ask AI"
              subtitle="Travel questions & tips"
              onPress={() => handleQuickAccess('/chat')}
              color={colors.primary}
              type="chat"
            />
            <QuickAccessCard
              title="GPS Maps"
              subtitle="Offline navigation"
              onPress={() => handleQuickAccess('/maps')}
              color="#4CAF50"
              type="maps"
            />
          </View>
          <View style={styles.quickAccessGrid}>
            <QuickAccessCard
              title="Explore Places"
              subtitle="Discover destinations"
              onPress={() => handleQuickAccess('/places')}
              color={colors.accent}
              type="places"
            />
            <QuickAccessCard
              title="Plan Trip"
              subtitle="Create itineraries"
              onPress={() => handleQuickAccess('/planner')}
              color="#FF9800"
              type="planner"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Weather in Leh</Text>
          <View style={styles.weatherCard}>
            <View style={styles.weatherHeader}>
              <Text style={styles.weatherTemp}>18°C</Text>
              <Text style={styles.weatherIcon}>☀️</Text>
            </View>
            <Text style={styles.weatherDesc}>Clear skies, perfect for sightseeing!</Text>
            <Text style={styles.weatherDetails}>Humidity: 45% • Wind: 12 km/h</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Altitude Acclimatization</Text>
              <Text style={styles.tipText}>
                Take it easy on your first day in Leh. Drink plenty of water and avoid strenuous activities.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GPS & Navigation</Text>
          <View style={styles.gpsCard}>
            <Text style={styles.gpsIcon}>🗺️</Text>
            <View style={styles.gpsContent}>
              <Text style={styles.gpsTitle}>Offline Maps Available</Text>
              <Text style={styles.gpsText}>
                Download offline maps for reliable navigation in remote areas. GPS works even without internet!
              </Text>
            </View>
          </View>
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
  quickAccessGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
  },
  weatherCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  weatherTemp: {
    fontSize: sizes.xxxl,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  weatherIcon: {
    fontSize: 40,
  },
  weatherDesc: {
    fontSize: sizes.md,
    fontFamily: fonts.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  weatherDetails: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  tipCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...shadows.small,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: sizes.md,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
    lineHeight: sizes.sm * 1.4,
  },
  gpsCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    ...shadows.small,
  },
  gpsIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  gpsContent: {
    flex: 1,
  },
  gpsTitle: {
    fontSize: sizes.md,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  gpsText: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
    lineHeight: sizes.sm * 1.4,
  },
});