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
      { text: clean, rate: 0.9, pitch: 0.98, pause: 320 },
      ...sentenceChunks(clean).map((chunk) => ({ text: chunk, rate: 0.68, pitch: 1.02, pause: 260 })),
      { text: clean, rate: 0.95, pitch: 0.98, pause: 0 },
    ];
  }

  const echo = spellingEcho(clean);
  return [
    { text: clean, rate: 0.86, pitch: 0.98, pause: 260 },
    { text: clean, rate: 0.58, pitch: 1.04, pause: 260 },
    ...(echo ? [{ text: echo, rate: 0.74, pitch: 0.96, pause: 260 }] : []),
    { text: clean, rate: 0.92, pitch: 0.98, pause: 0 },
  ];
}

function preferredEnglishVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en-us") && voice.localService) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en-us")) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
  );
}

function speakStep(step: PronunciationStep) {
  return new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(step.text);
    utterance.lang = "en-US";
    utterance.rate = step.rate;
    utterance.pitch = step.pitch;
    utterance.volume = 1;
    const voice = preferredEnglishVoice();
    if (voice) utterance.voice = voice;
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
