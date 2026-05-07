"use client";

import { useEffect, useState } from "react";

type LearningFullscreenButtonProps = {
  language?: "en" | "zh";
};

export default function LearningFullscreenButton({
  language = "zh",
}: LearningFullscreenButtonProps) {
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
      title={language === "zh" ? "进入专注全屏学习" : "Enter focused fullscreen study"}
    >
      <span>{isFullscreen ? "↙" : "↗"}</span>
      {language === "zh" ? (isFullscreen ? "退出全屏" : "全屏学习") : isFullscreen ? "Exit full" : "Full screen"}
    </button>
  );
}
