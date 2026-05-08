"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { InterfaceLanguage } from "@/lib/language";
import type { SurvivalPhraseKey } from "@/lib/world-language-content";

type Phrase = {
  key: SurvivalPhraseKey;
  label: string;
  text: string;
};

type WorldLanguageStarterTrainerProps = {
  languageSlug: string;
  nativeName: string;
  languageName: string;
  phrases: Phrase[];
  interfaceLanguage?: InterfaceLanguage;
};

type TrainerCopy = {
  initialMessage: string;
  unsupported: string;
  noVoice: string;
  nextMessage: string;
  passMessage: string;
  retryMessage: string;
  switchedMessage: string;
  eyebrow: string;
  title: (nativeName: string) => string;
  stats: (correct: number, wrong: number) => string;
  hidden: string;
  pronounce: string;
  typeLabel: string;
  placeholder: string;
  check: string;
  slow: string;
  hideShadow: string;
  showShadow: string;
  hideAnswer: string;
  showAnswer: string;
  next: string;
  shortcuts: string;
  shadow: string;
  shadowBody: string;
};

const baseTrainerCopy: Record<"en" | "zh" | "ja" | "ar", TrainerCopy> = {
  en: {
    initialMessage: "Listen first then use the shadow and type the full phrase",
    unsupported: "This browser does not support speech. Keep practicing with spelling.",
    noVoice: "No system voice for this language. Use spelling practice first.",
    nextMessage: "Next phrase. Listen once first.",
    passMessage: "Passed. Moving to the next phrase.",
    retryMessage: "Almost. Listen again slowly.",
    switchedMessage: "Phrase switched.",
    eyebrow: "First lesson trainer",
    title: (nativeName) => `${nativeName} listening and spelling`,
    stats: (correct, wrong) => `Correct ${correct} Wrong ${wrong}`,
    hidden: "Listen first. No answer yet.",
    pronounce: "Pronounce",
    typeLabel: "Type this phrase",
    placeholder: "Listen then type the complete phrase",
    check: "Check",
    slow: "Slow",
    hideShadow: "Hide shadow",
    showShadow: "Show shadow",
    hideAnswer: "Hide answer",
    showAnswer: "Show answer",
    next: "Next phrase",
    shortcuts: "Shortcuts",
    shadow: "Shadow",
    shadowBody: "Read the outline first, then type the full phrase.",
  },
  zh: {
    initialMessage: "先听 再看影子 最后打出来",
    unsupported: "当前浏览器不支持发音 继续看句子练拼写",
    noVoice: "系统没有这门语言的语音包 先用拼写练习",
    nextMessage: "下一句 先听一遍",
    passMessage: "通过 自动下一句",
    retryMessage: "还差一点 慢速再听一遍",
    switchedMessage: "已切换短句",
    eyebrow: "第一课训练器",
    title: (nativeName) => `${nativeName} 听音拼写`,
    stats: (correct, wrong) => `对 ${correct} 错 ${wrong}`,
    hidden: "先听 不看答案",
    pronounce: "发音",
    typeLabel: "打出这句",
    placeholder: "听音后输入完整短句",
    check: "检查",
    slow: "慢速",
    hideShadow: "隐藏影子",
    showShadow: "显示影子",
    hideAnswer: "收起答案",
    showAnswer: "看答案",
    next: "下一句",
    shortcuts: "快捷键",
    shadow: "影子",
    shadowBody: "先看轮廓 再打完整句",
  },
  ja: {
    initialMessage: "まず聞き、影を見て、最後に全文を入力します",
    unsupported: "このブラウザーは発音に対応していません。綴り練習を続けてください。",
    noVoice: "この言語のシステム音声がありません。先に綴りで練習します。",
    nextMessage: "次の文です。まず一度聞きます。",
    passMessage: "通過しました。次の文へ進みます。",
    retryMessage: "あと少しです。ゆっくりもう一度聞きます。",
    switchedMessage: "文を切り替えました。",
    eyebrow: "第一課トレーナー",
    title: (nativeName) => `${nativeName} 聞き取りと綴り`,
    stats: (correct, wrong) => `正解 ${correct} ミス ${wrong}`,
    hidden: "まず聞く 答えはまだ見ない",
    pronounce: "発音",
    typeLabel: "この文を入力",
    placeholder: "聞いてから全文を入力",
    check: "確認",
    slow: "ゆっくり",
    hideShadow: "影を隠す",
    showShadow: "影を表示",
    hideAnswer: "答えを隠す",
    showAnswer: "答えを見る",
    next: "次の文",
    shortcuts: "ショートカット",
    shadow: "影",
    shadowBody: "輪郭を見てから全文を入力します。",
  },
  ar: {
    initialMessage: "استمع أولا ثم استخدم الظل واكتب العبارة كاملة",
    unsupported: "المتصفح لا يدعم النطق. تابع التدريب على الكتابة.",
    noVoice: "لا توجد حزمة صوت لهذه اللغة في النظام. تدرب على الكتابة أولا.",
    nextMessage: "العبارة التالية. استمع مرة أولا.",
    passMessage: "نجحت. الانتقال إلى العبارة التالية.",
    retryMessage: "اقتربت. استمع ببطء مرة أخرى.",
    switchedMessage: "تم تبديل العبارة.",
    eyebrow: "مدرب الدرس الأول",
    title: (nativeName) => `استماع وكتابة ${nativeName}`,
    stats: (correct, wrong) => `صحيح ${correct} خطأ ${wrong}`,
    hidden: "استمع أولا دون رؤية الإجابة",
    pronounce: "النطق",
    typeLabel: "اكتب هذه العبارة",
    placeholder: "استمع ثم اكتب العبارة كاملة",
    check: "تحقق",
    slow: "بطيء",
    hideShadow: "إخفاء الظل",
    showShadow: "إظهار الظل",
    hideAnswer: "إخفاء الإجابة",
    showAnswer: "عرض الإجابة",
    next: "العبارة التالية",
    shortcuts: "اختصارات",
    shadow: "الظل",
    shadowBody: "اقرأ الشكل أولا ثم اكتب العبارة كاملة.",
  },
};

