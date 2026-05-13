"use client";

import { useCallback, useEffect, useState } from "react";
import { localizedHref, type InterfaceLanguage } from "@/lib/language";

const typeLabel: Record<InterfaceLanguage, Record<string, string>> = {
  en: {
    MULTIPLE_CHOICE: "Multiple choice",
    FILL_BLANK: "Fill blank",
    CODE_READING: "Code reading",
  },
  zh: {
    MULTIPLE_CHOICE: "选择题",
    FILL_BLANK: "填空题",
    CODE_READING: "代码阅读",
  },
  ja: {
    MULTIPLE_CHOICE: "選択問題",
    FILL_BLANK: "穴埋め",
    CODE_READING: "コード読解",
  },
  ko: {
    MULTIPLE_CHOICE: "선택 문제",
    FILL_BLANK: "빈칸 채우기",
    CODE_READING: "코드 읽기",
  },
  es: {
    MULTIPLE_CHOICE: "Opcion multiple",
    FILL_BLANK: "Rellenar hueco",
    CODE_READING: "Leer codigo",
  },
  fr: {
    MULTIPLE_CHOICE: "Choix multiple",
    FILL_BLANK: "Texte a trou",
    CODE_READING: "Lecture code",
  },
  de: {
    MULTIPLE_CHOICE: "Auswahlfrage",
    FILL_BLANK: "Luecke",
    CODE_READING: "Code lesen",
  },
  pt: {
    MULTIPLE_CHOICE: "Multipla escolha",
    FILL_BLANK: "Preencher lacuna",
    CODE_READING: "Ler codigo",
  },
  ru: {
    MULTIPLE_CHOICE: "Выбор",
    FILL_BLANK: "Пропуск",
    CODE_READING: "Чтение кода",
  },
  ar: {
    MULTIPLE_CHOICE: "اختيار من متعدد",
    FILL_BLANK: "ملء الفراغ",
    CODE_READING: "قراءة كود",
  },
  hi: {
    MULTIPLE_CHOICE: "बहुविकल्प",
    FILL_BLANK: "रिक्त भरें",
    CODE_READING: "कोड पढ़ना",
  },
  id: {
    MULTIPLE_CHOICE: "Pilihan ganda",
    FILL_BLANK: "Isian",
    CODE_READING: "Baca kode",
  },
  vi: {
    MULTIPLE_CHOICE: "Lua chon",
    FILL_BLANK: "Dien khuyet",
    CODE_READING: "Doc ma",
  },
  th: {
    MULTIPLE_CHOICE: "หลายตัวเลือก",
    FILL_BLANK: "เติมคำ",
    CODE_READING: "อ่านโค้ด",
  },
  tr: {
    MULTIPLE_CHOICE: "Coktan secmeli",
    FILL_BLANK: "Bosluk doldur",
    CODE_READING: "Kod okuma",
  },
  it: {
    MULTIPLE_CHOICE: "Scelta multipla",
    FILL_BLANK: "Completa",
    CODE_READING: "Lettura codice",
  },
  nl: {
    MULTIPLE_CHOICE: "Meerkeuze",
    FILL_BLANK: "Invullen",
    CODE_READING: "Code lezen",
  },
  pl: {
    MULTIPLE_CHOICE: "Wybor",
    FILL_BLANK: "Luka",
    CODE_READING: "Czytanie kodu",
  },
};

