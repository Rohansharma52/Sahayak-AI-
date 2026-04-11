import { createContext, useContext, useReducer, useRef, type ReactNode } from "react";
import { askGemini } from "@/services/geminiService";
import { synthesizeSpeech } from "@/services/pollyService";
import type { AppLang } from "@/pages/Index";

export type Lang = AppLang;  // now supports all 8 languages
export type ChatStatus = "idle" | "listening" | "processing" | "done";

export interface ChatMessage {
  from: "bot" | "user";
  text: string;
  audioUrl?: string;
}

export interface SchemeResult {
  eligible: boolean;
  schemeName: string;
  benefit: string;
  reason: string;
  steps: string[];
  docs: string[];
  lang: Lang;
  audioUrl?: string;
}

interface ChatState {
  status: ChatStatus;
  messages: ChatMessage[];
  error: string | null;
  schemeResult: SchemeResult | null;
}

type ChatAction =
  | { type: "SET_STATUS"; payload: ChatStatus }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "SET_AUDIO_ON_LAST"; payload: string }
  | { type: "SET_SCHEME_RESULT"; payload: SchemeResult }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET" };

const initialState: ChatState = {
  status: "idle",
  messages: [],
  error: null,
  schemeResult: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_STATUS": return { ...state, status: action.payload };
    case "ADD_MESSAGE": return { ...state, messages: [...state.messages, action.payload] };
    case "SET_AUDIO_ON_LAST": {
      const msgs = [...state.messages];
      if (msgs.length > 0) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], audioUrl: action.payload };
      return { ...state, messages: msgs };
    }
    case "SET_SCHEME_RESULT": return { ...state, schemeResult: action.payload };
    case "SET_ERROR": return { ...state, error: action.payload };
    case "RESET": return { ...initialState };
    default: return state;
  }
}

interface ChatContextValue {
  state: ChatState;
  handleUserSpeech: (transcript: string, lang: Lang) => Promise<void>;
  resetChat: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  // Track full conversation history for context
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  const handleUserSpeech = async (transcript: string, lang: Lang) => {
    dispatch({ type: "ADD_MESSAGE", payload: { from: "user", text: transcript } });
    dispatch({ type: "SET_STATUS", payload: "processing" });

    historyRef.current.push({ role: "user", content: transcript });

    try {
      console.log("Calling Gemini with history:", historyRef.current);
      const reply = await askGemini(historyRef.current, lang);
      console.log("Gemini reply:", reply);
      
      historyRef.current.push({ role: "assistant", content: reply });

      dispatch({ type: "ADD_MESSAGE", payload: { from: "bot", text: reply } });

      // Generate audio and auto-play
      try {
        const audioUrl = await synthesizeSpeech(reply, lang);
        if (audioUrl) dispatch({ type: "SET_AUDIO_ON_LAST", payload: audioUrl });
      } catch (audioErr) {
        console.error("Audio synthesis failed:", audioErr);
      }

      dispatch({ type: "SET_STATUS", payload: "done" });
    } catch (err: any) {
      console.error("Chat error details:", err);
      dispatch({ type: "SET_ERROR", payload: err.message || "Something went wrong." });
      dispatch({ type: "SET_STATUS", payload: "idle" });
      
      // Add a friendly error message from the bot
      const errMsgs: Record<string, string> = {
        hi: "माफ़ करें, कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।",
        en: "Sorry, something went wrong. Please try again.",
        ta: "மன்னிக்கவும், ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.",
        mr: "माफ करा, काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
        te: "క్షమించండి, ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
        kn: "ಕ್ಷಮಿಸಿ, ಏನೋ ತಪ್ಪಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        bn: "দুঃখিত, কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
        pa: "ਮਾਫ਼ ਕਰਨਾ, ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
      };
      dispatch({ 
        type: "ADD_MESSAGE", 
        payload: { from: "bot", text: errMsgs[lang] ?? errMsgs.hi }
      });
    }
  };

  const resetChat = () => {
    historyRef.current = [];
    dispatch({ type: "RESET" });
  };

  return (
    <ChatContext.Provider value={{ state, handleUserSpeech, resetChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
