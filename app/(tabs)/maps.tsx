import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import MapControls from '@/components/MapControls';
import LocationCard from '@/components/LocationCard';
import { colors, fonts, sizes, spacing, borderRadius, shadows } from '@/constants/theme';
import { Navigation, MapPin, Download, Compass, Layers, Search } from 'lucide-react-native';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

interface MapRegion {
  name: string;
  size: string;
  downloaded: boolean;
  downloadProgress?: number;
}

export default function MapsScreen() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'satellite' | 'terrain' | 'offline'>('terrain');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [offlineRegions, setOfflineRegions] = useState<MapRegion[]>([
    { name: 'Leh City', size: '25MB', downloaded: true },
    { name: 'Nubra Valley', size: '45MB', downloaded: false },
    { name: 'Pangong Lake Route', size: '35MB', downloaded: true },
    { name: 'Khardung La Pass', size: '20MB', downloaded: false },
    { name: 'Tso Moriri Lake', size: '40MB', downloaded: false, downloadProgress: 0.6 },
  ]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to use GPS navigation features.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      if (!locationPermission) return;
      
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        altitude: currentLocation.coords.altitude || undefined,
        accuracy: currentLocation.coords.accuracy || undefined,
        heading: currentLocation.coords.heading || undefined,
        speed: currentLocation.coords.speed || undefined,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Location Error', 'Unable to get current location. Please try again.');
    }
  };

  const startNavigation = (destination: string) => {
    if (!location) {
      Alert.alert('GPS Required', 'Please enable GPS to start navigation.');
      return;
    }
    
    setSelectedDestination(destination);
    setIsTracking(true);
    
    // In a real app, this would start turn-by-turn navigation
    Alert.alert(
      'Navigation Started',
      `Starting navigation to ${destination}. Make sure you have the offline map downloaded for this area.`,
      [{ text: 'OK' }]
    );
  };

  const downloadOfflineMap = (regionName: string) => {
    setOfflineRegions(prev => prev.map(region => 
      region.name === regionName 
        ? { ...region, downloadProgress: 0 }
        : region
    ));

    // Simulate download progress
    const interval = setInterval(() => {
      setOfflineRegions(prev => prev.map(region => {
        if (region.name === regionName && region.downloadProgress !== undefined) {
          const newProgress = region.downloadProgress + 0.1;
          if (newProgress >= 1) {
            clearInterval(interval);
            return { ...region, downloaded: true, downloadProgress: undefined };
          }
          return { ...region, downloadProgress: newProgress };
        }
        return region;
      }));
    }, 500);
  };

  const popularDestinations = [
    { name: 'Pangong Lake', distance: '160km', time: '4h 30m' },
    { name: 'Nubra Valley', distance: '120km', time: '3h 45m' },
    { name: 'Tso Moriri Lake', distance: '240km', time: '6h 15m' },
    { name: 'Khardung La Pass', distance: '40km', time: '1h 30m' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Offline Maps & GPS" 
        subtitle="Navigate Ladakh with confidence"
      />
      
      {/* Map View Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Compass size={48} color={colors.primary} />
          <Text style={styles.mapPlaceholderText}>
            {location ? 'GPS Signal Active' : 'Searching for GPS...'}
          </Text>
          {location && (
            <Text style={styles.coordinatesText}>
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
          )}
        </View>
        
        {/* Map Controls Overlay */}
        <MapControls
          mapType={mapType}
          onMapTypeChange={setMapType}
          onLocationPress={getCurrentLocation}
          onSearchPress={() => console.log('Search pressed')}
        />
      </View>

      {/* Current Location Card */}
      {location && (
        <LocationCard
          location={location}
          isTracking={isTracking}
          onToggleTracking={() => setIsTracking(!isTracking)}
        />
      )}

      {/* Quick Navigation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Navigation</Text>
        {popularDestinations.map((destination, index) => (
          <TouchableOpacity
            key={index}
            style={styles.destinationCard}
            onPress={() => startNavigation(destination.name)}
          >
            <View style={styles.destinationInfo}>
              <Text style={styles.destinationName}>{destination.name}</Text>
              <Text style={styles.destinationDetails}>
                {destination.distance} • {destination.time}
              </Text>
            </View>
            <Navigation size={20} color={colors.primary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Offline Maps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offline Map Regions</Text>
        {offlineRegions.map((region, index) => (
          <View key={index} style={styles.regionCard}>
            <View style={styles.regionInfo}>
              <Text style={styles.regionName}>{region.name}</Text>
              <Text style={styles.regionSize}>{region.size}</Text>
            </View>
            
            {region.downloaded ? (
              <View style={styles.downloadedBadge}>
                <Text style={styles.downloadedText}>Downloaded</Text>
              </View>
            ) : region.downloadProgress !== undefined ? (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${region.downloadProgress * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(region.downloadProgress * 100)}%
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => downloadOfflineMap(region.name)}
              >
                <Download size={16} color={colors.accent} />
                <Text style={styles.downloadButtonText}>Download</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    height: 300,
    backgroundColor: colors.card,
    margin: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.medium,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  mapPlaceholderText: {
    fontSize: sizes.md,
    fontFamily: fonts.medium,
    color: colors.text,
    marginTop: spacing.sm,
  },
  coordinatesText: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: sizes.lg,
    fontFamily: fonts.bold,
    color: colors.text,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  destinationCard: {
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
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: sizes.md,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  destinationDetails: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  regionCard: {
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
  regionInfo: {
    flex: 1,
  },
  regionName: {
    fontSize: sizes.md,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  regionSize: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  downloadedBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  downloadedText: {
    fontSize: sizes.sm,
    fontFamily: fonts.medium,
    color: colors.success,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  downloadButtonText: {
    fontSize: sizes.sm,
    fontFamily: fonts.medium,
    color: colors.accent,
    marginLeft: spacing.xs,
  },
  progressContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: sizes.xs,
    fontFamily: fonts.medium,
    color: colors.textLight,
  },
});