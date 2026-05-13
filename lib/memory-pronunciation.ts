export type PronunciationKind = "word" | "sentence";

type PronunciationStep = {
  text: string;
  rate: number;
  pitch: number;
  pause: number;
};

type SpeakMemoryOptions = {
  text: string;
  kind?: PronunciationKind;
};

let speechRunId = 0;

// Initialize voices on load
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  // Trigger voice loading
  window.speechSynthesis.getVoices();
}

function normalizedSpeechText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function spellingEcho(word: string) {
  const letters = word.replace(/[^A-Za-z]/g, "").split("");
  return letters.length >= 2 && letters.length <= 18 ? letters.join(" ") : "";
}

function sentenceChunks(sentence: string) {
  const words = normalizedSpeechText(sentence).split(" ").filter(Boolean);
  const chunks: string[] = [];
  for (let index = 0; index < words.length; index += 4) {
    chunks.push(words.slice(index, index + 4).join(" "));
  }
  return chunks;
}

function buildMemorySteps(text: string, kind: PronunciationKind): PronunciationStep[] {
  const clean = normalizedSpeechText(text);
  if (!clean) return [];

  if (kind === "sentence") {
    return [
      { text: clean, rate: 0.85, pitch: 1.0, pause: 500 },
      ...sentenceChunks(clean).map((chunk) => ({ text: chunk, rate: 0.65, pitch: 1.0, pause: 400 })),
      { text: clean, rate: 0.9, pitch: 1.0, pause: 0 },
    ];
  }

  const echo = spellingEcho(clean);
  return [
    { text: clean, rate: 0.85, pitch: 1.0, pause: 400 },
    { text: clean, rate: 0.6, pitch: 1.0, pause: 400 },
    ...(echo ? [{ text: echo, rate: 0.75, pitch: 1.0, pause: 400 }] : []),
    { text: clean, rate: 0.85, pitch: 1.0, pause: 0 },
  ];
}

function preferredEnglishVoice() {
  const voices = window.speechSynthesis.getVoices();
  const usVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en-us"));

  // Priority 1: High-quality US English voices when the browser/OS provides them.
  const premiumUSVoice = usVoices.find((voice) =>
    /Samantha|Ava|Allison|Susan|Zoe|Nicky|Google US English|Microsoft (Aria|Jenny|Guy|Ana)/i.test(voice.name) ||
    /Premium|Enhanced/i.test(voice.name)
  );
  if (premiumUSVoice) return premiumUSVoice;

  // Priority 2: Local US English voices.
  const localUSVoice = usVoices.find((voice) => voice.localService);
  if (localUSVoice) return localUSVoice;

  // Priority 3: Any US English voice.
  const usVoice = usVoices[0];
  if (usVoice) return usVoice;

  // Priority 4: Any high-quality English voice, then any English voice.
  const premiumVoice = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith("en") &&
    /Samantha|Alex|Google|Microsoft|Premium|Enhanced/i.test(voice.name)
  );
  if (premiumVoice) return premiumVoice;

  return voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
}

function speakStep(step: PronunciationStep) {
  return new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(step.text);
    utterance.lang = "en-US";
    utterance.rate = step.rate;
    utterance.pitch = step.pitch;
    utterance.volume = 1;

    // Wait for voices to load if needed
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        const voice = preferredEnglishVoice();
        if (voice) utterance.voice = voice;
      }, { once: true });
    } else {
      const voice = preferredEnglishVoice();
      if (voice) utterance.voice = voice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function speakMemoryPronunciation({ text, kind = "word" }: SpeakMemoryOptions) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  const steps = buildMemorySteps(text, kind);
  if (steps.length === 0) return false;

  const runId = speechRunId + 1;
  speechRunId = runId;
  window.speechSynthesis.cancel();
  for (const step of steps) {
    if (runId !== speechRunId) return true;
    await speakStep(step);
    if (runId !== speechRunId) return true;
    if (step.pause > 0) await wait(step.pause);
  }
  return true;
}
