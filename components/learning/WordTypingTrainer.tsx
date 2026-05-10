'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { playNaturalVoice } from '@/lib/natural-voice';
import type { ExamVocabularyWord } from '@/lib/exam-content';

type WordWithMeta = ExamVocabularyWord & {
  source: string;
  level: string;
};

type WordResult = {
  word: string;
  correct: boolean;
  timeSpent: number;
};

export default function WordTypingTrainer({
  words,
  language,
}: {
  words: WordWithMeta[];
  language: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<WordResult[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [successPulse, setSuccessPulse] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;
  const correctCount = results.filter((r) => r.correct).length;
  const accuracy = results.length > 0 ? (correctCount / results.length) * 100 : 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  useEffect(() => {
    if (currentWord) {
      playPronunciation();
    }
  }, [currentIndex]);

  const playPronunciation = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (currentWord) {
      playNaturalVoice(currentWord.word, 'word').then((audio) => {
        audioRef.current = audio;
      });
    }
  }, [currentWord]);

  const handleInput = (value: string) => {
    if (!startTime) {
      setStartTime(Date.now());
    }

    setInput(value);

    // Real-time validation
    const targetWord = currentWord.word.toLowerCase();
    const inputLower = value.toLowerCase();

    // Check if input matches so far
    if (inputLower === targetWord) {
      // Correct! Move to next word
      const timeSpent = startTime ? Date.now() - startTime : 0;
      setResults([...results, { word: currentWord.word, correct: true, timeSpent }]);

      // Success animation
      setSuccessPulse(true);
      setTimeout(() => setSuccessPulse(false), 500);

      // Move to next word
      setTimeout(() => {
        if (currentIndex < words.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setInput('');
          setStartTime(null);
          setShowMeaning(false);
        } else {
          setIsComplete(true);
        }
      }, 300);
    } else if (!targetWord.startsWith(inputLower) && value.length > 0) {
      // Wrong character typed
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    }
  };

  const skipWord = () => {
    const timeSpent = startTime ? Date.now() - startTime : 0;
    setResults([...results, { word: currentWord.word, correct: false, timeSpent }]);

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setInput('');
      setStartTime(null);
      setShowMeaning(false);
    } else {
      setIsComplete(true);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setInput('');
    setResults([]);
    setStartTime(null);
    setShowMeaning(false);
    setIsComplete(false);
  };

  if (isComplete) {
    const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);
    const avgTime = totalTime / results.length;

    return (
      <div className="word-typing-complete">
        <div className="complete-card">
          <h1>🎉 训练完成！</h1>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{results.length}</div>
              <div className="stat-label">总单词数</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{correctCount}</div>
              <div className="stat-label">正确数</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{accuracy.toFixed(1)}%</div>
              <div className="stat-label">准确率</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{(avgTime / 1000).toFixed(1)}s</div>
              <div className="stat-label">平均用时</div>
            </div>
          </div>
          <button onClick={restart} className="restart-btn">
            重新开始
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="word-typing-trainer">
      {/* Progress Ring */}
      <div className="progress-ring-container">
        <svg className="progress-ring" width="120" height="120">
          <circle
            className="progress-ring-bg"
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <circle
            className="progress-ring-fill"
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
            transform="rotate(-90 60 60)"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
        <div className="progress-text">
          <div className="progress-number">{currentIndex + 1}</div>
          <div className="progress-total">/ {words.length}</div>
        </div>
      </div>

      {/* Word Card */}
      <div className={`word-card ${errorShake ? 'shake' : ''} ${successPulse ? 'success' : ''}`}>
        {/* Phonetic */}
        {currentWord.phonetic && (
          <div className="word-phonetic">{currentWord.phonetic}</div>
        )}

        {/* Meaning Toggle */}
        <button
          className="meaning-toggle"
          onClick={() => setShowMeaning(!showMeaning)}
        >
          {showMeaning ? '隐藏释义' : '显示释义'}
        </button>

        {/* Meaning */}
        {showMeaning && (
          <div className="word-meaning">
            <div className="meaning-zh">{currentWord.meaningZh}</div>
            <div className="meaning-en">{currentWord.meaningEn}</div>
            {currentWord.collocation && (
              <div className="collocation">搭配: {currentWord.collocation}</div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            className="word-input"
            placeholder="开始输入单词..."
            autoComplete="off"
            spellCheck={false}
          />
          <div className="input-hint">
            {input.length > 0 && (
              <>
                {currentWord.word.split('').map((char, i) => {
                  const inputChar = input[i]?.toLowerCase();
                  const targetChar = char.toLowerCase();

                  if (i < input.length) {
                    return (
                      <span
                        key={i}
                        className={inputChar === targetChar ? 'correct' : 'incorrect'}
                      >
                        {char}
                      </span>
                    );
                  }
                  return (
                    <span key={i} className="pending">
                      {char}
                    </span>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={playPronunciation} className="action-btn pronunciation-btn">
            🔊 发音
          </button>
          <button onClick={skipWord} className="action-btn skip-btn">
            跳过
          </button>
        </div>

        {/* Meta Info */}
        <div className="word-meta">
          <span className="word-source">{currentWord.source}</span>
          <span className="word-level">{currentWord.level}</span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-label">准确率</span>
          <span className="stat-value">{accuracy.toFixed(0)}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">已完成</span>
          <span className="stat-value">{results.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">正确</span>
          <span className="stat-value correct-count">{correctCount}</span>
        </div>
      </div>
    </div>
  );
}
