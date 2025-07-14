import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { storage, getModelPath, getRagPath } from '@/utils/storage';

export default function SettingsScreen() {
  const [deleting, setDeleting] = useState(false);

  const deleteModelAndRag = async () => {
    setDeleting(true);
    try {
      const modelPath = await getModelPath();
      const ragPath = await getRagPath();
      if (modelPath) await FileSystem.deleteAsync(modelPath, { idempotent: true });
      if (ragPath) await FileSystem.deleteAsync(ragPath, { idempotent: true });
      await storage.removeItem('phi3_model_path');
      await storage.removeItem('rag_json_path');
      Alert.alert('Success', 'Model and knowledge base deleted. Please restart setup.');
    } catch (e) {
      Alert.alert('Error', 'Failed to delete files.');
    }
    setDeleting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Button title={deleting ? 'Deleting...' : 'Delete Model & Knowledge Base'} onPress={deleteModelAndRag} disabled={deleting} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
});
 