const trainerCopy: Record<InterfaceLanguage, TrainerCopy> = {
  ...baseTrainerCopy,
  ko: {
    initialMessage: "먼저 듣고 그림자 문장을 본 뒤 전체 문장을 입력하세요",
    unsupported: "이 브라우저는 음성을 지원하지 않습니다. 철자 연습을 계속하세요.",
    noVoice: "이 언어의 시스템 음성이 없습니다. 먼저 철자 연습을 하세요.",
    nextMessage: "다음 문장입니다. 먼저 한 번 들으세요.",
    passMessage: "통과했습니다. 다음 문장으로 이동합니다.",
    retryMessage: "거의 맞았습니다. 천천히 다시 들어보세요.",
    switchedMessage: "문장을 바꿨습니다.",
    eyebrow: "첫 수업 트레이너",
    title: (nativeName) => `${nativeName} 듣기와 철자`,
    stats: (correct, wrong) => `정답 ${correct} 오답 ${wrong}`,
    hidden: "먼저 듣기. 아직 답은 보지 않습니다.",
    pronounce: "발음",
    typeLabel: "이 문장 입력",
    placeholder: "듣고 전체 문장을 입력",
    check: "확인",
    slow: "느리게",
    hideShadow: "그림자 숨기기",
    showShadow: "그림자 보기",
    hideAnswer: "답 숨기기",
    showAnswer: "답 보기",
    next: "다음 문장",
    shortcuts: "단축키",
    shadow: "그림자",
    shadowBody: "윤곽을 먼저 보고 전체 문장을 입력하세요.",
  },
  es: {
    initialMessage: "Escucha primero usa la sombra y escribe la frase completa",
    unsupported: "Este navegador no soporta voz. Sigue practicando ortografia.",
    noVoice: "No hay voz del sistema para este idioma. Practica escritura primero.",
    nextMessage: "Siguiente frase. Escucha una vez primero.",
    passMessage: "Aprobado. Pasando a la siguiente frase.",
    retryMessage: "Casi. Escucha otra vez lentamente.",
    switchedMessage: "Frase cambiada.",
    eyebrow: "Entrenador de primera leccion",
    title: (nativeName) => `${nativeName} escucha y escritura`,
    stats: (correct, wrong) => `Correctas ${correct} Errores ${wrong}`,
    hidden: "Escucha primero. Sin respuesta todavia.",
    pronounce: "Pronunciar",
    typeLabel: "Escribe esta frase",
    placeholder: "Escucha y escribe la frase completa",
    check: "Revisar",
    slow: "Lento",
    hideShadow: "Ocultar sombra",
    showShadow: "Mostrar sombra",
    hideAnswer: "Ocultar respuesta",
    showAnswer: "Ver respuesta",
    next: "Siguiente frase",
    shortcuts: "Atajos",
    shadow: "Sombra",
    shadowBody: "Lee el contorno primero y luego escribe la frase completa.",
  },
  fr: {
    initialMessage: "Ecoute d abord puis utilise l ombre et tape la phrase complete",
    unsupported: "Ce navigateur ne supporte pas la voix. Continue avec l orthographe.",
    noVoice: "Aucune voix systeme pour cette langue. Pratique d abord la saisie.",
    nextMessage: "Phrase suivante. Ecoute une fois d abord.",
    passMessage: "Reussi. Passage a la phrase suivante.",
    retryMessage: "Presque. Reecoute lentement.",
    switchedMessage: "Phrase changee.",
    eyebrow: "Entraineur premiere lecon",
    title: (nativeName) => `${nativeName} ecoute et orthographe`,
    stats: (correct, wrong) => `Correct ${correct} Erreurs ${wrong}`,
    hidden: "Ecoute d abord. Pas encore de reponse.",
    pronounce: "Prononcer",
    typeLabel: "Tape cette phrase",
    placeholder: "Ecoute puis tape la phrase complete",
    check: "Verifier",
    slow: "Lent",
    hideShadow: "Cacher l ombre",
    showShadow: "Montrer l ombre",
    hideAnswer: "Cacher reponse",
    showAnswer: "Voir reponse",
    next: "Phrase suivante",
    shortcuts: "Raccourcis",
    shadow: "Ombre",
    shadowBody: "Lis le contour puis tape la phrase complete.",
  },
  de: {
    initialMessage: "Erst hoeren dann Schatten nutzen und den ganzen Satz tippen",
    unsupported: "Dieser Browser unterstuetzt keine Sprache. Uebe weiter mit Rechtschreibung.",
    noVoice: "Keine Systemstimme fuer diese Sprache. Uebe zuerst das Tippen.",
    nextMessage: "Naechster Satz. Erst einmal hoeren.",
    passMessage: "Bestanden. Weiter zum naechsten Satz.",
    retryMessage: "Fast. Hoere noch einmal langsam.",
    switchedMessage: "Satz gewechselt.",
    eyebrow: "Trainer erste Lektion",
    title: (nativeName) => `${nativeName} Hoeren und Schreiben`,
    stats: (correct, wrong) => `Richtig ${correct} Fehler ${wrong}`,
    hidden: "Erst hoeren. Noch keine Antwort.",
    pronounce: "Aussprechen",
    typeLabel: "Diesen Satz tippen",
    placeholder: "Hoeren und den ganzen Satz tippen",
    check: "Pruefen",
    slow: "Langsam",
    hideShadow: "Schatten ausblenden",
    showShadow: "Schatten zeigen",
    hideAnswer: "Antwort ausblenden",
    showAnswer: "Antwort zeigen",
    next: "Naechster Satz",
    shortcuts: "Tastenkürzel",
    shadow: "Schatten",
    shadowBody: "Lies zuerst die Umrisse und tippe dann den ganzen Satz.",
  },
  pt: {
    initialMessage: "Ouça primeiro use a sombra e digite a frase completa",
    unsupported: "Este navegador nao suporta voz. Continue praticando escrita.",
    noVoice: "Nao ha voz do sistema para este idioma. Pratique digitacao primeiro.",
    nextMessage: "Proxima frase. Ouça uma vez primeiro.",
    passMessage: "Passou. Indo para a proxima frase.",
    retryMessage: "Quase. Ouça devagar novamente.",
    switchedMessage: "Frase trocada.",
    eyebrow: "Treinador da primeira aula",
    title: (nativeName) => `${nativeName} escuta e escrita`,
    stats: (correct, wrong) => `Certas ${correct} Erros ${wrong}`,
    hidden: "Ouça primeiro. Sem resposta ainda.",
    pronounce: "Pronunciar",
    typeLabel: "Digite esta frase",
    placeholder: "Ouça e digite a frase completa",
    check: "Verificar",
    slow: "Devagar",
    hideShadow: "Ocultar sombra",
    showShadow: "Mostrar sombra",
    hideAnswer: "Ocultar resposta",
    showAnswer: "Ver resposta",
    next: "Proxima frase",
    shortcuts: "Atalhos",
    shadow: "Sombra",
    shadowBody: "Leia o contorno primeiro e depois digite a frase completa.",
  },
  ru: {
    initialMessage: "Сначала слушай затем используй тень и напечатай всю фразу",
    unsupported: "Браузер не поддерживает речь. Продолжай тренировать написание.",
    noVoice: "Нет системного голоса для этого языка. Сначала тренируй ввод.",
    nextMessage: "Следующая фраза. Сначала послушай один раз.",
    passMessage: "Пройдено. Переход к следующей фразе.",
    retryMessage: "Почти. Послушай медленно еще раз.",
    switchedMessage: "Фраза переключена.",
    eyebrow: "Тренер первого урока",
    title: (nativeName) => `${nativeName} слушание и письмо`,
    stats: (correct, wrong) => `Верно ${correct} Ошибки ${wrong}`,
    hidden: "Сначала слушай. Ответ пока скрыт.",
    pronounce: "Произнести",
    typeLabel: "Напечатай эту фразу",
    placeholder: "Послушай и напечатай всю фразу",
    check: "Проверить",
    slow: "Медленно",
    hideShadow: "Скрыть тень",
    showShadow: "Показать тень",
    hideAnswer: "Скрыть ответ",
    showAnswer: "Показать ответ",
    next: "Следующая фраза",
    shortcuts: "Горячие клавиши",
    shadow: "Тень",
    shadowBody: "Сначала прочитай контур, потом напечатай всю фразу.",
  },
  hi: {
    initialMessage: "पहले सुनें फिर छाया देखें और पूरा वाक्य टाइप करें",
    unsupported: "यह ब्राउज़र आवाज़ का समर्थन नहीं करता। वर्तनी अभ्यास जारी रखें।",
    noVoice: "इस भाषा के लिए सिस्टम आवाज़ नहीं है। पहले टाइपिंग से अभ्यास करें।",
    nextMessage: "अगला वाक्य। पहले एक बार सुनें।",
    passMessage: "पास। अगले वाक्य पर जा रहे हैं।",
    retryMessage: "लगभग सही। धीमे फिर सुनें।",
    switchedMessage: "वाक्य बदल दिया गया।",
    eyebrow: "पहला पाठ प्रशिक्षक",
    title: (nativeName) => `${nativeName} सुनना और वर्तनी`,
    stats: (correct, wrong) => `सही ${correct} गलत ${wrong}`,
    hidden: "पहले सुनें। अभी उत्तर नहीं।",
    pronounce: "उच्चारण",
    typeLabel: "यह वाक्य टाइप करें",
    placeholder: "सुनें फिर पूरा वाक्य टाइप करें",
    check: "जांचें",
    slow: "धीमा",
    hideShadow: "छाया छिपाएं",
    showShadow: "छाया दिखाएं",
    hideAnswer: "उत्तर छिपाएं",
    showAnswer: "उत्तर देखें",
    next: "अगला वाक्य",
    shortcuts: "शॉर्टकट",
    shadow: "छाया",
    shadowBody: "पहले रूपरेखा पढ़ें, फिर पूरा वाक्य टाइप करें।",
  },
  id: {
    initialMessage: "Dengar dulu lalu pakai bayangan dan ketik frasa lengkap",
    unsupported: "Browser ini tidak mendukung suara. Lanjutkan latihan ejaan.",
    noVoice: "Tidak ada suara sistem untuk bahasa ini. Latih mengetik dulu.",
    nextMessage: "Frasa berikutnya. Dengar sekali dulu.",
    passMessage: "Lulus. Pindah ke frasa berikutnya.",
    retryMessage: "Hampir. Dengar lagi perlahan.",
    switchedMessage: "Frasa diganti.",
    eyebrow: "Pelatih pelajaran pertama",
    title: (nativeName) => `${nativeName} mendengar dan mengeja`,
    stats: (correct, wrong) => `Benar ${correct} Salah ${wrong}`,
    hidden: "Dengar dulu. Jawaban belum terlihat.",
    pronounce: "Ucapkan",
    typeLabel: "Ketik frasa ini",
    placeholder: "Dengar lalu ketik frasa lengkap",
    check: "Periksa",
    slow: "Pelan",
    hideShadow: "Sembunyikan bayangan",
    showShadow: "Tampilkan bayangan",
    hideAnswer: "Sembunyikan jawaban",
    showAnswer: "Lihat jawaban",
    next: "Frasa berikutnya",
    shortcuts: "Pintasan",
    shadow: "Bayangan",
    shadowBody: "Baca bentuknya dulu, lalu ketik frasa lengkap.",
  },
  vi: {
    initialMessage: "Nghe trước rồi dùng bóng chữ và gõ cả câu",
    unsupported: "Trình duyệt này không hỗ trợ giọng nói. Tiếp tục luyện chính tả.",
    noVoice: "Không có giọng hệ thống cho ngôn ngữ này. Luyện gõ trước.",
    nextMessage: "Câu tiếp theo. Nghe một lần trước.",
    passMessage: "Đạt. Chuyển sang câu tiếp theo.",
    retryMessage: "Gần đúng. Nghe chậm lại lần nữa.",
    switchedMessage: "Đã đổi câu.",
    eyebrow: "Huấn luyện bài đầu",
    title: (nativeName) => `${nativeName} nghe và chính tả`,
    stats: (correct, wrong) => `Đúng ${correct} Sai ${wrong}`,
    hidden: "Nghe trước. Chưa hiện đáp án.",
    pronounce: "Phát âm",
    typeLabel: "Gõ câu này",
    placeholder: "Nghe rồi gõ cả câu",
    check: "Kiểm tra",
    slow: "Chậm",
    hideShadow: "Ẩn bóng chữ",
    showShadow: "Hiện bóng chữ",
    hideAnswer: "Ẩn đáp án",
    showAnswer: "Xem đáp án",
    next: "Câu tiếp theo",
    shortcuts: "Phím tắt",
    shadow: "Bóng chữ",
    shadowBody: "Đọc đường nét trước rồi gõ cả câu.",
  },
  th: {
    initialMessage: "ฟังก่อน ใช้เงาช่วย แล้วพิมพ์ทั้งประโยค",
    unsupported: "เบราว์เซอร์นี้ไม่รองรับเสียง ฝึกสะกดต่อได้",
    noVoice: "ไม่มีเสียงระบบสำหรับภาษานี้ ฝึกพิมพ์ก่อน",
    nextMessage: "ประโยคต่อไป ฟังก่อนหนึ่งครั้ง",
    passMessage: "ผ่านแล้ว ไปประโยคต่อไป",
    retryMessage: "เกือบถูก ฟังช้าอีกครั้ง",
    switchedMessage: "เปลี่ยนประโยคแล้ว",
    eyebrow: "ครูฝึกบทแรก",
    title: (nativeName) => `${nativeName} ฟังและสะกด`,
    stats: (correct, wrong) => `ถูก ${correct} ผิด ${wrong}`,
    hidden: "ฟังก่อน ยังไม่ดูคำตอบ",
    pronounce: "ออกเสียง",
    typeLabel: "พิมพ์ประโยคนี้",
    placeholder: "ฟังแล้วพิมพ์ประโยคเต็ม",
    check: "ตรวจ",
    slow: "ช้า",
    hideShadow: "ซ่อนเงา",
    showShadow: "แสดงเงา",
    hideAnswer: "ซ่อนคำตอบ",
    showAnswer: "ดูคำตอบ",
    next: "ประโยคต่อไป",
    shortcuts: "ปุ่มลัด",
    shadow: "เงา",
    shadowBody: "อ่านเค้าโครงก่อน แล้วพิมพ์ทั้งประโยค",
  },
  tr: {
    initialMessage: "Önce dinle sonra gölgeyi kullan ve tüm cümleyi yaz",
    unsupported: "Bu tarayıcı sesi desteklemiyor. Yazım çalışmasına devam et.",
    noVoice: "Bu dil için sistem sesi yok. Önce yazma pratiği yap.",
    nextMessage: "Sonraki cümle. Önce bir kez dinle.",
    passMessage: "Geçti. Sonraki cümleye geçiliyor.",
    retryMessage: "Neredeyse. Yavaşça tekrar dinle.",
    switchedMessage: "Cümle değiştirildi.",
    eyebrow: "İlk ders antrenörü",
    title: (nativeName) => `${nativeName} dinleme ve yazım`,
    stats: (correct, wrong) => `Doğru ${correct} Yanlış ${wrong}`,
    hidden: "Önce dinle. Cevap henüz yok.",
    pronounce: "Telaffuz",
    typeLabel: "Bu cümleyi yaz",
    placeholder: "Dinle ve tüm cümleyi yaz",
    check: "Kontrol et",
    slow: "Yavaş",
    hideShadow: "Gölgeyi gizle",
    showShadow: "Gölgeyi göster",
    hideAnswer: "Cevabı gizle",
    showAnswer: "Cevabı gör",
    next: "Sonraki cümle",
    shortcuts: "Kısayollar",
    shadow: "Gölge",
    shadowBody: "Önce taslağı oku, sonra tüm cümleyi yaz.",
  },
  it: {
    initialMessage: "Ascolta prima poi usa l ombra e digita la frase completa",
    unsupported: "Questo browser non supporta la voce. Continua con l ortografia.",
    noVoice: "Nessuna voce di sistema per questa lingua. Prima pratica la digitazione.",
    nextMessage: "Frase successiva. Ascolta una volta prima.",
    passMessage: "Superato. Passo alla frase successiva.",
    retryMessage: "Quasi. Ascolta di nuovo lentamente.",
    switchedMessage: "Frase cambiata.",
    eyebrow: "Allenatore prima lezione",
    title: (nativeName) => `${nativeName} ascolto e ortografia`,
    stats: (correct, wrong) => `Corrette ${correct} Errori ${wrong}`,
    hidden: "Ascolta prima. Nessuna risposta ancora.",
    pronounce: "Pronuncia",
    typeLabel: "Digita questa frase",
    placeholder: "Ascolta poi digita la frase completa",
    check: "Controlla",
    slow: "Lento",
    hideShadow: "Nascondi ombra",
    showShadow: "Mostra ombra",
    hideAnswer: "Nascondi risposta",
    showAnswer: "Vedi risposta",
    next: "Frase successiva",
    shortcuts: "Scorciatoie",
    shadow: "Ombra",
    shadowBody: "Leggi prima il profilo, poi digita tutta la frase.",
  },
  nl: {
    initialMessage: "Luister eerst gebruik de schaduw en typ de hele zin",
    unsupported: "Deze browser ondersteunt geen stem. Blijf spelling oefenen.",
    noVoice: "Geen systeemstem voor deze taal. Oefen eerst typen.",
    nextMessage: "Volgende zin. Luister eerst een keer.",
    passMessage: "Geslaagd. Door naar de volgende zin.",
    retryMessage: "Bijna. Luister nog eens langzaam.",
    switchedMessage: "Zin gewisseld.",
    eyebrow: "Eerste les trainer",
    title: (nativeName) => `${nativeName} luisteren en spelling`,
    stats: (correct, wrong) => `Goed ${correct} Fout ${wrong}`,
    hidden: "Luister eerst. Nog geen antwoord.",
    pronounce: "Uitspreken",
    typeLabel: "Typ deze zin",
    placeholder: "Luister en typ de hele zin",
    check: "Controleer",
    slow: "Langzaam",
    hideShadow: "Schaduw verbergen",
    showShadow: "Schaduw tonen",
    hideAnswer: "Antwoord verbergen",
    showAnswer: "Antwoord zien",
    next: "Volgende zin",
    shortcuts: "Sneltoetsen",
    shadow: "Schaduw",
    shadowBody: "Lees eerst de omtrek en typ daarna de hele zin.",
  },
  pl: {
    initialMessage: "Najpierw słuchaj potem użyj cienia i wpisz całe zdanie",
    unsupported: "Ta przeglądarka nie obsługuje mowy. Ćwicz dalej pisownię.",
    noVoice: "Brak głosu systemowego dla tego języka. Najpierw ćwicz wpisywanie.",
    nextMessage: "Następne zdanie. Najpierw posłuchaj raz.",
    passMessage: "Zaliczone. Przejście do następnego zdania.",
    retryMessage: "Prawie. Posłuchaj jeszcze raz powoli.",
    switchedMessage: "Zdanie zmienione.",
    eyebrow: "Trener pierwszej lekcji",
    title: (nativeName) => `${nativeName} słuchanie i pisownia`,
    stats: (correct, wrong) => `Dobrze ${correct} Błędy ${wrong}`,
    hidden: "Najpierw słuchaj. Odpowiedzi jeszcze nie ma.",
    pronounce: "Wymów",
    typeLabel: "Wpisz to zdanie",
    placeholder: "Posłuchaj i wpisz całe zdanie",
    check: "Sprawdź",
    slow: "Powoli",
    hideShadow: "Ukryj cień",
    showShadow: "Pokaż cień",
    hideAnswer: "Ukryj odpowiedź",
    showAnswer: "Zobacz odpowiedź",
    next: "Następne zdanie",
    shortcuts: "Skróty",
    shadow: "Cień",
    shadowBody: "Najpierw przeczytaj zarys, potem wpisz całe zdanie.",
  },
};

