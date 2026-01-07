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
│         │                   │          │  (80% FREE) │      │
│         │                   │          └──────┬──────┘      │
│         │                   │                 │             │
│         │                   │          ┌──────▼──────┐      │
│         │                   │          │  OpenCode   │      │
│         │                   │          │   Router    │      │
│         │                   │          │  (20% code) │      │
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
- 🧠 **Hybrid Routing** - 80% Groq direct, 20% OpenCode Router
- 💾 **Memory** - PostgreSQL conversation history
- 🌙 **Dark Theme** - Professional glassmorphism design

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Express, Socket.io, TypeScript |
| LLM | Groq (llama-3.1-8b-instant), OpenCode Router (GLM-4.7, DeepSeek) |
| STT | Groq Whisper API (FREE) |
| TTS | Kokoro FastAPI (local, FREE) |
| Database | PostgreSQL |
| Orchestration | n8n (self-hosted) |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- n8n running at https://n8n.lldonha.com
- Groq API key (free tier)

### Installation

```bash
# Clone
cd E:/jarvis-voice

# Frontend
cd frontend
npm install
npm run dev  # http://localhost:3000

# Backend (new terminal)
cd backend
cp .env.example .env
# Edit .env with your keys
npm install
npm run dev  # http://localhost:5000
```

### Environment Variables

**Backend (.env):**
```env
PORT=5000
NODE_ENV=development
GROQ_API_KEY=your_groq_api_key
N8N_WEBHOOK_URL=https://n8n.lldonha.com/webhook/jarvis-chat
POSTGRES_URL=postgresql://user:pass@localhost:5432/jarvis
KOKORO_URL=http://localhost:8880
```

## Project Structure

```
E:/jarvis-voice/
├── frontend/           # Next.js 15 frontend
│   ├── app/           # App Router pages
│   ├── components/    # React components
│   └── lib/           # Utilities and types
├── backend/           # Express backend
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Business logic
│   │   └── middleware/# Express middleware
│   └── package.json
└── README.md
```

## Budget

| Service | Cost/month |
|---------|-----------|
| Claude Code MAX | $40 (existing) |
| Groq API | $0 (FREE tier) |
| OpenCode models | $0 (FREE) |
| n8n self-hosted | $0 |
| Kokoro TTS | $0 (local) |
| **Total** | **$40** |

## License

MIT
