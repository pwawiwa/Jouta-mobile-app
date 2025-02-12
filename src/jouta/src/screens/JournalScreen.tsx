import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storage, type Journal } from '../services/storage';

type RootStackParamList = {
  Journal: { text: string };
};

type JournalScreenRouteProp = RouteProp<RootStackParamList, 'Journal'>;

export default function JournalScreen() {
  const route = useRoute<JournalScreenRouteProp>();
  const navigation = useNavigation();
  const [journalText, setJournalText] = useState(route.params.text);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!journalText.trim()) {
      Alert.alert('Error', 'Journal text cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const newJournal: Journal = {
        id: Date.now().toString(), // Simple ID generation
        text: journalText.trim(),
        createdAt: new Date().toISOString(),
      };

      await storage.addJournal(newJournal);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving journal:', error);
      Alert.alert('Error', 'Failed to save journal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <TextInput
          style={styles.input}
          value={journalText}
          onChangeText={setJournalText}
          multiline
          placeholder="Write your thoughts..."
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="close" size={24} color="white" />
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <MaterialCommunityIcons 
              name={isSaving ? 'loading' : 'check'} 
              size={24} 
              color="white" 
            />
            <Text style={styles.buttonText}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    marginTop: 60,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    textAlignVertical: 'top',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    flex: 0.48,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
}); 