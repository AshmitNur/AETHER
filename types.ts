
export interface FileDoc {
  id: string;
  name: string;
  content: string;
  type: string;
  status: 'indexing' | 'ready';
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
  isStreaming?: boolean;
}

export type AppView = 'dashboard' | 'chat' | 'files';

export enum AIModelMode {
  FAST = 'fast', // Gemini 2.5 Flash Lite
}

export interface ChartData {
  name: string;
  value: number;
  fullMark: number;
}

export interface User {
  id: string;
  studentId: string;
  name: string;
}
