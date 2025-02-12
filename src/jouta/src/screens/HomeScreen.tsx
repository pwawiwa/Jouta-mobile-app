import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { transcriptionService } from '../services/transcription';

type RootStackParamList = {
  Home: undefined;
  Journal: { text: string };
  Task: { text: string };
  Calendar: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isJournalMode, setIsJournalMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const startRecording = async () => {
    try {
      // Request permissions
      const permissionResponse = await Audio.requestPermissionsAsync();
      if (permissionResponse.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone access to record audio.');
        return;
      }

      // Configure audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setIsProcessing(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (!uri) {
        throw new Error('No recording URI available');
      }

      // Upload and transcribe the audio
      const uploadUrl = await transcriptionService.uploadAudio(uri);
      const transcribedText = await transcriptionService.transcribeAudio(uploadUrl);

      // Navigate to appropriate screen with transcribed text
      if (isJournalMode) {
        navigation.navigate('Journal', { text: transcribedText });
      } else {
        navigation.navigate('Task', { text: transcribedText });
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      Alert.alert('Error', 'Failed to process recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.modeContainer}>
        <Text style={styles.modeText}>Task</Text>
        <Switch
          value={isJournalMode}
          onValueChange={setIsJournalMode}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isJournalMode ? '#f5dd4b' : '#f4f3f4'}
        />
        <Text style={styles.modeText}>Journal</Text>
      </View>

      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recording]}
        onPress={toggleRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <MaterialCommunityIcons
            name={isRecording ? 'stop-circle' : 'microphone'}
            size={64}
            color="white"
          />
        )}
      </TouchableOpacity>

      {isProcessing && (
        <Text style={styles.processingText}>
          Processing your recording...
        </Text>
      )}

      <TouchableOpacity
        style={styles.calendarButton}
        onPress={() => navigation.navigate('Calendar')}
      >
        <MaterialCommunityIcons name="calendar" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  modeText: {
    color: 'white',
    marginHorizontal: 10,
    fontSize: 16,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  recording: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderColor: '#ff0000',
  },
  processingText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
  },
  calendarButton: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 