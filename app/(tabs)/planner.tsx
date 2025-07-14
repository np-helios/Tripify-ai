import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import StyledButton from '@/components/StyledButton';
import { colors, fonts, sizes, spacing, borderRadius, shadows } from '@/constants/theme';
import { Calendar, MapPin, Plus, Clock, TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface TripDay {
  id: string;
  date: string;
  destinations: string[];
  notes: string;
}

export default function TripPlannerScreen() {
  const [tripName, setTripName] = useState('');
  const [selectedDates, setSelectedDates] = useState({ start: '', end: '' });
  const [tripDays, setTripDays] = useState<TripDay[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const addDestination = (dayId: string, destination: string) => {
    setTripDays(prev => prev.map(day => 
      day.id === dayId 
        ? { ...day, destinations: [...day.destinations, destination] }
        : day
    ));
  };

  const addTripDay = () => {
    const newDay: TripDay = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      destinations: [],
      notes: '',
    };
    setTripDays(prev => [...prev, newDay]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Trip Planner" 
        subtitle="Plan your Ladakh adventure"
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Trip Name (e.g., Ladakh Adventure 2024)"
              placeholderTextColor={colors.muted}
              value={tripName}
              onChangeText={setTripName}
            />
            
            <TouchableOpacity 
              style={styles.dateSelector}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color={colors.primary} />
              <Text style={styles.dateSelectorText}>
                {selectedDates.start && selectedDates.end 
                  ? `${selectedDates.start} - ${selectedDates.end}`
                  : 'Select Travel Dates'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Itinerary</Text>
            <TouchableOpacity onPress={addTripDay} style={styles.addButton}>
              <Plus size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {tripDays.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Start planning your trip by adding days to your itinerary
              </Text>
              <StyledButton
                title="Add First Day"
                onPress={addTripDay}
                style={styles.emptyStateButton}
              />
            </View>
          ) : (
            tripDays.map((day, index) => (
              <View key={day.id} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayTitle}>Day {index + 1}</Text>
                  <Text style={styles.dayDate}>{day.date}</Text>
                </View>

                <View style={styles.destinationsContainer}>
                  {day.destinations.map((destination, destIndex) => (
                    <View key={destIndex} style={styles.destinationItem}>
                      <MapPin size={16} color={colors.primary} />
                      <Text style={styles.destinationText}>{destination}</Text>
                    </View>
                  ))}
                  
                  <TouchableOpacity 
                    style={styles.addDestination}
                    onPress={() => addDestination(day.id, 'New Destination')}
                  >
                    <Plus size={16} color={colors.accent} />
                    <Text style={styles.addDestinationText}>Add Destination</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.notesInput}
                  placeholder="Add notes for this day..."
                  placeholderTextColor={colors.muted}
                  multiline
                  value={day.notes}
                  onChangeText={(text) => 
                    setTripDays(prev => prev.map(d => 
                      d.id === day.id ? { ...d, notes: text } : d
                    ))
                  }
                />
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Reminders</Text>
          <View style={styles.reminderCard}>
            <AlertTriangle size={20} color={colors.warning} />
            <View style={styles.reminderContent}>
              <Text style={styles.reminderTitle}>High Altitude Advisory</Text>
              <Text style={styles.reminderText}>
                Most destinations in Ladakh are above 3,000m. Plan for acclimatization and carry necessary medications.
              </Text>
            </View>
          </View>
          
          <View style={styles.reminderCard}>
            <Clock size={20} color={colors.primary} />
            <View style={styles.reminderContent}>
              <Text style={styles.reminderTitle}>Best Travel Season</Text>
              <Text style={styles.reminderText}>
                May to September is ideal. Check road conditions for high-altitude passes before traveling.
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: sizes.lg,
    fontFamily: fonts.bold,
    color: colors.text,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: sizes.md,
    fontFamily: fonts.regular,
    color: colors.text,
    marginBottom: spacing.md,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dateSelectorText: {
    fontSize: sizes.md,
    fontFamily: fonts.regular,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  addButton: {
    padding: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  emptyStateText: {
    fontSize: sizes.md,
    fontFamily: fonts.regular,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyStateButton: {
    minWidth: 150,
  },
  dayCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dayTitle: {
    fontSize: sizes.md,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  dayDate: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  destinationsContainer: {
    marginBottom: spacing.md,
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  destinationText: {
    fontSize: sizes.md,
    fontFamily: fonts.regular,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  addDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  addDestinationText: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.accent,
    marginLeft: spacing.sm,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.text,
    minHeight: 60,
  },
  reminderCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...shadows.small,
  },
  reminderContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  reminderTitle: {
    fontSize: sizes.md,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reminderText: {
    fontSize: sizes.sm,
    fontFamily: fonts.regular,
    color: colors.textLight,
    lineHeight: sizes.sm * 1.4,
  },
});