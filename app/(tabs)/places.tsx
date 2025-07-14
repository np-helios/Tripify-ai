import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import PlaceCard from '@/components/PlaceCard';
import { colors, fonts, sizes, spacing, borderRadius } from '@/constants/theme';
import { placesData } from '@/data/mockData';

const categories = ['All', 'Lakes', 'Routes', 'Temples'];

export default function PlacesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedPlaces, setSavedPlaces] = useState<number[]>([]);

  const filteredPlaces = selectedCategory === 'All' 
    ? placesData 
    : placesData.filter(place => place.category === selectedCategory);

  const handleSavePlace = (placeId: number) => {
    setSavedPlaces(prev => 
      prev.includes(placeId) 
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId]
    );
  };

  const handlePlacePress = (place: any) => {
    // Navigation logic placeholder (removed verbose log)
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Explore Ladakh" 
        subtitle="Discover amazing destinations"
      />
      
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterChip,
                selectedCategory === category && styles.activeFilterChip,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === category && styles.activeFilterText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredPlaces}
        renderItem={({ item }) => (
          <PlaceCard
            name={item.name}
            description={item.description}
            image={item.image}
            altitude={item.altitude}
            distance={item.distance}
            tags={item.tags}
            onPress={() => handlePlacePress(item)}
            onSave={() => handleSavePlace(item.id)}
            isSaved={savedPlaces.includes(item.id)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filtersContainer: {
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: sizes.sm,
    fontFamily: fonts.medium,
    color: colors.textLight,
  },
  activeFilterText: {
    color: colors.text,
  },
  listContainer: {
    paddingBottom: spacing.xl,
  },
});