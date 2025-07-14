import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, sizes, spacing } from '@/constants/theme';
import { ChevronLeft, Bell } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
  subtitle?: string;
}

export default function Header({ 
  title, 
  showBack = false, 
  showNotifications = false,
  onBackPress,
  onNotificationPress,
  subtitle
}: HeaderProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
              <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          <View style={styles.titleContainer}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        
        {showNotifications && (
          <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
            <Bell size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconButton: {
    padding: spacing.sm,
    marginRight: spacing.xs,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: sizes.lg,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginTop: 2,
  },
});