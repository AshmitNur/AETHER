import React, { useState, useRef, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Send, Mic, Play, Square, Loader2 } from 'lucide-react';
import { Message } from '../types';
import { streamChatResponse, generateSpeech, LiveSession } from '../services/geminiService';
import { playPcmAudio, float32ToInt16, arrayBufferToBase64 } from '../utils/audioUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInterfaceProps {
  filesContent: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ filesContent }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hey there! I'm Aether. I've got your documents ready and I'm here to support you. How are you feeling about your studies today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Track the ID of the message currently playing audio
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isConnectingLive, setIsConnectingLive] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Audio Playback Refs
  const stopAudioRef = useRef<(() => void) | null>(null);
  const activeTTSIdRef = useRef<string | null>(null);

  // Realtime Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const liveSessionRef = useRef<LiveSession | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  useEffect(() => {
    return () => {
      stopRecording();
      if (stopAudioRef.current) stopAudioRef.current();
    };
  }, []);

  // Helper to parse bold text
  const renderMessageText = (text: string) => {
    const parts = text.split(/(\*\*[\s\S]*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const startRecording = async () => {
    try {
      setIsConnectingLive(true);

      // Initialize Live Session
      const session = new LiveSession((text) => {
        setInputValue(prev => prev + text);
      });
      await session.connect();
      liveSessionRef.current = session;

      setIsConnectingLive(false);
      setIsRecording(true);

      // Initialize Audio Context at 16kHz for Gemini compatibility
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Create ScriptProcessor for raw PCM access
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const int16Data = float32ToInt16(inputData);
        const base64Data = arrayBufferToBase64(int16Data.buffer);
        
        if (liveSessionRef.current) {
          liveSessionRef.current.sendAudio(base64Data);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

    } catch (err) {
      console.error("Error starting realtime recording:", err);
      alert("Microphone access denied or error connecting to Live API.");
      setIsConnectingLive(false);
      setIsRecording(false);
      stopRecording();
    }
  };

  const stopRecording = () => {
    // Stop Audio Processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Close Live Session
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }

    setIsRecording(false);
    setIsConnectingLive(false);
  };

  const toggleRecording = () => {
    if (isConnectingLive) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Placeholder for stream
    const botMessageId = (Date.now() + 1).toString();
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      role: 'model',
      text: '',
      timestamp: new Date(),
      isStreaming: true,
      isThinking: false
    };

    setMessages(prev => [...prev, botMessagePlaceholder]);

    let fullText = '';
    
    // Prepare history for API
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    await streamChatResponse(
      userMessage.text,
      history,
      filesContent,
      (chunk) => {
        fullText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: fullText, isStreaming: true } 
            : msg
        ));
      }
    );

    // Finalize message state
    setMessages(prev => prev.map(msg => 
      msg.id === botMessageId 
        ? { ...msg, isStreaming: false, isThinking: false } 
        : msg
    ));
    setIsLoading(false);
  };

  const handleTTS = async (text: string, msgId: string) => {
    // If user clicks the stop button (same message that is playing)
    if (isPlayingAudio === msgId) {
      if (stopAudioRef.current) stopAudioRef.current();
      stopAudioRef.current = null;
      setIsPlayingAudio(null);
      activeTTSIdRef.current = null;
      return;
    }

    // Stop any previously playing audio
    if (stopAudioRef.current) {
      stopAudioRef.current();
      stopAudioRef.current = null;
    }

    // Set new active state
    activeTTSIdRef.current = msgId;
    setIsPlayingAudio(msgId);

    try {
      const base64Audio = await generateSpeech(text);
      
      // If user switched to another message or stopped while fetching
      if (activeTTSIdRef.current !== msgId) return;

      if (base64Audio) {
        const stopFn = await playPcmAudio(base64Audio, () => {
          // Callback when audio ends naturally
          if (activeTTSIdRef.current === msgId) {
            setIsPlayingAudio(null);
            activeTTSIdRef.current = null;
            stopAudioRef.current = null;
          }
        });
        stopAudioRef.current = stopFn;
      } else {
        setIsPlayingAudio(null);
        activeTTSIdRef.current = null;
      }
    } catch (error) {
      console.error("TTS Error", error);
      if (activeTTSIdRef.current === msgId) {
        setIsPlayingAudio(null);
        activeTTSIdRef.current = null;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full relative p-6 lg:p-10">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pt-10 pb-10 px-4 space-y-8 scroll-smooth max-w-5xl mx-auto w-full custom-scrollbar">
        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div 
                key={msg.id} 
                layout
                initial={isUser 
                  ? { opacity: 0, scale: 0.9, y: 20 } 
                  : { opacity: 0, scale: 0.85, x: -20, filter: 'blur(5px)' }
                }
                animate={isUser
                  ? { opacity: 1, scale: 1, y: 0 }
                  : { opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }
                }
                transition={isUser 
                  ? { type: "spring", stiffness: 400, damping: 25, mass: 1 }
                  : { type: "spring", stiffness: 200, damping: 20, mass: 1.2 }
                }
                className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] lg:max-w-[75%] group relative`}>
                  
                  <div className={`
                    p-6 lg:p-8 rounded-[2rem] relative overflow-hidden backdrop-blur-md shadow-lg transition-all duration-300
                    ${isUser 
                      ? 'bg-gradient-to-br from-indigo-600/40 to-purple-600/40 border border-indigo-500/30 text-white rounded-tr-md' 
                      : 'bg-white/[0.03] border border-white/10 text-white/90 rounded-tl-md'}
                    ${isPlayingAudio === msg.id ? 'ring-1 ring-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : ''}
                  `}>
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 whitespace-pre-wrap leading-relaxed text-base lg:text-lg font-light">
                      {renderMessageText(msg.text)}
                      {msg.isStreaming && <span className="inline-block w-2 h-5 ml-2 bg-cyan-400 animate-pulse align-middle rounded-full shadow-[0_0_10px_#22d3ee]" />}
                    </div>
                  </div>

                  {/* Actions for Bot Message */}
                  {!isUser && !msg.isStreaming && msg.text && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className={`absolute -right-14 top-4 transition-all duration-300 flex flex-col gap-3 translate-x-[-10px] ${isPlayingAudio === msg.id ? 'opacity-100 translate-x-0' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`}
                    >
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleTTS(msg.text, msg.id)}
                        className={`p-3 rounded-full bg-white/5 border border-white/5 hover:bg-cyan-500/20 text-white/40 hover:text-cyan-400 transition-colors ${isPlayingAudio === msg.id ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' : ''}`}
                        title={isPlayingAudio === msg.id ? "Stop Reading" : "Read Aloud"}
                      >
                        {isPlayingAudio === msg.id ? <Square size={20} fill="currentColor" /> : <Play size={20} />}
                      </motion.button>
                    </motion.div>
                  )}
                  
                  <span className={`text-[11px] font-medium tracking-wider text-white/20 mt-2 block ${isUser ? 'text-right pr-2' : 'text-left pl-2'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="max-w-4xl mx-auto w-full pb-6 relative z-20">
        <GlassCard className="relative flex items-end gap-2 bg-black/40 backdrop-blur-2xl border-white/10 shadow-2xl p-2 rounded-[2rem]">
          
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Aether is thinking..." : isConnectingLive ? "Connecting to Live..." : isRecording ? "Listening..." : "Message Aether..."}
            className="w-full bg-transparent text-white placeholder-white/30 resize-none py-4 pl-4 pr-2 max-h-40 focus:outline-none custom-scrollbar text-lg font-light"
            rows={1}
            disabled={isLoading || isConnectingLive}
            style={{ minHeight: '56px' }}
          />

          <motion.button 
             whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
             whileTap={{ scale: 0.9 }}
             transition={{ type: "spring", stiffness: 400, damping: 20 }}
             className={`p-3 rounded-full transition-colors duration-300 flex-shrink-0 mb-1 ${isRecording ? 'bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(248,113,113,0.4)] animate-pulse' : 'text-white/50 hover:text-white'}`}
             onClick={toggleRecording}
             title={isRecording ? "Stop Recording" : "Speak"}
             disabled={isConnectingLive}
          >
            {isConnectingLive ? <Loader2 size={24} className="animate-spin text-cyan-400" /> : <Mic size={24} />}
          </motion.button>

          <motion.button 
             whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' }}
             whileTap={{ scale: 0.95 }}
             transition={{ type: "spring", stiffness: 400, damping: 20 }}
             className="p-3 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 mb-1"
             onClick={handleSendMessage}
             disabled={!inputValue.trim() || isLoading || isConnectingLive || isRecording}
          >
            <Send size={20} fill="currentColor" className="ml-0.5" />
          </motion.button>
        </GlassCard>
      </div>
    </div>
  );
};

export default ChatInterface;