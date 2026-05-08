"use client";

import { useEffect, useState } from "react";
import type { InterfaceLanguage } from "@/lib/language";

type LearningFullscreenButtonProps = {
  language?: InterfaceLanguage;
};

const fullscreenCopy: Partial<Record<InterfaceLanguage, {
  enter: string;
  exit: string;
  title: string;
}>> & { en: { enter: string; exit: string; title: string }; zh: { enter: string; exit: string; title: string } } = {
  en: { enter: "Full screen", exit: "Exit full", title: "Enter focused fullscreen study" },
  zh: { enter: "全屏学习", exit: "退出全屏", title: "进入专注全屏学习" },
  ja: { enter: "全画面", exit: "全画面終了", title: "集中学習を全画面で開く" },
  ko: { enter: "전체 화면", exit: "전체 화면 종료", title: "집중 학습을 전체 화면으로 열기" },
  es: { enter: "Pantalla completa", exit: "Salir", title: "Entrar al modo de estudio enfocado" },
  ar: { enter: "ملء الشاشة", exit: "خروج", title: "ادخل وضع الدراسة بملء الشاشة" },
};

function getFullscreenCopy(language: InterfaceLanguage) {
  return fullscreenCopy[language] || fullscreenCopy.en;
}

export default function LearningFullscreenButton({
  language = "zh",
}: LearningFullscreenButtonProps) {
  const copy = getFullscreenCopy(language);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    const timer = window.setTimeout(() => {
      setMounted(true);
      sync();
    }, 0);
    document.addEventListener("fullscreenchange", sync);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("fullscreenchange", sync);
    };
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await document.documentElement.requestFullscreen();
    } catch {
      // Some browsers block fullscreen until the user retries from a direct click.
    }
  }

  if (!mounted || !document.documentElement.requestFullscreen) return null;

  return (
    <button
      type="button"
      className="learning-fullscreen-button"
      onClick={toggleFullscreen}
      title={copy.title}
    >
      <span>{isFullscreen ? "↙" : "↗"}</span>
      {isFullscreen ? copy.exit : copy.enter}
    </button>
  );
}
