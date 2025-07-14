import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts, sizes, spacing, borderRadius, shadows } from '@/constants/theme';
import { MapPin, Navigation, Gauge, Mountain } from 'lucide-react-native';

interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

interface LocationCardProps {
  location: LocationData;
  isTracking: boolean;
  onToggleTracking: () => void;
}

export default function LocationCard({ location, isTracking, onToggleTracking }: LocationCardProps) {
  const formatCoordinate = (coord: number, isLatitude: boolean) => {
    const direction = isLatitude ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
    return `${Math.abs(coord).toFixed(6)}° ${direction}`;
  };

  const formatSpeed = (speed?: number) => {
    if (!speed) return '0 km/h';
    return `${(speed * 3.6).toFixed(1)} km/h`;
  };

  const formatAltitude = (altitude?: number) => {
    if (!altitude) return 'Unknown';
    return `${Math.round(altitude)}m`;
  };

  const formatAccuracy = (accuracy?: number) => {
    if (!accuracy) return 'Unknown';
    return `±${Math.round(accuracy)}m`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MapPin size={20} color={colors.primary} />
          <Text style={styles.title}>Current Location</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.trackingButton, isTracking && styles.trackingButtonActive]}
          onPress={onToggleTracking}
        >
          <Navigation size={16} color={isTracking ? colors.card : colors.primary} />
          <Text style={[styles.trackingText, isTracking && styles.trackingTextActive]}>
            {isTracking ? 'Tracking' : 'Track'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.coordinatesContainer}>
        <Text style={styles.coordinate}>
          {formatCoordinate(location.latitude, true)}
        </Text>
        <Text style={styles.coordinate}>
          {formatCoordinate(location.longitude, false)}
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Mountain size={16} color={colors.textLight} />
          <Text style={styles.detailLabel}>Altitude</Text>
          <Text style={styles.detailValue}>{formatAltitude(location.altitude)}</Text>
        </View>

        <View style={styles.detailItem}>
          <Gauge size={16} color={colors.textLight} />
          <Text style={styles.detailLabel}>Speed</Text>
          <Text style={styles.detailValue}>{formatSpeed(location.speed)}</Text>
        </View>

        <View style={styles.detailItem}>
          <MapPin size={16} color={colors.textLight} />
          <Text style={styles.detailLabel}>Accuracy</Text>
          <Text style={styles.detailValue}>{formatAccuracy(location.accuracy)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: sizes.md,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  trackingButtonActive: {
    backgroundColor: colors.primary,
  },
  trackingText: {
    fontSize: sizes.sm,
    fontFamily: fonts.medium,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  trackingTextActive: {
    color: colors.card,
  },
  coordinatesContainer: {
    marginBottom: spacing.md,
  },
  coordinate: {
    fontSize: sizes.md,
    fontFamily: fonts.regular,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: sizes.xs,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: sizes.sm,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
});