export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  isRecording: boolean;
}

export interface ServerToClientEvents {
  message: (data: { id: string; content: string; role: 'assistant' }) => void;
  stream: (data: { id: string; chunk: string; done: boolean }) => void;
  error: (data: { message: string }) => void;
  connected: () => void;
}

export interface ClientToServerEvents {
  chat: (data: { message: string; sessionId: string }) => void;
  transcribe: (data: { audio: ArrayBuffer; sessionId: string }) => void;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  model_used?: string;
  sessionId?: string;
}

export interface TranscribeResponse {
  success: boolean;
  text: string;
  error?: string;
}

export interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
}
