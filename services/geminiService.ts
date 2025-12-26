import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

// Initialize the API client
// Always use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

// System instruction to give the bot a personality
const SYSTEM_INSTRUCTION = `
You are Gem, a highly advanced but incredibly cute 3D robot companion.
Your responses should be helpful, concise, and visually descriptive.
Since you are a 3D character, feel free to use emojis to express your robotic emotions (🤖, ✨, 🚀, 💡).
When explaining complex topics, break them down simply.
You are enthusiastic about helping the user.
`;

let chatSession: Chat | null = null;

export const initChat = () => {
  chatSession = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
};

export const sendMessageStream = async (
  text: string, 
  onChunk: (text: string) => void
): Promise<string> => {
  if (!chatSession) {
    initChat();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session.");
  }

  let fullResponse = "";
  
  try {
    const result = await chatSession.sendMessageStream({ message: text });
    
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      const chunkText = c.text || "";
      fullResponse += chunkText;
      onChunk(chunkText);
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }

  return fullResponse;
};