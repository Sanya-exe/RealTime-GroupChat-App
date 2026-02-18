# 💬 Real-Time Group Chat Application

A modern, feature-rich real-time chat application built with React, Node.js, Socket.IO, and MongoDB. Features dynamic room creation, AI-powered summarization, and WhatsApp-style messaging with advanced functionality.

## ✨ Features

### 🔐 Room Management
- **Dynamic Room Creation** - Generate unique 8-character room codes
- **Join Existing Rooms** - Join any room with a valid code
- **Room Isolation** - Messages are private to each room
- **Room Code Sharing** - Easy copy-to-clipboard functionality
- **Multiple Concurrent Rooms** - Support for unlimited simultaneous rooms

### 💬 Real-Time Messaging
- **Instant Message Delivery** - WebSocket-powered real-time communication
- **Typing Indicators** - See when others are typing
- **Message Status** - Sent (✓), Delivered (✓✓), Seen (✓✓ blue)
- **Auto-Scroll** - Automatically scroll to latest messages
- **Message Timestamps** - Time-based message organization

### ✏️ Message Management
- **Edit Messages** - Edit sent messages with "edited" label
- **Delete Options**:
  - Delete for me (hides from your view)
  - Delete for everyone (removes for all users)
- **Message Persistence** - All messages stored in MongoDB

### 🤖 AI-Powered Features
- **Smart Summarization** - Click "✨ AI Summary" to get instant conversation summaries
- **Intelligent Analysis** - AI understands context and extracts key points
- **Hugging Face Integration** - Powered by state-of-the-art NLP models
- **Fallback System** - Custom summary generation when AI is unavailable
- **One-Click Summary** - Summarize last 50 messages instantly

### 🎨 User Experience
- **Clean WhatsApp-style UI** - Familiar, intuitive interface
- **User Color Coding** - Each user gets a unique, consistent color
- **Click Outside to Close** - Polished UX interactions
- **Responsive Design** - Works on desktop and mobile
- **Modular Architecture** - Clean, maintainable code structure

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework with hooks
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool and dev server
- **Custom Hooks** - `useTypingIndicator`, `useMessageSeen`, `useAutoScroll`, `useClickOutside`

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.IO** - WebSocket implementation
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Hugging Face API** - AI-powered summarization

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Hugging Face API token (free - get from https://huggingface.co/settings/tokens)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/RealTime-GroupChat-App.git
cd RealTime-GroupChat-App
```

### 2. Backend Setup

Navigate to backend folder:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Start the backend server:
```bash
node server.js
```

### 3. Frontend Setup

Open a **new terminal** and navigate to frontend folder:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the frontend development server:
```bash
npm run dev
