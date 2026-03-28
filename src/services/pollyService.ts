import { PollyClient, SynthesizeSpeechCommand, Engine, OutputFormat, TextType, VoiceId } from "@aws-sdk/client-polly";

const client = new PollyClient({
  region: import.meta.env.VITE_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
  },
});

// AWS Polly voices for supported languages
const POLLY_VOICE_MAP: Partial<Record<string, { voiceId: VoiceId; langCode: string }>> = {
  hi: { voiceId: "Aditi",  langCode: "hi-IN" },
  en: { voiceId: "Joanna", langCode: "en-US" },
  ta: { voiceId: "Kajal",  langCode: "ta-IN" },
  te: { voiceId: "Sujata", langCode: "te-IN" },
  kn: { voiceId: "Hiya",   langCode: "kn-IN" },
};

// Browser TTS language codes for languages Polly doesn't support
const BROWSER_TTS_LANG: Record<string, string> = {
  hi: "hi-IN",
  en: "en-IN",
  ta: "ta-IN",
  mr: "mr-IN",
  te: "te-IN",
  kn: "kn-IN",
  bn: "bn-IN",
  pa: "pa-IN",
};

/**
 * Speak text using browser's built-in SpeechSynthesis.
 * Returns a Promise that resolves when speech ends.
 */
function speakWithBrowser(text: string, lang: string): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = BROWSER_TTS_LANG[lang] ?? "hi-IN";
    utter.rate = 0.88;
    utter.pitch = 1;
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    window.speechSynthesis.speak(utter);
  });
}

/**
 * Convert text to speech.
 * - For hi/en: tries AWS Polly first, falls back to browser TTS
 * - For all other languages: uses browser TTS directly
 * Returns a blob URL (Polly) or empty string (browser TTS plays directly).
 */
export async function synthesizeSpeech(text: string, language: string): Promise<string> {
  const pollyConfig = POLLY_VOICE_MAP[language];
  const awsKey = import.meta.env.VITE_AWS_ACCESS_KEY_ID;

  // Try Polly for hi/en if credentials available
  if (pollyConfig && awsKey) {
    try {
      const cmd = new SynthesizeSpeechCommand({
        Text: text,
        OutputFormat: OutputFormat.MP3,
        VoiceId: pollyConfig.voiceId,
        Engine: Engine.STANDARD,
        TextType: TextType.TEXT,
        LanguageCode: pollyConfig.langCode as any,
      });
      const res = await client.send(cmd);
      if (!res.AudioStream) throw new Error("No audio stream");

      const chunks: Uint8Array[] = [];
      const reader = (res.AudioStream as any).getReader?.();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
      } else if (res.AudioStream instanceof Uint8Array) {
        chunks.push(res.AudioStream);
      }
      const blob = new Blob(chunks, { type: "audio/mpeg" });
      return URL.createObjectURL(blob);
    } catch (err) {
      console.warn("Polly failed, falling back to browser TTS:", err);
    }
  }

  // Browser TTS fallback for all languages
  await speakWithBrowser(text, language);
  return ""; // browser TTS plays directly, no URL needed
}
