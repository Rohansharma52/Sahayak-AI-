type ResultCallback = (transcript: string) => void;
type ErrorCallback = (error: string) => void;

const LANG_CODE: Record<string, string> = {
  hi: "hi-IN",
  en: "en-IN",
  ta: "ta-IN",
  mr: "mr-IN",
  bn: "bn-IN",
  te: "te-IN",
  kn: "kn-IN",
  pa: "pa-IN",
};

let recognition: SpeechRecognition | null = null;

function getSpeechRecognition(): typeof SpeechRecognition | null {
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

export function isSpeechSupported(): boolean {
  return !!getSpeechRecognition();
}

export function startListening(
  language: string,
  onResult: ResultCallback,
  onError: ErrorCallback
): void {
  const SR = getSpeechRecognition();
  if (!SR) {
    onError("Speech recognition is not supported in this browser. Please use Chrome.");
    return;
  }

  stopListening(); // stop any existing session

  recognition = new SR();
  recognition.lang = LANG_CODE[language] || "hi-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0]?.[0]?.transcript?.trim();
    if (transcript) onResult(transcript);
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    const msg =
      event.error === "not-allowed"
        ? "Microphone access denied. Please allow microphone permission."
        : event.error === "no-speech"
        ? "No speech detected. Please try again."
        : `Speech error: ${event.error}`;
    onError(msg);
  };

  recognition.onend = () => {
    recognition = null;
  };

  recognition.start();
}

export function stopListening(): void {
  if (recognition) {
    try {
      recognition.stop();
    } catch {
      // ignore
    }
    recognition = null;
  }
}
