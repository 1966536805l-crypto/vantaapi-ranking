"use client";

import { useEffect, useState } from "react";
import type { InterfaceLanguage } from "@/lib/language";

type LearningFullscreenButtonProps = {
  language?: InterfaceLanguage;
};

const fullscreenCopy: Record<InterfaceLanguage, {
  enter: string;
  exit: string;
  title: string;
}> = {
  en: { enter: "Full screen", exit: "Exit full", title: "Enter focused fullscreen study" },
  zh: { enter: "全屏学习", exit: "退出全屏", title: "进入专注全屏学习" },
  ja: { enter: "全画面", exit: "全画面終了", title: "集中学習を全画面で開く" },
  ko: { enter: "전체 화면", exit: "전체 화면 종료", title: "집중 학습을 전체 화면으로 열기" },
  es: { enter: "Pantalla completa", exit: "Salir", title: "Entrar al modo de estudio enfocado" },
  fr: { enter: "Plein écran", exit: "Quitter", title: "Ouvrir le mode étude en plein écran" },
  de: { enter: "Vollbild", exit: "Beenden", title: "Fokussiertes Lernen im Vollbild öffnen" },
  pt: { enter: "Tela cheia", exit: "Sair", title: "Entrar no estudo em tela cheia" },
  ru: { enter: "Полный экран", exit: "Выйти", title: "Открыть учебный режим на весь экран" },
  ar: { enter: "ملء الشاشة", exit: "خروج", title: "ادخل وضع الدراسة بملء الشاشة" },
  hi: { enter: "पूर्ण स्क्रीन", exit: "बाहर", title: "फोकस अध्ययन को पूर्ण स्क्रीन में खोलें" },
  id: { enter: "Layar penuh", exit: "Keluar", title: "Masuk ke mode belajar layar penuh" },
  vi: { enter: "Toàn màn hình", exit: "Thoát", title: "Mở chế độ học toàn màn hình" },
  th: { enter: "เต็มจอ", exit: "ออก", title: "เปิดโหมดเรียนแบบเต็มจอ" },
  tr: { enter: "Tam ekran", exit: "Çık", title: "Odaklı çalışmayı tam ekranda aç" },
  it: { enter: "Schermo intero", exit: "Esci", title: "Apri lo studio a schermo intero" },
  nl: { enter: "Volledig scherm", exit: "Sluiten", title: "Open gefocust studeren in volledig scherm" },
  pl: { enter: "Pełny ekran", exit: "Wyjdź", title: "Otwórz tryb nauki na pełnym ekranie" },
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
