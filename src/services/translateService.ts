import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";

const client = new TranslateClient({
  region: import.meta.env.VITE_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
  },
});

const cache: Record<string, string> = {};

/**
 * Translate text to target language using AWS Translate.
 * Uses a simple in-memory cache to avoid redundant calls.
 */
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!text || targetLanguage === "en") return text;
  
  const cacheKey = `${text}_${targetLanguage}`;
  if (cache[cacheKey]) return cache[cacheKey];

  try {
    const command = new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: "en",
      TargetLanguageCode: targetLanguage,
    });

    const response = await client.send(command);
    const translatedText = response.TranslatedText || text;
    
    cache[cacheKey] = translatedText;
    return translatedText;
  } catch (error) {
    console.error("AWS Translate error:", error);
    return text;
  }
}