const copy: Record<InterfaceLanguage, {
  score: string;
  completed: string;
  correct: string;
  exercise: string;
  placeholder: string;
  submit: string;
  saveWrong: string;
  localWrong: string;
  saved: string;
  saveFailed: string;
  submitFailed: string;
  correctResult: string;
  incorrectLocal: string;
  incorrectSaved: string;
  correctAnswer: string;
  timerLabel: string;
  timeoutResult: string;
  locked: string;
}> = {
  en: {
    score: "Score",
    completed: "Completed",
    correct: "Correct",
    exercise: "Exercise",
    placeholder: "Enter answer",
    submit: "Submit",
    saveWrong: "Save wrong item",
    localWrong: "Database backed course questions can be saved to the wrong bank",
    saved: "Saved to wrong bank",
    saveFailed: "Save failed",
    submitFailed: "Submit failed",
    correctResult: "Correct",
    incorrectLocal: "Incorrect local practice is not saved",
    incorrectSaved: "Incorrect saved to wrong bank",
    correctAnswer: "Correct answer",
    timerLabel: "5 second choice limit",
    timeoutResult: "Timed out and counted wrong",
    locked: "Finish the current timed question first",
  },
  zh: {
    score: "得分",
    completed: "已完成",
    correct: "正确",
    exercise: "练习",
    placeholder: "输入答案",
    submit: "提交",
    saveWrong: "保存错题",
    localWrong: "数据库课程题可以保存到错题本",
    saved: "已保存到错题本",
    saveFailed: "保存失败",
    submitFailed: "提交失败",
    correctResult: "正确",
    incorrectLocal: "本地练习错误不会保存",
    incorrectSaved: "错误已保存到错题本",
    correctAnswer: "正确答案",
    timerLabel: "选择题 5 秒限时",
    timeoutResult: "超时 已算错",
    locked: "先完成当前限时题",
  },
  ja: {
    score: "スコア",
    completed: "完了",
    correct: "正解",
    exercise: "練習",
    placeholder: "答えを入力",
    submit: "送信",
    saveWrong: "間違いに保存",
    localWrong: "データベース付き問題は復習ノートに保存できます",
    saved: "復習ノートに保存しました",
    saveFailed: "保存に失敗しました",
    submitFailed: "送信に失敗しました",
    correctResult: "正解",
    incorrectLocal: "ローカル練習の間違いは保存されません",
    incorrectSaved: "間違いを復習ノートに保存しました",
    correctAnswer: "正解",
    timerLabel: "選択問題 5 秒制限",
    timeoutResult: "時間切れ 不正解",
    locked: "現在の時間制限問題を先に完了してください",
  },
  ko: {
    score: "점수",
    completed: "완료",
    correct: "정답",
    exercise: "문제",
    placeholder: "답 입력",
    submit: "제출",
    saveWrong: "오답 저장",
    localWrong: "데이터베이스 문제는 오답 노트에 저장할 수 있습니다",
    saved: "오답 노트에 저장됨",
    saveFailed: "저장 실패",
    submitFailed: "제출 실패",
    correctResult: "정답",
    incorrectLocal: "로컬 연습 오답은 저장되지 않습니다",
    incorrectSaved: "오답이 저장되었습니다",
    correctAnswer: "정답",
    timerLabel: "선택 문제 5초 제한",
    timeoutResult: "시간 초과 오답 처리",
    locked: "현재 제한 시간 문제를 먼저 끝내세요",
  },
  es: {
    score: "Puntuacion",
    completed: "Completado",
    correct: "Correcto",
    exercise: "Ejercicio",
    placeholder: "Escribe respuesta",
    submit: "Enviar",
    saveWrong: "Guardar error",
    localWrong: "Las preguntas con base de datos pueden guardarse en errores",
    saved: "Guardado en errores",
    saveFailed: "No se guardo",
    submitFailed: "Envio fallido",
    correctResult: "Correcto",
    incorrectLocal: "El error local no se guarda",
    incorrectSaved: "Error guardado",
    correctAnswer: "Respuesta correcta",
    timerLabel: "Limite de 5 segundos",
    timeoutResult: "Tiempo agotado cuenta como error",
    locked: "Termina primero la pregunta con tiempo",
  },
  fr: {
    score: "Score",
    completed: "Termine",
    correct: "Correct",
    exercise: "Exercice",
    placeholder: "Entrer reponse",
    submit: "Envoyer",
    saveWrong: "Sauver erreur",
    localWrong: "Les questions base de donnees peuvent aller dans les erreurs",
    saved: "Sauve dans les erreurs",
    saveFailed: "Sauvegarde echouee",
    submitFailed: "Envoi echoue",
    correctResult: "Correct",
    incorrectLocal: "Erreur locale non sauvegardee",
    incorrectSaved: "Erreur sauvegardee",
    correctAnswer: "Bonne reponse",
    timerLabel: "Limite 5 secondes",
    timeoutResult: "Temps ecoule compte faux",
    locked: "Termine la question chronometree",
  },
  de: {
    score: "Punktzahl",
    completed: "Abgeschlossen",
    correct: "Richtig",
    exercise: "Aufgabe",
    placeholder: "Antwort eingeben",
    submit: "Senden",
    saveWrong: "Fehler speichern",
    localWrong: "Datenbankfragen koennen in der Fehlerliste gespeichert werden",
    saved: "In Fehlerliste gespeichert",
    saveFailed: "Speichern fehlgeschlagen",
    submitFailed: "Senden fehlgeschlagen",
    correctResult: "Richtig",
    incorrectLocal: "Lokale Uebungsfehler werden nicht gespeichert",
    incorrectSaved: "Fehler gespeichert",
    correctAnswer: "Richtige Antwort",
    timerLabel: "5 Sekunden Limit",
    timeoutResult: "Zeit abgelaufen und falsch gewertet",
    locked: "Beende zuerst die Zeitfrage",
  },
  pt: {
    score: "Pontuacao",
    completed: "Concluido",
    correct: "Correto",
    exercise: "Exercicio",
    placeholder: "Digite resposta",
    submit: "Enviar",
    saveWrong: "Salvar erro",
    localWrong: "Questoes com banco podem ser salvas nos erros",
    saved: "Salvo nos erros",
    saveFailed: "Falha ao salvar",
    submitFailed: "Falha ao enviar",
    correctResult: "Correto",
    incorrectLocal: "Erro local nao e salvo",
    incorrectSaved: "Erro salvo",
    correctAnswer: "Resposta correta",
    timerLabel: "Limite de 5 segundos",
    timeoutResult: "Tempo esgotado conta errado",
    locked: "Conclua a pergunta cronometrada",
  },
  ru: {
    score: "Счет",
    completed: "Готово",
    correct: "Верно",
    exercise: "Задание",
    placeholder: "Введите ответ",
    submit: "Отправить",
    saveWrong: "Сохранить ошибку",
    localWrong: "Вопросы из базы можно сохранить в ошибки",
    saved: "Сохранено в ошибки",
    saveFailed: "Не удалось сохранить",
    submitFailed: "Отправка не удалась",
    correctResult: "Верно",
    incorrectLocal: "Локальная ошибка не сохраняется",
    incorrectSaved: "Ошибка сохранена",
    correctAnswer: "Верный ответ",
    timerLabel: "Лимит 5 секунд",
    timeoutResult: "Время вышло ответ неверный",
    locked: "Сначала завершите вопрос с таймером",
  },
  ar: {
    score: "النتيجة",
    completed: "مكتمل",
    correct: "صحيح",
    exercise: "تدريب",
    placeholder: "أدخل الإجابة",
    submit: "إرسال",
    saveWrong: "حفظ في دفتر الأخطاء",
    localWrong: "يمكن حفظ أسئلة الدورة المدعومة بقاعدة بيانات في دفتر الأخطاء",
    saved: "تم الحفظ في دفتر الأخطاء",
    saveFailed: "فشل الحفظ",
    submitFailed: "فشل الإرسال",
    correctResult: "صحيح",
    incorrectLocal: "خطأ التدريب المحلي لا يتم حفظه",
    incorrectSaved: "تم حفظ الخطأ في دفتر الأخطاء",
    correctAnswer: "الإجابة الصحيحة",
    timerLabel: "اختيار خلال 5 ثوان",
    timeoutResult: "انتهى الوقت واحتسب خطأ",
    locked: "أكمل السؤال المحدد بالوقت أولا",
  },
  hi: {
    score: "स्कोर",
    completed: "पूरा",
    correct: "सही",
    exercise: "अभ्यास",
    placeholder: "उत्तर लिखें",
    submit: "जमा करें",
    saveWrong: "गलत आइटम सेव करें",
    localWrong: "डेटाबेस प्रश्न wrong bank में सेव हो सकते हैं",
    saved: "Wrong bank में सेव",
    saveFailed: "सेव विफल",
    submitFailed: "जमा विफल",
    correctResult: "सही",
    incorrectLocal: "लोकल अभ्यास गलती सेव नहीं होती",
    incorrectSaved: "गलती सेव हुई",
    correctAnswer: "सही उत्तर",
    timerLabel: "5 सेकंड सीमा",
    timeoutResult: "समय खत्म गलत माना गया",
    locked: "पहले timed question पूरा करें",
  },
  id: {
    score: "Skor",
    completed: "Selesai",
    correct: "Benar",
    exercise: "Latihan",
    placeholder: "Masukkan jawaban",
    submit: "Kirim",
    saveWrong: "Simpan salah",
    localWrong: "Soal database bisa disimpan ke bank salah",
    saved: "Tersimpan di bank salah",
    saveFailed: "Gagal simpan",
    submitFailed: "Gagal kirim",
    correctResult: "Benar",
    incorrectLocal: "Latihan lokal salah tidak disimpan",
    incorrectSaved: "Kesalahan disimpan",
    correctAnswer: "Jawaban benar",
    timerLabel: "Batas 5 detik",
    timeoutResult: "Waktu habis dihitung salah",
    locked: "Selesaikan soal berbatas waktu dulu",
  },
  vi: {
    score: "Diem",
    completed: "Hoan tat",
    correct: "Dung",
    exercise: "Bai tap",
    placeholder: "Nhap dap an",
    submit: "Gui",
    saveWrong: "Luu cau sai",
    localWrong: "Cau hoi co database co the luu vao so sai",
    saved: "Da luu vao so sai",
    saveFailed: "Luu that bai",
    submitFailed: "Gui that bai",
    correctResult: "Dung",
    incorrectLocal: "Loi luyen tap cuc bo khong duoc luu",
    incorrectSaved: "Da luu cau sai",
    correctAnswer: "Dap an dung",
    timerLabel: "Gioi han 5 giay",
    timeoutResult: "Het gio tinh sai",
    locked: "Hoan thanh cau dang tinh gio truoc",
  },
  th: {
    score: "คะแนน",
    completed: "เสร็จแล้ว",
    correct: "ถูก",
    exercise: "แบบฝึก",
    placeholder: "ใส่คำตอบ",
    submit: "ส่ง",
    saveWrong: "บันทึกข้อผิด",
    localWrong: "คำถามจากฐานข้อมูลบันทึกลงสมุดผิดได้",
    saved: "บันทึกลงสมุดผิดแล้ว",
    saveFailed: "บันทึกไม่สำเร็จ",
    submitFailed: "ส่งไม่สำเร็จ",
    correctResult: "ถูก",
    incorrectLocal: "แบบฝึก local ไม่บันทึกข้อผิด",
    incorrectSaved: "บันทึกข้อผิดแล้ว",
    correctAnswer: "คำตอบที่ถูก",
    timerLabel: "จำกัด 5 วินาที",
    timeoutResult: "หมดเวลา นับว่าผิด",
    locked: "ทำข้อจับเวลาก่อน",
  },
  tr: {
    score: "Puan",
    completed: "Tamamlandi",
    correct: "Dogru",
    exercise: "Alistirma",
    placeholder: "Cevap gir",
    submit: "Gonder",
    saveWrong: "Yanlisi kaydet",
    localWrong: "Veritabani sorulari yanlis defterine kaydedilebilir",
    saved: "Yanlis defterine kaydedildi",
    saveFailed: "Kayit basarisiz",
    submitFailed: "Gonderme basarisiz",
    correctResult: "Dogru",
    incorrectLocal: "Yerel pratik yanlisi kaydedilmez",
    incorrectSaved: "Yanlis kaydedildi",
    correctAnswer: "Dogru cevap",
    timerLabel: "5 saniye siniri",
    timeoutResult: "Sure bitti yanlis sayildi",
    locked: "Once sureli soruyu bitir",
  },
  it: {
    score: "Punteggio",
    completed: "Completato",
    correct: "Corretto",
    exercise: "Esercizio",
    placeholder: "Inserisci risposta",
    submit: "Invia",
    saveWrong: "Salva errore",
    localWrong: "Le domande database possono andare nel registro errori",
    saved: "Salvato negli errori",
    saveFailed: "Salvataggio fallito",
    submitFailed: "Invio fallito",
    correctResult: "Corretto",
    incorrectLocal: "Errore locale non salvato",
    incorrectSaved: "Errore salvato",
    correctAnswer: "Risposta corretta",
    timerLabel: "Limite 5 secondi",
    timeoutResult: "Tempo scaduto conta errato",
    locked: "Completa prima la domanda a tempo",
  },
  nl: {
    score: "Score",
    completed: "Voltooid",
    correct: "Goed",
    exercise: "Oefening",
    placeholder: "Voer antwoord in",
    submit: "Indienen",
    saveWrong: "Fout opslaan",
    localWrong: "Databasevragen kunnen naar de foutenlijst",
    saved: "Opgeslagen in foutenlijst",
    saveFailed: "Opslaan mislukt",
    submitFailed: "Indienen mislukt",
    correctResult: "Goed",
    incorrectLocal: "Lokale oefenfout wordt niet opgeslagen",
    incorrectSaved: "Fout opgeslagen",
    correctAnswer: "Juist antwoord",
    timerLabel: "Limiet 5 seconden",
    timeoutResult: "Tijd voorbij telt fout",
    locked: "Maak eerst de tijdvraag af",
  },
  pl: {
    score: "Wynik",
    completed: "Ukonczone",
    correct: "Poprawne",
    exercise: "Zadanie",
    placeholder: "Wpisz odpowiedz",
    submit: "Wyslij",
    saveWrong: "Zapisz blad",
    localWrong: "Pytania z bazy mozna zapisac w bledach",
    saved: "Zapisano w bledach",
    saveFailed: "Zapis nieudany",
    submitFailed: "Wyslanie nieudane",
    correctResult: "Poprawne",
    incorrectLocal: "Blad lokalny nie jest zapisany",
    incorrectSaved: "Blad zapisany",
    correctAnswer: "Poprawna odpowiedz",
    timerLabel: "Limit 5 sekund",
    timeoutResult: "Czas minal wynik bledny",
    locked: "Najpierw zakoncz pytanie na czas",
  },
};

