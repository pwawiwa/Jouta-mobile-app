import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storage, type Task } from '../services/storage';

type RootStackParamList = {
  Task: { text: string };
};

type TaskScreenRouteProp = RouteProp<RootStackParamList, 'Task'>;

export default function TaskScreen() {
  const route = useRoute<TaskScreenRouteProp>();
  const navigation = useNavigation();
  const [taskText, setTaskText] = useState(route.params.text);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!taskText.trim()) {
      Alert.alert('Error', 'Task text cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const newTask: Task = {
        id: Date.now().toString(), // Simple ID generation
        text: taskText.trim(),
        dueDate: dueDate.toISOString(),
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      await storage.addTask(newTask);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const hideDatePicker = () => {
    setShowDatePicker(false);
  };

  const handleDateConfirm = (date: Date) => {
    setDueDate(date);
    hideDatePicker();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView style={styles.contentContainer}>
        <TextInput
          style={styles.input}
          value={taskText}
          onChangeText={setTaskText}
          multiline
          placeholder="What needs to be done?"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
        />

        <TouchableOpacity
          style={styles.dateButton}
          onPress={showDatePickerModal}
        >
          <MaterialCommunityIcons name="calendar" size={24} color="white" />
          <Text style={styles.dateText}>
            Due: {dueDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <Modal
            transparent={true}
            visible={showDatePicker}
            onRequestClose={hideDatePicker}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Due Date</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    const date = new Date();
                    handleDateConfirm(date);
                  }}
                >
                  <Text style={styles.modalButtonText}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    const date = new Date();
                    date.setDate(date.getDate() + 1);
                    handleDateConfirm(date);
                  }}
                >
                  <Text style={styles.modalButtonText}>Tomorrow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    const date = new Date();
                    date.setDate(date.getDate() + 7);
                    handleDateConfirm(date);
                  }}
                >
                  <Text style={styles.modalButtonText}>Next Week</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={hideDatePicker}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        <View style={styles.priorityContainer}>
          <Text style={styles.priorityLabel}>Priority:</Text>
          <View style={styles.priorityButtons}>
            {(['low', 'medium', 'high'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  priority === p && styles.priorityButtonSelected,
                ]}
                onPress={() => setPriority(p)}
              >
                <Text style={[
                  styles.priorityButtonText,
                  priority === p && styles.priorityButtonTextSelected,
                ]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
      </ScrollView>
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
    color: 'white',
    fontSize: 18,
    textAlignVertical: 'top',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    minHeight: 100,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  dateText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  priorityContainer: {
    marginBottom: 20,
  },
  priorityLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  priorityButtonSelected: {
    backgroundColor: '#007AFF',
  },
  priorityButtonText: {
    color: 'white',
    fontSize: 14,
  },
  priorityButtonTextSelected: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
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