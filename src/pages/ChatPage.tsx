import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Mic, Send, Volume2, VolumeX } from "lucide-react";

type ChatMessage = {
  from: "bot" | "user";
  text: string;
  playingAudio?: boolean;
};

const questions = {
  hi: [
    { q: "क्या आपके पास 2 हेक्टेयर से कम ज़मीन है?", options: ["हाँ", "नहीं"] },
    { q: "क्या आप किसान परिवार से हैं?", options: ["हाँ", "नहीं"] },
    { q: "क्या आपकी उम्र 18 साल से ज्यादा है?", options: ["हाँ", "नहीं"] },
  ],
  en: [
    { q: "Do you have less than 2 hectares of land?", options: ["Yes", "No"] },
    { q: "Are you from a farming family?", options: ["Yes", "No"] },
    { q: "Are you above 18 years old?", options: ["Yes", "No"] },
  ],
  ta: [
    { q: "உங்களிடம் 2 ஹெக்டேருக்கும் குறைவான நிலம் உள்ளதா?", options: ["ஆம்", "இல்லை"] },
    { q: "நீங்கள் விவசாய குடும்பத்தைச் சேர்ந்தவரா?", options: ["ஆம்", "இல்லை"] },
    { q: "உங்கள் வயது 18 வயதுக்கு மேல் உள்ளதா?", options: ["ஆம்", "இல்லை"] },
  ],
};

const ui = {
  hi: {
    greeting: "🙏 नमस्ते! मैं Sahayak AI हूँ। चलिए आपकी eligibility check करते हैं।",
    listening: "सुन रहे हैं…",
    processing: "आपके लिए योजना ढूँढी जा रही है…",
    inputPlaceholder: "यहाँ टाइप करें…",
    micHint: "बोलने के लिए दबाएं",
  },
  en: {
    greeting: "🙏 Hello! I'm Sahayak AI. Let's check your eligibility.",
    listening: "Listening…",
    processing: "Finding schemes for you…",
    inputPlaceholder: "Type here…",
    micHint: "Press to speak",
  },
  ta: {
    greeting: "🙏 வணக்கம்! நான் Sahayak AI. உங்கள் தகுதியை சரிபார்ப்போம்.",
    listening: "கேட்கிறேன்…",
    processing: "உங்களுக்கான திட்டங்களைத் தேடுகிறேன்…",
    inputPlaceholder: "இங்கே டைப் செய்க…",
    micHint: "பேச அழுத்தவும்",
  },
};

interface ChatPageProps {
  lang: "hi" | "en" | "ta";
}

const ChatPage = ({ lang }: ChatPageProps) => {
  const navigate = useNavigate();
  const t = ui[lang];
  const qs = questions[lang];
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: "bot", text: t.greeting },
  ]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [status, setStatus] = useState<"chatting" | "listening" | "processing">("chatting");
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);

  // Add first question after greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: qs[0].q }]);
      setShowQuestions(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAnswer = (answer: string) => {
    setShowQuestions(false);
    const nextQ = currentQ + 1;
    setMessages((prev) => [...prev, { from: "user", text: answer }]);

    if (nextQ < qs.length) {
      setCurrentQ(nextQ);
      setTimeout(() => {
        setMessages((prev) => [...prev, { from: "bot", text: qs[nextQ].q }]);
        setShowQuestions(true);
      }, 700);
    } else {
      setStatus("processing");
      setTimeout(() => {
        navigate("/result", { state: { lang } });
      }, 2000);
    }
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    handleAnswer(inputText.trim());
    setInputText("");
  };

  const handleMicPress = () => {
    setIsListening(true);
    setStatus("listening");
    // Simulate voice capture
    setTimeout(() => {
      setIsListening(false);
      setStatus("chatting");
      const simulatedText = qs[currentQ]?.options[0] || "हाँ";
      setInputText(simulatedText);
    }, 2000);
  };

  const handlePlayAudio = (idx: number) => {
    if (playingIdx === idx) {
      setPlayingIdx(null);
      return;
    }
    setPlayingIdx(idx);
    // Simulate audio duration
    setTimeout(() => setPlayingIdx(null), 2500);
  };

  return (
    <div className="pt-16 min-h-screen bg-gradient-earth flex flex-col">
      {/* Dot pattern */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(142 52% 36% / 0.03) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Chat Messages */}
      <div className="flex-1 container max-w-lg py-4 overflow-y-auto">
        <div className="space-y-4 pb-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={`flex gap-2.5 ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.from === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0 mt-1">
                    <Bot size={16} className="text-primary" />
                  </div>
                )}
                <div className="flex flex-col gap-1 max-w-[78%]">
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.from === "bot"
                        ? "bg-card border border-border text-foreground rounded-bl-md shadow-soft"
                        : "bg-gradient-hero text-primary-foreground rounded-br-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {/* TTS icon for bot messages */}
                  {msg.from === "bot" && (
                    <button
                      onClick={() => handlePlayAudio(i)}
                      className={`self-start flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                        playingIdx === i
                          ? "text-primary bg-primary-light font-semibold"
                          : "text-muted-foreground hover:text-primary hover:bg-primary-light/50"
                      }`}
                    >
                      {playingIdx === i ? (
                        <>
                          <VolumeX size={12} />
                          <span className="flex gap-0.5">
                            {[1, 2, 3].map((b) => (
                              <motion.span
                                key={b}
                                animate={{ scaleY: [0.4, 1, 0.4] }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: b * 0.1 }}
                                className="inline-block w-0.5 h-3 rounded-full bg-primary"
                              />
                            ))}
                          </span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={12} /> 🔊
                        </>
                      )}
                    </button>
                  )}
                </div>
                {msg.from === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <User size={16} className="text-primary" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Processing state */}
          {status === "processing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2.5"
            >
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                <Bot size={16} className="text-primary" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-card border border-border rounded-bl-md shadow-soft">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                  />
                  {t.processing}
                </div>
              </div>
            </motion.div>
          )}

          {/* Listening state */}
          {status === "listening" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 py-4"
            >
              <div className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary-light border border-primary/20">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-semibold text-primary">{t.listening}</span>
                <div className="flex gap-0.5 ml-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scaleY: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
                      className="w-1 h-4 rounded-full bg-primary/50"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>


      {/* Input Bar */}
      <div className="sticky bottom-0 bg-card/95 backdrop-blur-lg border-t border-border">
        <div className="container max-w-lg py-3">
          <div className="flex items-center gap-2">
            {/* Mic Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleMicPress}
              disabled={isListening || status === "processing"}
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${
                isListening
                  ? "bg-destructive text-destructive-foreground shadow-lg"
                  : "bg-gradient-hero text-primary-foreground shadow-card"
              } disabled:opacity-50`}
            >
              <Mic size={20} />
              {isListening && (
                <motion.span
                  animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute w-12 h-12 rounded-full border-2 border-primary/40"
                />
              )}
            </motion.button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendText()}
                placeholder={t.inputPlaceholder}
                disabled={status === "processing"}
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
              />
            </div>

            {/* Send Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSendText}
              disabled={!inputText.trim() || status === "processing"}
              className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-30"
            >
              <Send size={18} />
            </motion.button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">{t.micHint}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
