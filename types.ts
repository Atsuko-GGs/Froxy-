export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface CharacterState {
  isThinking: boolean;
  isSpeaking: boolean;
  mood: 'happy' | 'neutral' | 'excited' | 'thinking';
}

export interface ChatConfig {
  temperature: number;
  topK: number;
  topP: number;
}