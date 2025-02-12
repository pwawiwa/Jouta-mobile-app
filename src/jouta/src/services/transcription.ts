import * as FileSystem from 'expo-file-system';

const ASSEMBLY_AI_API_KEY = 'c5546332564f451585a9398b44f75dd3';
const ASSEMBLY_AI_API_URL = 'https://api.assemblyai.com/v2';

export const transcriptionService = {
  async uploadAudio(uri: string): Promise<string> {
    try {
      // Read the audio file as base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Upload to AssemblyAI
      const uploadResponse = await fetch(`${ASSEMBLY_AI_API_URL}/upload`, {
        method: 'POST',
        headers: {
          'authorization': ASSEMBLY_AI_API_KEY,
          'content-type': 'application/json',
        },
        body: base64Audio,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload audio');
      }

      const uploadResult = await uploadResponse.json();
      return uploadResult.upload_url;
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw error;
    }
  },

  async transcribeAudio(audioUrl: string): Promise<string> {
    try {
      // Submit transcription request
      const transcribeResponse = await fetch(`${ASSEMBLY_AI_API_URL}/transcript`, {
        method: 'POST',
        headers: {
          'authorization': ASSEMBLY_AI_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: audioUrl,
          language_code: 'en',
        }),
      });

      if (!transcribeResponse.ok) {
        throw new Error('Failed to submit transcription request');
      }

      const transcribeResult = await transcribeResponse.json();
      const transcriptId = transcribeResult.id;

      // Poll for transcription completion
      while (true) {
        const pollingResponse = await fetch(
          `${ASSEMBLY_AI_API_URL}/transcript/${transcriptId}`,
          {
            headers: {
              'authorization': ASSEMBLY_AI_API_KEY,
            },
          }
        );

        if (!pollingResponse.ok) {
          throw new Error('Failed to poll transcription status');
        }

        const pollingResult = await pollingResponse.json();

        if (pollingResult.status === 'completed') {
          return pollingResult.text;
        } else if (pollingResult.status === 'error') {
          throw new Error('Transcription failed');
        }

        // Wait 1 second before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  },
}; 