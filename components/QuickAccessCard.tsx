import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts, sizes, spacing, borderRadius, shadows } from '@/constants/theme';
import { MessageCircle, MapPin, Calendar, Download, Map } from 'lucide-react-native';

interface QuickAccessCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  color: string;
  type: 'chat' | 'places' | 'planner' | 'downloads' | 'maps';
}

const iconMap = {
  chat: MessageCircle,
  places: MapPin,
  planner: Calendar,
  downloads: Download,
  maps: Map,
};

export default function QuickAccessCard({ title, subtitle, onPress, color, type }: QuickAccessCardProps) {
  const IconComponent = iconMap[type];
  
  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: color + '20' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <IconComponent size={24} color={colors.card} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.md,
    margin: spacing.xs,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    minHeight: 120,
    ...shadows.small,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: sizes.md,
    fontFamily: fonts.semiBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
    textAlign: 'center',
  },
});