const speechLangBySlug: Record<string, string> = {
  amharic: "am-ET",
  arabic: "ar-SA",
  bengali: "bn-BD",
  chinese: "zh-CN",
  czech: "cs-CZ",
  danish: "da-DK",
  dutch: "nl-NL",
  english: "en-US",
  finnish: "fi-FI",
  french: "fr-FR",
  german: "de-DE",
  greek: "el-GR",
  hebrew: "he-IL",
  hindi: "hi-IN",
  hungarian: "hu-HU",
  indonesian: "id-ID",
  italian: "it-IT",
  japanese: "ja-JP",
  korean: "ko-KR",
  malay: "ms-MY",
  norwegian: "nb-NO",
  persian: "fa-IR",
  polish: "pl-PL",
  portuguese: "pt-BR",
  romanian: "ro-RO",
  russian: "ru-RU",
  spanish: "es-ES",
  swahili: "sw-KE",
  swedish: "sv-SE",
  tagalog: "fil-PH",
  tamil: "ta-IN",
  telugu: "te-IN",
  thai: "th-TH",
  turkish: "tr-TR",
  ukrainian: "uk-UA",
  urdu: "ur-PK",
  vietnamese: "vi-VN",
  welsh: "cy-GB",
};

function normalizeAnswer(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[。！？،؟؛,.!?;:]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();
}

