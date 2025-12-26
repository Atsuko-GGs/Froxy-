import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ThreeScene } from './components/ThreeScene';
import { ChatUI } from './components/ChatUI';
import { Message, Role, CharacterState } from './types';
import { sendMessageStream, initChat } from './services/geminiService';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Character State
  const [characterState, setCharacterState] = useState<CharacterState>({
    isThinking: false,
    isSpeaking: false,
    mood: 'neutral'
  });

  // Speech Synthesis Refs
  const synth = useRef<SpeechSynthesis>(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize Gemini Chat
    try {
        initChat();
    } catch (e) {
        console.error("Initialization error", e);
    }
    
    // Welcome message
    const welcomeMsg: Message = {
        id: 'welcome',
        role: Role.MODEL,
        text: "Hello! I'm Gem. I can see you, hear you (well, read you), and explain anything visually! What's on your mind?",
        timestamp: new Date()
    };
    setMessages([welcomeMsg]);
    speak(welcomeMsg.text);

    return () => {
        if (synth.current) {
            synth.current.cancel();
        }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!synth.current) return;

    // Clean text for speech (remove markdown symbols roughly)
    const cleanText = text.replace(/[*#_`]/g, '');

    // Cancel current speech
    synth.current.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Select a good voice if available (prefer Google voices or refined ones)
    const voices = synth.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google") && v.name.includes("English")) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.pitch = 1.2; // Slightly higher pitch for "cute robot" effect
    utterance.rate = 1.1;

    utterance.onstart = () => {
        setCharacterState(prev => ({ ...prev, isSpeaking: true }));
    };

    utterance.onend = () => {
        setCharacterState(prev => ({ ...prev, isSpeaking: false }));
    };

    utterance.onerror = () => {
         setCharacterState(prev => ({ ...prev, isSpeaking: false }));
    };

    synth.current.speak(utterance);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: uuidv4(),
      role: Role.USER,
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setCharacterState(prev => ({ ...prev, isThinking: true, mood: 'thinking' }));

    // Placeholder for model response
    const modelMsgId = uuidv4();
    const modelMsgPlaceholder: Message = {
        id: modelMsgId,
        role: Role.MODEL,
        text: '',
        timestamp: new Date(),
        isStreaming: true
    };
    setMessages(prev => [...prev, modelMsgPlaceholder]);

    try {
        let fullText = "";
        
        await sendMessageStream(userMsg.text, (chunk) => {
            fullText += chunk;
            setMessages(prev => prev.map(msg => 
                msg.id === modelMsgId 
                ? { ...msg, text: prev.find(m => m.id === modelMsgId)?.text + chunk }
                : msg
            ));
        });

        // Finished streaming
        setMessages(prev => prev.map(msg => 
            msg.id === modelMsgId ? { ...msg, isStreaming: false } : msg
        ));
        
        setCharacterState(prev => ({ ...prev, isThinking: false, mood: 'happy' }));
        
        // Speak the result
        speak(fullText);

    } catch (error) {
        console.error("Chat error:", error);
        setMessages(prev => prev.map(msg => 
            msg.id === modelMsgId ? { ...msg, text: "I'm having trouble connecting to my brain network right now. 😵‍💫", isStreaming: false } : msg
        ));
        setCharacterState(prev => ({ ...prev, isThinking: false, mood: 'neutral' }));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden font-sans text-slate-100 selection:bg-cyan-500/30">
      
      {/* 3D Background/Character */}
      <ThreeScene state={characterState} />

      {/* Overlay UI */}
      <ChatUI 
        messages={messages} 
        input={input} 
        setInput={setInput} 
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
      
    </div>
  );
}

export default App;