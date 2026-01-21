# AI Agents - React Native AI Chat Application

A powerful React Native mobile application that enables users to chat with various AI language models directly on their devices. Built with Expo and leveraging on-device AI capabilities through Llama models, this app provides a seamless, private, and offline-capable AI conversation experience.

![Demo](assets/images/ai-rn-new.gif)

## 🚀 Features

### Core Capabilities
- **Multiple AI Models**: Browse and select from a variety of AI language models
- **On-Device Processing**: Run AI models locally on your device for complete privacy
- **Real-time Streaming**: Experience real-time AI responses with streaming text output
- **Conversation History**: Automatically save and restore conversation history per model
- **Context Awareness**: Toggle conversation history to enable or disable context-aware responses
- **Model Management**: Download, manage, and remove AI models directly from the app

### User Experience
- **Welcome Screen**: Browse available AI models fetched from CMS API with pull-to-refresh
- **Model Selection**: Sort models by size and easily navigate to chat with your chosen model
- **Chat Interface**: Clean, modern chat UI with message bubbles, keyboard handling, and smooth scrolling
- **Model Details**: View detailed information about each model including name, size, and status
- **Conversation Management**: Clear conversations or remove models with simple actions

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **AI Engine**: `@react-native-ai/llama` for on-device AI model execution
- **AI SDK**: `ai` package for streaming text generation
- **Navigation**: React Navigation with native stack navigator
- **State Management**: React Hooks (useState, useCallback, useMemo)
- **Storage**: `react-native-mmkv` for fast, persistent local storage
- **UI Components**: Custom themed components with support for dark/light modes
- **Keyboard Handling**: `react-native-keyboard-controller` for smooth keyboard interactions
- **Bottom Sheets**: `@gorhom/bottom-sheet` for modal interactions

## 📋 Prerequisites

- Node.js >= 20.0.0
- Yarn or npm
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)
- EAS Build account (for building native apps)

## 🏃 Getting Started

### Installation

```bash
# Install dependencies
yarn install

yarn prebuild

# Start the development server
yarn start
```

### Building for Development

To run the app on a simulator or physical device, you need to build it first using EAS Build:

```bash
# Build for iOS Simulator
yarn build:ios:sim

# Build for iOS Device
yarn build:ios:device

# Build for Android Emulator
yarn build:android:sim

# Build for Android Device
yarn build:android:device
```

### Running on Device

```bash
# iOS
yarn ios

# Android
yarn android
```

## 📱 Usage

1. **Browse Models**: On the welcome screen, browse available AI models fetched from the CMS API
2. **Select Model**: Tap on any model to navigate to the chat screen
3. **Download Model**: If the model isn't installed, tap "Download AI Model" to download and prepare it
4. **Start Chatting**: Once the model is ready, start chatting with the AI
5. **Manage Conversations**: 
   - Toggle conversation history on/off using the checkbox
   - Clear conversation from the model details sheet
   - Remove models when no longer needed

## 🏗️ Project Structure

```
app/
├── screens/
│   ├── ai/
│   │   ├── components/        # Chat UI components
│   │   ├── hooks/             # AI chat logic and model management
│   │   └── AiScreen.tsx       # Main chat screen
│   └── WelcomeScreen/         # Model selection screen
├── components/                # Reusable UI components
├── navigators/                # Navigation configuration
├── services/                  # API services
├── theme/                     # Theming system
└── utils/                     # Utility functions
```

## 🔧 Configuration

The app uses environment-specific configuration files:
- `app/config/config.dev.ts` - Development configuration
- `app/config/config.prod.ts` - Production configuration

Configure your API endpoints in these files for fetching AI models.

## 📚 Adding Models from Hugging Face

The app supports fetching GGUF models from Hugging Face. You can browse and discover models at:

**Hugging Face GGUF Models**: https://huggingface.co/models?library=gguf

### How to Get Model Information

1. **Browse Models**: Visit the Hugging Face models page filtered by `library=gguf`
2. **Select a Model**: Click on any model that interests you
3. **Get Model ID**: The model ID format is `author/model-name` (e.g., `bartowski/Llama-3.2-3B-Instruct-GGUF`)
4. **Find GGUF Files**: Navigate to the "Files and versions" tab to see available GGUF files
5. **Get File Information**:
   - File name: The `.gguf` filename (e.g., `Llama-3.2-3B-Instruct-Q3_K_L.gguf`)
   - File size: Displayed next to each file
   - Full model ID: `author/model-name/filename.gguf` (e.g., `bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q3_K_L.gguf`)

### Model ID Format

The app uses the full model path as the model ID:
```
{author}/{model-repo}/{filename.gguf}
```

Example:
- Model ID: `bartowski/Llama-3.2-3B-Instruct-GGUF/Llama-3.2-3B-Instruct-Q3_K_L.gguf`
- Display Name: `Llama-3.2-3B-Instruct-Q3_K_L.gguf`
- Size: `1.91GB`

## 📝 Key Features Explained

### Model Management
- Models are downloaded and stored locally on the device
- Each model can be independently managed (downloaded, removed)
- Model status is tracked (not_setup, downloading, preparing, ready)

### Conversation History
- Conversations are automatically saved per model
- History persists across app restarts
- Users can clear conversations without removing the model
- Context history can be toggled on/off for each conversation

### Streaming Responses
- AI responses stream in real-time for better UX
- Text updates incrementally as the AI generates responses
- Smooth scrolling ensures new messages are always visible

## 🧪 Testing

```bash
# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run Maestro end-to-end tests
yarn test:maestro
```

## 📦 Building for Production

```bash
# iOS Production Build
yarn build:ios:prod

# Android Production Build
yarn build:android:prod
```

## 🤝 Contributing

This project is built on the Ignite boilerplate. For more information:
- [Ignite Documentation](https://github.com/infinitered/ignite)
- [Ignite Cookbook](https://ignitecookbook.com/)

## 📄 License

Private project - All rights reserved

## 🙏 Acknowledgments

- Built with [Ignite](https://github.com/infinitered/ignite) boilerplate
- AI capabilities powered by [@react-native-ai/llama](https://github.com/react-native-ai/llama)
- UI components and theming inspired by modern mobile design patterns
