export interface ChatRequest {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  model_used?: string;
  sessionId?: string;
  error?: string;
}

export interface TranscribeResponse {
  success: boolean;
  text: string;
  error?: string;
}

export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
}

export interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  audioData?: Buffer;
  error?: string;
}

export interface N8NWebhookPayload {
  message: string;
  sessionId: string;
  timestamp: string;
}

export interface N8NWebhookResponse {
  success: boolean;
  response: string;
  model_used?: string;
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

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  sessionId: string;
}
