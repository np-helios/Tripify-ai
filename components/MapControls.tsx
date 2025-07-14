import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/constants/theme';
import { Layers, MapPin, Search, Crosshair } from 'lucide-react-native';

interface MapControlsProps {
  mapType: 'satellite' | 'terrain' | 'offline';
  onMapTypeChange: (type: 'satellite' | 'terrain' | 'offline') => void;
  onLocationPress: () => void;
  onSearchPress: () => void;
}

export default function MapControls({ 
  mapType, 
  onMapTypeChange, 
  onLocationPress, 
  onSearchPress 
}: MapControlsProps) {
  return (
    <>
      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.controlButton} onPress={onSearchPress}>
          <Search size={20} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => {
            const types: ('satellite' | 'terrain' | 'offline')[] = ['terrain', 'satellite', 'offline'];
            const currentIndex = types.indexOf(mapType);
            const nextIndex = (currentIndex + 1) % types.length;
            onMapTypeChange(types[nextIndex]);
          }}
        >
          <Layers size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.locationButton} onPress={onLocationPress}>
          <Crosshair size={24} color={colors.card} />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topControls: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'column',
  },
  bottomControls: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
  },
  controlButton: {
    backgroundColor: colors.card,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  locationButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 30,
    ...shadows.medium,
  },
});