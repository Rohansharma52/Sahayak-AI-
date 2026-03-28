import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Volume2, VolumeX, RefreshCw } from "lucide-react";
import MicButton from "@/components/MicButton";
import { useChat, type Lang } from "@/context/ChatContext";
import { startListening, stopListening, isSpeechSupported } from "@/utils/speechToText";
import leafDecoration from "@/assets/leaf-decoration.png";
import { useTranslation } from "@/hooks/useTranslation";

const UI_EN = {
  idle: "Ask any farming question",
  idleSub: "Press the mic button and start speaking",
  hints: ["Which fertilizer for wheat?", "Why are tomato leaves turning yellow?", "How to apply for PM Kisan?"],
  listening: "Listening...",
  processing: "Finding answer for you…",
  processingSub: "Please wait a moment",
  askAnother: "Ask something else",
  stopLabel: "Stop",
  listenLabel: "Listen",
};

import type { AppLang } from "@/pages/Index";

interface ChatPageProps {
  lang: AppLang;
}

const ChatPage = ({ lang }: ChatPageProps) => {
  const { t } = useTranslation(lang);
  const location = useLocation();
  const { state, handleUserSpeech, resetChat } = useChat();
  const { status, messages } = state;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isListening, setIsListening] = useState(false);
  const initialHandled = useRef(false);

  useEffect(() => {
    const initialMessage = location.state?.initialMessage;
    if (initialMessage && !initialHandled.current) {
      initialHandled.current = true;
      handleUserSpeech(initialMessage, lang as Lang);
    }
  }, [location.state, handleUserSpeech, lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => () => { stopListening(); audioRef.current?.pause(); }, []);

  // Auto-play the latest bot audio when a new bot message arrives
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.from === "bot" && lastMsg.audioUrl) {
      audioRef.current?.pause();
      const audio = new Audio(lastMsg.audioUrl);
      audioRef.current = audio;
      audio.play().catch(() => {});
      setPlayingIndex(messages.length - 1);
      audio.onended = () => setPlayingIndex(null);
    }
  }, [messages]);

  const handleMicClick = () => {
    if (status === "processing") return;

    if (isListening) {
      stopListening();
      setIsListening(false);
      return;
    }

    if (!isSpeechSupported()) return;

    // Stop any playing audio before listening
    audioRef.current?.pause();
    setPlayingIndex(null);

    setIsListening(true);
    startListening(
      lang,
      (transcript) => {
        setIsListening(false);
        stopListening();
        // Pass lang directly — ChatContext now accepts all 8 languages
        handleUserSpeech(transcript, lang as Lang);
      },
      (err) => {
        console.warn("Speech error:", err);
        setIsListening(false);
        stopListening();
      }
    );
  };

  const handlePlay = (audioUrl: string, index: number) => {
    if (playingIndex === index) {
      audioRef.current?.pause();
      setPlayingIndex(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.play();
    setPlayingIndex(index);
    audio.onended = () => setPlayingIndex(null);
  };

  const showIdle = status === "idle" && messages.length === 0;
  const showDone = status === "done" && messages.length > 0;

  return (
    <div className="pt-14 min-h-screen bg-gradient-earth flex flex-col relative overflow-hidden">
      <img src={leafDecoration} alt="" className="absolute top-20 -right-16 w-48 opacity-10 rotate-12 pointer-events-none select-none" loading="lazy" width={800} height={800} />
      <img src={leafDecoration} alt="" className="absolute bottom-10 -left-16 w-40 opacity-8 -rotate-45 pointer-events-none select-none" loading="lazy" width={800} height={800} />
      <div className="absolute inset-0 -z-10" style={{ backgroundImage: "radial-gradient(circle, hsl(142 52% 36% / 0.04) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="flex-1 container max-w-lg py-6 flex flex-col relative z-10">

        {/* IDLE — mic + hints */}
        {showIdle && !isListening && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 100 }} className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center">
              <Bot size={36} className="text-primary" />
            </motion.div>
            <div>
              <p className="text-2xl font-bold text-foreground mb-2">{t(UI_EN.idle)}</p>
              <p className="text-sm text-muted-foreground">{t(UI_EN.idleSub)}</p>
            </div>
            <MicButton onClick={handleMicClick} isListening={isListening} />
            <div className="space-y-2 max-w-sm w-full">
              {UI_EN.hints.map((hint, i) => (
                <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.15 }}
                  className="text-xs text-muted-foreground bg-secondary/60 rounded-xl px-4 py-2.5 text-left border border-border/50">
                  {t(hint)}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}

        {/* LISTENING */}
        {isListening && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
            <p className="text-2xl font-bold text-primary">{t(UI_EN.listening)}</p>
            <MicButton onClick={handleMicClick} isListening />
            <div className="flex items-center gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div key={i} animate={{ scaleY: [0.3, 1, 0.3] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.05 }} className="w-1.5 h-8 rounded-full bg-primary/40" />
              ))}
            </div>
          </motion.div>
        )}

        {/* PROCESSING */}
        {status === "processing" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-24 h-24 rounded-full border-t-2 border-b-2 border-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Bot size="40" className="text-primary animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground mb-2">{t(UI_EN.processing)}</p>
              <p className="text-sm text-muted-foreground">{t(UI_EN.processingSub)}</p>
            </div>
          </motion.div>
        )}

        {/* DONE — message list */}
        {messages.length > 0 && !isListening && (
          <div className="flex-1 flex flex-col space-y-4 mb-24 overflow-y-auto pr-2 scrollbar-hide">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.from === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.from === "user" ? "bg-primary text-white" : "bg-white border border-border shadow-sm text-primary"}`}>
                      {msg.from === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className="space-y-2">
                      <div className={`rounded-2xl px-4 py-3 shadow-sm ${msg.from === "user" ? "bg-primary text-white rounded-tr-none" : "bg-white text-foreground rounded-tl-none border border-border/50"}`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                      {msg.audioUrl && (
                        <button onClick={() => handlePlay(msg.audioUrl!, i)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${playingIndex === i ? "bg-primary text-white scale-105" : "bg-secondary hover:bg-secondary/80 text-primary"}`}>
                          {playingIndex === i ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          {playingIndex === i ? t(UI_EN.stopLabel) : t(UI_EN.listenLabel)}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {status === "processing" && (
              <div className="flex justify-start">
                <div className="bg-white border border-border/50 rounded-2xl px-4 py-3 shadow-sm rounded-tl-none">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* BOTTOM ACTION BAR */}
        {showDone && !isListening && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-0 right-0 px-6 flex items-center justify-center gap-4 z-20">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={resetChat}
              className="bg-white/90 backdrop-blur-md border border-border shadow-lg rounded-full px-6 py-3 text-sm font-bold text-muted-foreground flex items-center gap-2">
              <RefreshCw size={16} /> {t("Reset")}
            </motion.button>
            <MicButton onClick={handleMicClick} isListening={isListening} />
            <div className="bg-primary/10 backdrop-blur-md border border-primary/20 shadow-lg rounded-full px-6 py-3 text-sm font-bold text-primary">
              {t(UI_EN.askAnother)}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
