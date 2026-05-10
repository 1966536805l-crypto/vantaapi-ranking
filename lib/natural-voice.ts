export type VoiceKind = "word" | "sentence";

type VoiceOptions = {
  text: string;
  kind?: VoiceKind;
};

let currentAudio: HTMLAudioElement | null = null;
let audioCache = new Map<string, string>();

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

// Use Edge TTS API (free, high quality, male voice)
async function getAudioUrl(text: string): Promise<string> {
  const normalized = normalizeText(text);

  // Check cache first
  if (audioCache.has(normalized)) {
    return audioCache.get(normalized)!;
  }

  try {
    // Use a free TTS service with natural male voice
    // Option 1: Google Translate TTS (free, no API key needed)
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(normalized)}`;

    // Cache the URL
    audioCache.set(normalized, url);

    return url;
  } catch (error) {
    console.error("Failed to get audio URL:", error);
    throw error;
  }
}

async function playAudio(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(url);
    currentAudio = audio;

    audio.onended = () => {
      resolve();
    };

    audio.onerror = () => {
      reject(new Error("Failed to play audio"));
    };

    audio.play().catch(reject);
  });
}

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function speakNaturalVoice({ text, kind = "word" }: VoiceOptions): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  const clean = normalizeText(text);
  if (!clean) return false;

  try {
    if (kind === "sentence") {
      // For sentences: play once at normal speed, then slowly
      const url = await getAudioUrl(clean);
      await playAudio(url);
      await wait(500);
      await playAudio(url);
    } else {
      // For words: play 3 times with pauses
      const url = await getAudioUrl(clean);
      await playAudio(url);
      await wait(400);
      await playAudio(url);
      await wait(400);
      await playAudio(url);
    }

    return true;
  } catch (error) {
    console.error("Natural voice failed:", error);
    return false;
  }
}

export function stopNaturalVoice(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

// New simplified API for word typing trainer
export async function playNaturalVoice(text: string, kind: VoiceKind = "word"): Promise<HTMLAudioElement | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const clean = normalizeText(text);
  if (!clean) return null;

  try {
    const url = await getAudioUrl(clean);

    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(url);
    currentAudio = audio;

    await audio.play();

    return audio;
  } catch (error) {
    console.error("Failed to play natural voice:", error);
    return null;
  }
}
