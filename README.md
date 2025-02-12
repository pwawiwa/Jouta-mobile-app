# Jouta Mobile App

A daily journaling and task management app that uses voice and text to record your thoughts and tasks.

## Current Status

The app is currently in development with the following features:

### Working Features
- ✅ Voice recording interface
- ✅ Task and Journal creation
- ✅ Local storage for tasks and journals
- ✅ Calendar view with task management
- ✅ Dark theme with glassmorphism UI
- ✅ Task priority management
- ✅ Due date selection for tasks

### Work in Progress
- ⚠️ Voice to text transcription (AssemblyAI integration needs fixing)
- ⏳ Project structure and dependencies setup
- ⏳ Development server configuration

### Known Issues
1. Audio transcription is not working yet due to:
   - AssemblyAI API integration needs debugging
   - Audio file format compatibility needs verification
   - Project structure needs reorganization

2. Development environment setup:
   - Need to fix package.json location
   - Dependencies need proper organization

## Planned Features
- AI analysis of notes and tasks
- Reminder system for daily journals and tasks
- Time capsule notes
- Cloud synchronization

## Tech Stack
- React Native with TypeScript
- Expo
- AssemblyAI for voice transcription
- AsyncStorage for local data persistence

## Setup Instructions
(Coming soon)

## Project Structure
```
jouta/
├── src/
│   ├── screens/          # Screen components
│   ├── components/       # Reusable components
│   ├── services/         # Business logic and API services
│   ├── utils/           # Helper functions and utilities
│   ├── hooks/           # Custom React hooks
│   ├── constants/       # App constants and configuration
│   ├── assets/          # Images, fonts, and other static files
│   └── types/           # TypeScript type definitions
├── App.tsx              # Root component
└── package.json         # Dependencies and scripts
``` 