type Option = { id: string; label: string; content: string };
type Question = {
  id: string;
  type: string;
  prompt: string;
  codeSnippet: string | null;
  difficulty: string;
  answer?: string;
  explanation?: string;
  options: Option[];
};

export default function QuizBlock({
  questions,
  lessonId,
  language = "en",
  strictChoiceTimer = false,
}: {
  questions: Question[];
  lessonId: string;
  language?: InterfaceLanguage;
  strictChoiceTimer?: boolean;
}) {
  const uiLanguage = language;
  const t = copy[uiLanguage];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, { correct: boolean; explanation: string; answer: string }>>({});
  const [message, setMessage] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const answered = Object.keys(results).length;
  const correct = Object.values(results).filter((result) => result.correct).length;
  const score = answered ? Math.round((correct / questions.length) * 100) : 0;
  const activeQuestion = questions[activeIndex];

  const moveToNextQuestion = useCallback((questionId: string) => {
    const index = questions.findIndex((question) => question.id === questionId);
    if (index >= 0) setActiveIndex((current) => Math.max(current, Math.min(index + 1, questions.length - 1)));
  }, [questions]);

  async function submit(questionId: string, answerOverride?: string) {
    const localQuestion = questions.find((question) => question.id === questionId);
    const submittedAnswer = answerOverride ?? (answers[questionId] || "");
    if (localQuestion?.id.startsWith("fallback-") && localQuestion.answer) {
      const actual = submittedAnswer.trim().replace(/\s+/g, " ").toLowerCase();
      const expected = localQuestion.answer.trim().replace(/\s+/g, " ").toLowerCase();
      setResults((current) => ({
        ...current,
        [questionId]: {
          correct: actual === expected,
          explanation: localQuestion.explanation || "",
          answer: localQuestion.answer || "",
        },
      }));
      moveToNextQuestion(questionId);
      return;
    }

    setSaving(true);
    const response = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, answer: submittedAnswer, lessonId }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (response.status === 401) return window.location.assign(localizedHref("/login", language));
    if (data.result) {
      setResults((current) => ({ ...current, [questionId]: data.result }));
      moveToNextQuestion(questionId);
    }
    if (!response.ok) setMessage((current) => ({ ...current, [questionId]: data.message || t.submitFailed }));
  }

  async function saveWrong(questionId: string) {
    if (questionId.startsWith("fallback-")) {
      setMessage((current) => ({
        ...current,
        [questionId]: t.localWrong,
      }));
      return;
    }

    const response = await fetch("/api/wrong", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, note: "Saved manually" }),
    });
    if (response.status === 401) return window.location.assign(localizedHref("/login", language));
    setMessage((current) => ({ ...current, [questionId]: response.ok ? t.saved : t.saveFailed }));
  }

  useEffect(() => {
    if (!strictChoiceTimer || !activeQuestion || activeQuestion.options.length === 0 || results[activeQuestion.id]) {
      const reset = window.setTimeout(() => setTimeLeft(5), 0);
      return () => window.clearTimeout(reset);
    }

    const deadline = Date.now() + 5000;
    const reset = window.setTimeout(() => setTimeLeft(5), 0);
    const tick = window.setInterval(() => {
      setTimeLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, 200);
    const timeout = window.setTimeout(() => {
      setResults((current) => {
        if (current[activeQuestion.id]) return current;
        return {
          ...current,
          [activeQuestion.id]: {
            correct: false,
            explanation: `${t.timeoutResult}. ${activeQuestion.explanation || ""}`,
            answer: activeQuestion.answer || "",
          },
        };
      });
      setMessage((current) => ({ ...current, [activeQuestion.id]: t.timeoutResult }));
      moveToNextQuestion(activeQuestion.id);
    }, 5000);

    return () => {
      window.clearTimeout(reset);
      window.clearInterval(tick);
      window.clearTimeout(timeout);
    };
  }, [activeQuestion, moveToNextQuestion, results, strictChoiceTimer, t.timeoutResult]);

  return (
    <div className="space-y-4">
      {answered > 0 && (
        <div className="border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          {t.score} {score}  {t.completed} {answered}/{questions.length}  {t.correct} {correct}
        </div>
      )}
      {questions.map((q, index) => {
        const result = results[q.id];
        const isActive = !strictChoiceTimer || index === activeIndex;
        const locked = strictChoiceTimer && !isActive && !result;
        const choiceTimed = strictChoiceTimer && isActive && q.options.length > 0 && !result;

        return (
        <article key={q.id} className={`rounded-[20px] border border-slate-200 bg-white p-5 ${locked ? "opacity-55" : ""}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow">{t.exercise} {index + 1}  {typeLabel[uiLanguage][q.type] || q.type}</p>
            {choiceTimed ? (
              <div className={`vocab-timer min-w-[180px] ${timeLeft <= 2 ? "urgent" : ""}`} aria-label={t.timerLabel}>
                <span>{t.timerLabel}</span>
                <strong>{timeLeft}s</strong>
                <i style={{ width: `${Math.max(0, Math.min(100, (timeLeft / 5) * 100))}%` }} />
              </div>
            ) : locked ? (
              <span className="dense-status">{t.locked}</span>
            ) : null}
          </div>
          <p className="mt-3 whitespace-pre-wrap leading-7">{q.prompt}</p>
          {q.codeSnippet && <pre className="mt-3 overflow-x-auto rounded-[18px] bg-slate-950 p-4 text-sm text-white">{q.codeSnippet}</pre>}

          {q.options.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {q.options.map((option) => (
                <label key={option.id} className="flex gap-3 rounded-[18px] border border-slate-200 bg-slate-50 p-3">
                  <input
                    type="radio"
                    name={q.id}
                    value={option.content}
                    disabled={!isActive || Boolean(result)}
                    onChange={() => {
                      setAnswers({ ...answers, [q.id]: option.content });
                      if (strictChoiceTimer) void submit(q.id, option.content);
                    }}
                  />
                  <span>{option.label}. {option.content}</span>
                </label>
              ))}
            </div>
          ) : (
            <input
              value={answers[q.id] || ""}
              disabled={!isActive || Boolean(result)}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              placeholder={t.placeholder}
              className="mt-4 w-full rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-[color:var(--accent)] disabled:opacity-60"
            />
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={saving || !isActive || Boolean(result) || (strictChoiceTimer && q.options.length > 0)} onClick={() => submit(q.id)} className="rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{t.submit}</button>
            <button onClick={() => saveWrong(q.id)} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-500">{t.saveWrong}</button>
          </div>

          {message[q.id] && <p className="mt-3 text-sm text-[color:var(--accent-link)]">{message[q.id]}</p>}
          {result && (
            <div className={`mt-4 rounded-[18px] border p-4 text-sm ${result.correct ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
              <p className="font-semibold">{result.correct ? t.correctResult : q.id.startsWith("fallback-") ? t.incorrectLocal : t.incorrectSaved}</p>
              <p className="mt-2">{t.correctAnswer} {result.answer}</p>
              <p className="mt-2">{result.explanation}</p>
            </div>
          )}
        </article>
        );
      })}
    </div>
  );
}
