import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { MODELS, SYSTEM_INSTRUCTION } from "../constants";

// Helper to check for API key availability
const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const streamChatResponse = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  fileContext: string,
  onChunk: (text: string) => void
) => {
  const ai = getAIClient();
  const modelName = MODELS.FAST;
  
  // Prepare system instruction with file context (Client-side RAG)
  const effectiveSystemInstruction = `
    ${SYSTEM_INSTRUCTION}
    
    Here is the content of the documents provided by the student (Knowledge Base):
    ${fileContext ? fileContext : "No documents uploaded yet."}
  `;

  // Config based on mode
  const config: any = {
    systemInstruction: effectiveSystemInstruction,
  };

  const chat = ai.chats.create({
    model: modelName,
    config: config,
    history: history.map(h => ({
      role: h.role,
      parts: h.parts
    }))
  });

  try {
    const result = await chat.sendMessageStream({ message });
    
    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    onChunk("\n[Error: Failed to generate response from Gemini. Please check connection or API limits.]");
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  const ai = getAIClient();
  
  try {
    const response = await ai.models.generateContent({
      model: MODELS.TTS,
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};

export const transcribeAudio = async (base64Audio: string, mimeType: string = 'audio/webm'): Promise<string> => {
  const ai = getAIClient();
  const modelName = MODELS.FAST; // Use flash-lite for speed

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          { text: "Transcribe the spoken language in this audio into text verbatim. Do not add any other commentary or markdown." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("STT Error:", error);
    return "";
  }
};

// --- Live API Session for Realtime STT ---

export class LiveSession {
  private session: any = null;
  private onTranscript: (text: string) => void;

  constructor(onTranscript: (text: string) => void) {
    this.onTranscript = onTranscript;
  }

  async connect() {
    const ai = getAIClient();
    this.session = await ai.live.connect({
      model: MODELS.LIVE,
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {}, // Enable user audio transcription
      },
      callbacks: {
        onopen: () => {
          console.log("Live Session Connected");
        },
        onmessage: (msg: LiveServerMessage) => {
          // Handle transcription updates
          if (msg.serverContent?.inputTranscription?.text) {
            this.onTranscript(msg.serverContent.inputTranscription.text);
          }
        },
        onclose: () => {
          console.log("Live Session Closed");
        },
        onerror: (err: any) => {
          console.error("Live Session Error:", err);
        }
      }
    });
  }

  sendAudio(base64Pcm: string) {
    if (this.session) {
      this.session.sendRealtimeInput({
        media: {
          mimeType: 'audio/pcm;rate=16000',
          data: base64Pcm
        }
      });
    }
  }

  close() {
    if (this.session) {
      // session.close() is available on the interface returned by connect
      // Note: TypeScript might not strictly see it on the implicit type, but it exists on the LiveSession interface.
      try {
        this.session.close();
      } catch(e) {
        console.warn("Error closing session:", e);
      }
      this.session = null;
    }
  }
}
