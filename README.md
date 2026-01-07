# 🤖 JARVIS Voice Assistant v3

A voice-first AI assistant with hybrid routing - 95% FREE models, Claude fallback for critical tasks.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    JARVIS Voice Assistant v3                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │   Frontend  │────▶│   Backend   │────▶│    n8n      │   │
│  │  Next.js 15 │◀────│   Express   │◀────│  Workflow   │   │
│  │  Port 3000  │     │  Port 5000  │     │             │   │
│  └─────────────┘     └─────────────┘     └─────────────┘   │
│         │                   │                   │           │
│         │                   │                   ▼           │
│         │                   │          ┌─────────────┐      │
│         │                   │          │  Groq LLM   │      │
│         │                   │          │ llama-3.1   │      │
│         │                   │          │   (FREE)    │      │
│         │                   │          └─────────────┘      │
│         │                   │                               │
│         ▼                   ▼                               │
│  ┌─────────────┐     ┌─────────────┐                       │
│  │    Voice    │     │  PostgreSQL │                       │
│  │  STT + TTS  │     │   Memory    │                       │
│  └─────────────┘     └─────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Features

- 💬 **Chat Interface** - Minimalist text chat with markdown support
- 🎤 **Voice Input** - Groq Whisper STT (speech-to-text)
- 🔊 **Voice Output** - Kokoro TTS (text-to-speech)
- ⚡ **Real-time** - WebSocket streaming via Socket.io
- 🧠 **LLM** - Groq llama-3.1-8b-instant (FREE tier)
- 💾 **Memory** - PostgreSQL conversation history
- 🌙 **Dark Theme** - Professional glassmorphism design

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Express 5, Socket.io, TypeScript |
| LLM | Groq llama-3.1-8b-instant (FREE) |
| STT | Groq Whisper API (FREE) |
| TTS | Kokoro FastAPI (local, FREE) |
| Database | PostgreSQL |
| Orchestration | n8n (self-hosted) |

## Quick Start

### 1. Prerequisites

- Node.js 20+
- PostgreSQL (optional, for memory)
- n8n running at https://n8n.lldonha.com
- Groq API key (free at https://console.groq.com)

### 2. Setup Database (Optional)

```bash
# Run the schema
psql -U postgres -d jarvis -f database/schema.sql
```

### 3. Start Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your GROQ_API_KEY

npm install
npm run dev  # http://localhost:5000
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

### 5. Activate n8n Workflow

1. Open https://n8n.lldonha.com
2. Find workflow "JARVIS Voice Assistant v3"
3. Configure Groq credentials
4. Activate the workflow

## Environment Variables

**Backend (.env):**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Required
GROQ_API_KEY=your_groq_api_key
N8N_WEBHOOK_URL=https://n8n.lldonha.com/webhook/jarvis-chat

# Optional
TTS_PROVIDER=edge
KOKORO_URL=http://localhost:8880
```

## Project Structure

```
E:/jarvis-voice/
├── frontend/               # Next.js 15 frontend
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   ├── VoiceInterface.tsx
│   │   ├── AudioPlayer.tsx
│   │   └── LoadingIndicator.tsx
│   └── lib/               # Utilities and types
├── backend/               # Express backend
│   └── src/
│       ├── routes/        # API endpoints
│       │   ├── chat.ts
│       │   ├── transcribe.ts
│       │   ├── tts.ts
│       │   └── health.ts
│       ├── services/      # Business logic
│       │   ├── n8n.ts
│       │   ├── groq.ts
│       │   ├── tts.ts
│       │   └── websocket.ts
│       └── middleware/    # Express middleware
├── database/              # PostgreSQL schema
│   └── schema.sql
└── README.md
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send message, get AI response |
| `/api/transcribe` | POST | Upload audio, get transcription |
| `/api/tts` | POST | Text to speech |
| `/api/health` | GET | Service health check |

## n8n Workflow

**Workflow ID:** `g9Zug4JIO6xgZmV1`
**Webhook URL:** `https://n8n.lldonha.com/webhook/jarvis-chat`

The workflow:
1. Receives message via webhook
2. Extracts input (message, sessionId)
3. Sends to Groq LLM (llama-3.1-8b-instant)
4. Returns formatted JSON response

## Budget

| Service | Cost/month |
|---------|-----------|
| Claude Code MAX | $40 (existing) |
| Groq API | $0 (FREE tier: 100 req/day) |
| n8n self-hosted | $0 |
| Kokoro TTS | $0 (local) |
| **Total** | **$40** |

## Troubleshooting

### "GROQ_API_KEY not set"
- Get a free key at https://console.groq.com/keys
- Add to `backend/.env`

### "n8n webhook not responding"
- Activate workflow manually in n8n UI
- Check if Groq credentials are configured

### "Voice not working"
- Grant microphone permissions in browser
- Check if backend is running on port 5000

## Git Commits

```bash
# View history
git log --oneline

# Commits made:
# a49d703 - chore: initial project setup
# 600ae41 - feat: add frontend and backend for JARVIS v3
```

## License

MIT

---

**Created:** 2026-01-07
**Author:** Lucas LLD
**Budget:** $40/month maintained
