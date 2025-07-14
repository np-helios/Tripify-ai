import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, fonts, sizes, spacing, borderRadius, shadows } from '@/constants/theme';
import { MapPin, Mountain, Heart } from 'lucide-react-native';

interface PlaceCardProps {
  name: string;
  description: string;
  image: string;
  altitude: string;
  distance: string;
  tags: string[];
  onPress: () => void;
  onSave: () => void;
  isSaved?: boolean;
}

export default function PlaceCard({ 
  name, 
  description, 
  image, 
  altitude, 
  distance, 
  tags, 
  onPress, 
  onSave,
  isSaved = false 
}: PlaceCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: image }} style={styles.image} />
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={onSave}
        activeOpacity={0.8}
      >
        <Heart 
          size={20} 
          color={isSaved ? colors.error : colors.card} 
          fill={isSaved ? colors.error : 'transparent'}
        />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Mountain size={14} color={colors.textLight} />
            <Text style={styles.infoText}>{altitude}</Text>
          </View>
          <View style={styles.infoItem}>
            <MapPin size={14} color={colors.textLight} />
            <Text style={styles.infoText}>{distance}</Text>
          </View>
        </View>
        
        <View style={styles.tagsContainer}>
          {tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    margin: spacing.sm,
    ...shadows.medium,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  saveButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: spacing.sm,
  },
  content: {
    padding: spacing.md,
  },
  name: {
    fontSize: sizes.lg,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: sizes.xs,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    fontSize: sizes.xs,
    fontFamily: fonts.medium,
    color: colors.primary,
  },
});