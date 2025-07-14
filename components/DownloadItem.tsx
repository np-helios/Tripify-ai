import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts, sizes, spacing, borderRadius, shadows } from '@/constants/theme';
import { Download, CircleCheck as CheckCircle, Loader, Play } from 'lucide-react-native';

interface DownloadItemProps {
  name: string;
  size: string;
  description: string;
  status: 'available' | 'downloading' | 'installed';
  progress?: number;
  onPress: () => void;
}

export default function DownloadItem({ 
  name, 
  size, 
  description, 
  status, 
  progress = 0,
  onPress 
}: DownloadItemProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'installed':
        return <CheckCircle size={24} color={colors.success} />;
      case 'downloading':
        return <Loader size={24} color={colors.primary} />;
      default:
        return <Download size={24} color={colors.accent} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'installed':
        return 'Installed';
      case 'downloading':
        return `${Math.round(progress * 100)}%`;
      default:
        return 'Download';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        {getStatusIcon()}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.size}>{size}</Text>
        </View>
        <Text style={styles.description}>{description}</Text>
        
        {status === 'downloading' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.actionContainer}>
        <Text style={[styles.statusText, { color: status === 'installed' ? colors.success : colors.accent }]}>
          {getStatusText()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: sizes.md,
    fontFamily: fonts.semiBold,
    color: colors.text,
    flex: 1,
  },
  size: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  description: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  actionContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: sizes.sm,
    fontFamily: fonts.medium,
  },
});