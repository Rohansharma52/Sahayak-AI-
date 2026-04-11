import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; lang?: string; }
interface State { hasError: boolean; error?: Error; }

const MSGS: Record<string, string> = {
  hi: "कुछ गड़बड़ हो गई। पेज रिफ्रेश करें।",
  en: "Something went wrong. Please refresh the page.",
  ta: "ஏதோ தவறு நடந்தது. பக்கத்தை புதுப்பிக்கவும்.",
  mr: "काहीतरी चूक झाली. पेज रिफ्रेश करा.",
  te: "ఏదో తప్పు జరిగింది. పేజీని రిఫ్రెష్ చేయండి.",
  kn: "ಏನೋ ತಪ್ಪಾಯಿತು. ಪುಟವನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ.",
  bn: "কিছু একটা ভুল হয়েছে। পেজ রিফ্রেশ করুন।",
  pa: "ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ। ਪੇਜ ਰਿਫ੍ਰੈਸ਼ ਕਰੋ।",
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error) { console.error("ErrorBoundary caught:", error); }

  render() {
    if (!this.state.hasError) return this.props.children;
    const msg = MSGS[this.props.lang ?? "hi"] ?? MSGS.hi;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-3xl p-8 shadow-lg text-center max-w-sm space-y-4">
          <div className="text-5xl">😔</div>
          <p className="font-black text-gray-800 text-lg">{msg}</p>
          <button onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-2xl text-white font-black text-sm"
            style={{ background: "linear-gradient(135deg,#1f6b2a,#2e8b57)" }}>
            🔄 Refresh
          </button>
        </div>
      </div>
    );
  }
}