function maskPhrase(value: string) {
  return Array.from(value).map((character) => {
    if (/\s/.test(character)) return " ";
    return character.match(/[A-Za-z0-9]/) ? "·" : "＿";
  }).join("");
}

function getVoice(lang: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  const base = lang.split("-")[0]?.toLowerCase();
  return (
    voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase() && voice.localService) ||
    voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase()) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith(`${base}-`))
  );
}

export function WorldLanguageStarterTrainer({
  languageSlug,
  nativeName,
  languageName,
  phrases,
  interfaceLanguage = "en",
}: WorldLanguageStarterTrainerProps) {
  const copy = trainerCopy[interfaceLanguage];
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [showHint, setShowHint] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [message, setMessage] = useState(copy.initialMessage);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const current = phrases[index % phrases.length];
  const speechLang = speechLangBySlug[languageSlug] || "en-US";
  const progress = useMemo(() => {
    return phrases.length ? Math.round(((index % phrases.length) / phrases.length) * 100) : 0;
  }, [index, phrases.length]);
  const isCorrect = normalizeAnswer(draft) === normalizeAnswer(current.text);

  const speak = useCallback((text = current.text, slow = false) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) {
      setMessage(copy.unsupported);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    utterance.rate = slow ? 0.68 : 0.88;
    utterance.pitch = 1;
    utterance.volume = 1;
    const voice = getVoice(speechLang);
    if (voice) utterance.voice = voice;
    utterance.onerror = () => setMessage(copy.noVoice);
    window.speechSynthesis.speak(utterance);
  }, [copy.noVoice, copy.unsupported, current.text, speechLang]);

  const next = useCallback(() => {
    setIndex((value) => (value + 1) % phrases.length);
    setDraft("");
    setShowAnswer(false);
    setShowHint(true);
    setMessage(copy.nextMessage);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [copy.nextMessage, phrases.length]);

  const check = useCallback(() => {
    if (isCorrect) {
      setStats((value) => ({ ...value, correct: value.correct + 1 }));
      setMessage(copy.passMessage);
      window.setTimeout(next, 420);
      return;
    }

    setStats((value) => ({ ...value, wrong: value.wrong + 1 }));
    setMessage(copy.retryMessage);
    setShowHint(true);
    speak(current.text, true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [copy.passMessage, copy.retryMessage, current.text, isCorrect, next, speak]);

  return (
    <section className="mt-3 dense-panel p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold">{copy.title(nativeName)}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="dense-status">{languageName}</span>
          <span className="dense-status">{speechLang}</span>
          <span className="dense-status">{copy.stats(stats.correct, stats.wrong)}</span>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[8px] border border-slate-200 bg-white/85 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">{String((index % phrases.length) + 1).padStart(2, "0")} / {phrases.length}</p>
              <h3 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
                {showAnswer ? current.text : showHint ? maskPhrase(current.text) : copy.hidden}
              </h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{current.label}</p>
            </div>
            <button type="button" className="dense-action-primary px-4 py-2.5" onClick={() => speak()}>
              {copy.pronounce}
            </button>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-slate-950 transition-all" style={{ width: `${progress}%` }} />
          </div>

          <label className="mt-5 grid gap-2">
            <span className="eyebrow">{copy.typeLabel}</span>
            <input
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") check();
                if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
                  event.preventDefault();
                  speak();
                }
              }}
              className={`w-full rounded-[8px] border bg-white px-3 py-3 text-lg outline-none transition ${
                draft && isCorrect ? "border-emerald-400" : draft ? "border-slate-300" : "border-slate-200"
              }`}
              placeholder={copy.placeholder}
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" className="dense-action-primary px-4 py-2.5" onClick={check}>
              {copy.check}
            </button>
            <button type="button" className="dense-action px-4 py-2.5" onClick={() => speak(current.text, true)}>
              {copy.slow}
            </button>
            <button type="button" className="dense-action px-4 py-2.5" onClick={() => setShowHint((value) => !value)}>
              {showHint ? copy.hideShadow : copy.showShadow}
            </button>
            <button type="button" className="dense-action px-4 py-2.5" onClick={() => setShowAnswer((value) => !value)}>
              {showAnswer ? copy.hideAnswer : copy.showAnswer}
            </button>
            <button type="button" className="dense-action px-4 py-2.5" onClick={next}>
              {copy.next}
            </button>
          </div>
          <p className="mt-3 text-sm text-[color:var(--muted)]">{message}</p>
        </div>

        <div className="rounded-[8px] border border-slate-200 bg-white/85 p-4">
          <p className="eyebrow">{copy.shortcuts}</p>
          <div className="mt-3 grid gap-2 text-sm text-[color:var(--muted)]">
            <div className="dense-row"><span>Enter</span><span>{copy.check}</span></div>
            <div className="dense-row"><span>Ctrl P</span><span>{copy.pronounce}</span></div>
            <div className="dense-row"><span>{copy.shadow}</span><span>{copy.shadowBody}</span></div>
          </div>
          <div className="mt-4 grid gap-2">
            {phrases.map((phrase, phraseIndex) => (
              <button
                key={phrase.key}
                type="button"
                onClick={() => {
                  setIndex(phraseIndex);
                  setDraft("");
                  setShowAnswer(false);
                  setMessage(copy.switchedMessage);
                }}
                className={phraseIndex === index ? "dense-action-primary justify-between" : "dense-action justify-between"}
              >
                <span>{phrase.label}</span>
                <span>{String(phraseIndex + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
