import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MicButton from "@/components/MicButton";

type ChatMessage = {
  from: "bot" | "user";
  text: string;
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
};

const states = {
  hi: {
    idle: "आप क्या जानना चाहते हैं?",
    listening: "सुन रहे हैं...",
    processing: "आपके लिए योजना ढूँढी जा रही है…",
    greeting: "नमस्ते! मैं Sahayak AI हूँ। आपकी eligibility check करते हैं।",
  },
  en: {
    idle: "What would you like to know?",
    listening: "Listening...",
    processing: "Finding schemes for you…",
    greeting: "Hello! I'm Sahayak AI. Let's check your eligibility.",
  },
};

interface DemoPageProps {
  lang: "hi" | "en";
}

const DemoPage = ({ lang }: DemoPageProps) => {
  const navigate = useNavigate();
  const t = states[lang];
  const qs = questions[lang];

  const [status, setStatus] = useState<"idle" | "listening" | "chatting" | "processing">("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQ, setCurrentQ] = useState(0);

  const startConversation = () => {
    setStatus("listening");
    // Simulate listening, then start chat
    setTimeout(() => {
      setStatus("chatting");
      setMessages([{ from: "bot", text: t.greeting }]);
      setTimeout(() => {
        setMessages((prev) => [...prev, { from: "bot", text: qs[0].q }]);
      }, 800);
    }, 1500);
  };

  const handleAnswer = (answer: string) => {
    const nextQ = currentQ + 1;
    setMessages((prev) => [...prev, { from: "user", text: answer }]);

    if (nextQ < qs.length) {
      setCurrentQ(nextQ);
      setTimeout(() => {
        setMessages((prev) => [...prev, { from: "bot", text: qs[nextQ].q }]);
      }, 600);
    } else {
      setStatus("processing");
      setTimeout(() => {
        navigate("/result", { state: { lang } });
      }, 2000);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-background flex flex-col">
      {/* Chat area */}
      <div className="flex-1 container max-w-lg py-6 flex flex-col">
        {status === "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
          >
            <p className="text-xl font-medium text-foreground">{t.idle}</p>
            <MicButton onClick={startConversation} />
            <p className="text-sm text-muted-foreground">
              {lang === "hi" ? "माइक बटन दबाएं" : "Press the mic button"}
            </p>
          </motion.div>
        )}

        {status === "listening" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
          >
            <p className="text-xl font-medium text-primary">{t.listening}</p>
            <MicButton onClick={() => {}} isListening />
          </motion.div>
        )}

        {status === "processing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
                style={{ borderWidth: 3 }}
              />
            </div>
            <p className="text-lg font-medium text-muted-foreground">{t.processing}</p>
          </motion.div>
        )}

        {status === "chatting" && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto pb-4">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                        msg.from === "bot"
                          ? "bg-primary-light text-foreground rounded-bl-md"
                          : "bg-gradient-hero text-primary-foreground rounded-br-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Answer buttons */}
            {currentQ < qs.length && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-center py-4"
              >
                {qs[currentQ].options.map((opt) => (
                  <motion.button
                    key={opt}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAnswer(opt)}
                    className="px-8 py-3 rounded-2xl bg-card border-2 border-primary text-primary font-semibold text-base hover:bg-primary hover:text-primary-foreground transition-all shadow-soft"
                  >
                    {opt}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoPage;
