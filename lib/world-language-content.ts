export type WorldLanguage = {
  slug: string;
  name: string;
  nativeName: string;
  family: string;
  region: string;
  script: string;
  starterGoal: string;
  firstLesson: string[];
};

export type SurvivalPhraseKey =
  | "greeting"
  | "thanks"
  | "selfIntro"
  | "need"
  | "confusion"
  | "repeat"
  | "direction"
  | "price";

export const worldLanguageSurvivalPhrases: Partial<Record<string, Record<SurvivalPhraseKey, string>>> = {
  chinese: {
    greeting: "你好",
    thanks: "谢谢",
    selfIntro: "我在学中文",
    need: "我想要水",
    confusion: "我听不懂",
    repeat: "请再说一遍",
    direction: "这里是哪里",
    price: "多少钱",
  },
  english: {
    greeting: "Hello",
    thanks: "Thank you",
    selfIntro: "I am learning English",
    need: "I want water",
    confusion: "I do not understand",
    repeat: "Please say it again",
    direction: "Where is this place",
    price: "How much is it",
  },
  japanese: {
    greeting: "こんにちは",
    thanks: "ありがとうございます",
    selfIntro: "日本語を勉強しています",
    need: "水がほしいです",
    confusion: "わかりません",
    repeat: "もう一度言ってください",
    direction: "ここはどこですか",
    price: "いくらですか",
  },
  korean: {
    greeting: "안녕하세요",
    thanks: "감사합니다",
    selfIntro: "한국어를 배우고 있어요",
    need: "물을 원해요",
    confusion: "이해하지 못했어요",
    repeat: "다시 말해 주세요",
    direction: "여기가 어디예요",
    price: "얼마예요",
  },
  spanish: {
    greeting: "Hola",
    thanks: "Gracias",
    selfIntro: "Estoy aprendiendo español",
    need: "Quiero agua",
    confusion: "No entiendo",
    repeat: "Por favor repítelo",
    direction: "Dónde está este lugar",
    price: "Cuánto cuesta",
  },
  french: {
    greeting: "Bonjour",
    thanks: "Merci",
    selfIntro: "J'apprends le français",
    need: "Je veux de l'eau",
    confusion: "Je ne comprends pas",
    repeat: "Répétez s'il vous plaît",
    direction: "Où est cet endroit",
    price: "Combien ça coûte",
  },
  german: {
    greeting: "Hallo",
    thanks: "Danke",
    selfIntro: "Ich lerne Deutsch",
    need: "Ich möchte Wasser",
    confusion: "Ich verstehe nicht",
    repeat: "Bitte sagen Sie es noch einmal",
    direction: "Wo ist dieser Ort",
    price: "Wie viel kostet es",
  },
};

export const worldLanguages: WorldLanguage[] = [
  { slug: "english", name: "English", nativeName: "English", family: "Germanic", region: "Global", script: "Latin", starterGoal: "daily conversation exams and work", firstLesson: ["hello", "thank you", "I am learning English"] },
  { slug: "spanish", name: "Spanish", nativeName: "Español", family: "Romance", region: "Europe Americas", script: "Latin", starterGoal: "travel daily speech and culture", firstLesson: ["hola", "gracias", "estoy aprendiendo español"] },
  { slug: "french", name: "French", nativeName: "Français", family: "Romance", region: "Europe Africa Canada", script: "Latin", starterGoal: "travel study and culture", firstLesson: ["bonjour", "merci", "j'apprends le français"] },
  { slug: "german", name: "German", nativeName: "Deutsch", family: "Germanic", region: "Central Europe", script: "Latin", starterGoal: "study work and grammar training", firstLesson: ["hallo", "danke", "ich lerne Deutsch"] },
  { slug: "italian", name: "Italian", nativeName: "Italiano", family: "Romance", region: "Europe", script: "Latin", starterGoal: "travel music food and conversation", firstLesson: ["ciao", "grazie", "sto imparando l'italiano"] },
  { slug: "portuguese", name: "Portuguese", nativeName: "Português", family: "Romance", region: "Portugal Brazil Africa", script: "Latin", starterGoal: "Brazil Portugal travel and daily speech", firstLesson: ["olá", "obrigado", "estou aprendendo português"] },
  { slug: "dutch", name: "Dutch", nativeName: "Nederlands", family: "Germanic", region: "Netherlands Belgium", script: "Latin", starterGoal: "daily conversation and reading", firstLesson: ["hallo", "dank je", "ik leer Nederlands"] },
  { slug: "swedish", name: "Swedish", nativeName: "Svenska", family: "Germanic", region: "Nordic", script: "Latin", starterGoal: "Nordic study and travel", firstLesson: ["hej", "tack", "jag lär mig svenska"] },
  { slug: "norwegian", name: "Norwegian", nativeName: "Norsk", family: "Germanic", region: "Nordic", script: "Latin", starterGoal: "Nordic communication", firstLesson: ["hei", "takk", "jeg lærer norsk"] },
  { slug: "danish", name: "Danish", nativeName: "Dansk", family: "Germanic", region: "Nordic", script: "Latin", starterGoal: "Nordic travel and reading", firstLesson: ["hej", "tak", "jeg lærer dansk"] },
  { slug: "russian", name: "Russian", nativeName: "Русский", family: "Slavic", region: "Eurasia", script: "Cyrillic", starterGoal: "Cyrillic reading and daily speech", firstLesson: ["привет", "спасибо", "я учу русский"] },
  { slug: "polish", name: "Polish", nativeName: "Polski", family: "Slavic", region: "Central Europe", script: "Latin", starterGoal: "Slavic grammar and conversation", firstLesson: ["cześć", "dziękuję", "uczę się polskiego"] },
  { slug: "ukrainian", name: "Ukrainian", nativeName: "Українська", family: "Slavic", region: "Eastern Europe", script: "Cyrillic", starterGoal: "Cyrillic reading and daily speech", firstLesson: ["привіт", "дякую", "я вивчаю українську"] },
  { slug: "greek", name: "Greek", nativeName: "Ελληνικά", family: "Hellenic", region: "Greece Cyprus", script: "Greek", starterGoal: "alphabet culture and basic conversation", firstLesson: ["γεια", "ευχαριστώ", "μαθαίνω ελληνικά"] },
  { slug: "turkish", name: "Turkish", nativeName: "Türkçe", family: "Turkic", region: "Turkey", script: "Latin", starterGoal: "agglutinative grammar and travel speech", firstLesson: ["merhaba", "teşekkürler", "Türkçe öğreniyorum"] },
  { slug: "arabic", name: "Arabic", nativeName: "العربية", family: "Semitic", region: "Middle East North Africa", script: "Arabic", starterGoal: "script pronunciation and core phrases", firstLesson: ["مرحبا", "شكرا", "أنا أتعلم العربية"] },
  { slug: "hebrew", name: "Hebrew", nativeName: "עברית", family: "Semitic", region: "Israel", script: "Hebrew", starterGoal: "script and daily conversation", firstLesson: ["שלום", "תודה", "אני לומד עברית"] },
  { slug: "persian", name: "Persian", nativeName: "فارسی", family: "Iranian", region: "Iran Afghanistan Tajikistan", script: "Perso-Arabic", starterGoal: "script poetry culture and speech", firstLesson: ["سلام", "ممنون", "من فارسی یاد می‌گیرم"] },
  { slug: "hindi", name: "Hindi", nativeName: "हिन्दी", family: "Indo-Aryan", region: "India", script: "Devanagari", starterGoal: "Devanagari and daily speech", firstLesson: ["नमस्ते", "धन्यवाद", "मैं हिंदी सीख रहा हूँ"] },
  { slug: "urdu", name: "Urdu", nativeName: "اردو", family: "Indo-Aryan", region: "Pakistan India", script: "Perso-Arabic", starterGoal: "script and polite conversation", firstLesson: ["سلام", "شکریہ", "میں اردو سیکھ رہا ہوں"] },
  { slug: "bengali", name: "Bengali", nativeName: "বাংলা", family: "Indo-Aryan", region: "Bangladesh India", script: "Bengali", starterGoal: "script and daily speech", firstLesson: ["নমস্কার", "ধন্যবাদ", "আমি বাংলা শিখছি"] },
  { slug: "punjabi", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", family: "Indo-Aryan", region: "Punjab", script: "Gurmukhi Shahmukhi", starterGoal: "script and family conversation", firstLesson: ["ਸਤ ਸ੍ਰੀ ਅਕਾਲ", "ਧੰਨਵਾਦ", "ਮੈਂ ਪੰਜਾਬੀ ਸਿੱਖ ਰਿਹਾ ਹਾਂ"] },
  { slug: "tamil", name: "Tamil", nativeName: "தமிழ்", family: "Dravidian", region: "South India Sri Lanka", script: "Tamil", starterGoal: "script and daily speech", firstLesson: ["வணக்கம்", "நன்றி", "நான் தமிழ் கற்கிறேன்"] },
  { slug: "telugu", name: "Telugu", nativeName: "తెలుగు", family: "Dravidian", region: "South India", script: "Telugu", starterGoal: "script and conversation", firstLesson: ["నమస్తే", "ధన్యవాదాలు", "నేను తెలుగు నేర్చుకుంటున్నాను"] },
  { slug: "chinese", name: "Chinese", nativeName: "中文", family: "Sinitic", region: "East Asia Global", script: "Han characters", starterGoal: "pinyin tones characters and daily use", firstLesson: ["你好", "谢谢", "我在学中文"] },
  { slug: "japanese", name: "Japanese", nativeName: "日本語", family: "Japonic", region: "Japan", script: "Kana Kanji", starterGoal: "kana first then daily patterns", firstLesson: ["こんにちは", "ありがとう", "日本語を勉強しています"] },
  { slug: "korean", name: "Korean", nativeName: "한국어", family: "Koreanic", region: "Korea", script: "Hangul", starterGoal: "Hangul and sentence endings", firstLesson: ["안녕하세요", "감사합니다", "한국어를 배우고 있어요"] },
  { slug: "vietnamese", name: "Vietnamese", nativeName: "Tiếng Việt", family: "Austroasiatic", region: "Vietnam", script: "Latin", starterGoal: "tones and daily conversation", firstLesson: ["xin chào", "cảm ơn", "tôi đang học tiếng Việt"] },
  { slug: "thai", name: "Thai", nativeName: "ไทย", family: "Tai-Kadai", region: "Thailand", script: "Thai", starterGoal: "script tones and travel speech", firstLesson: ["สวัสดี", "ขอบคุณ", "ฉันกำลังเรียนภาษาไทย"] },
  { slug: "indonesian", name: "Indonesian", nativeName: "Bahasa Indonesia", family: "Austronesian", region: "Indonesia", script: "Latin", starterGoal: "simple grammar and travel speech", firstLesson: ["halo", "terima kasih", "saya belajar bahasa Indonesia"] },
  { slug: "malay", name: "Malay", nativeName: "Bahasa Melayu", family: "Austronesian", region: "Malaysia Brunei Singapore", script: "Latin", starterGoal: "travel speech and reading", firstLesson: ["halo", "terima kasih", "saya belajar bahasa Melayu"] },
  { slug: "tagalog", name: "Tagalog", nativeName: "Tagalog", family: "Austronesian", region: "Philippines", script: "Latin", starterGoal: "daily speech and family phrases", firstLesson: ["kumusta", "salamat", "nag-aaral ako ng Tagalog"] },
  { slug: "swahili", name: "Swahili", nativeName: "Kiswahili", family: "Bantu", region: "East Africa", script: "Latin", starterGoal: "travel speech and noun classes", firstLesson: ["jambo", "asante", "ninajifunza Kiswahili"] },
  { slug: "amharic", name: "Amharic", nativeName: "አማርኛ", family: "Semitic", region: "Ethiopia", script: "Ge'ez", starterGoal: "script and daily phrases", firstLesson: ["ሰላም", "አመሰግናለሁ", "አማርኛ እማራለሁ"] },
  { slug: "yoruba", name: "Yoruba", nativeName: "Yorùbá", family: "Niger-Congo", region: "West Africa", script: "Latin", starterGoal: "tones greetings and culture", firstLesson: ["ẹ n lẹ", "ẹ ṣé", "mo ń kọ́ Yorùbá"] },
  { slug: "zulu", name: "Zulu", nativeName: "isiZulu", family: "Bantu", region: "South Africa", script: "Latin", starterGoal: "click sounds greetings and core verbs", firstLesson: ["sawubona", "ngiyabonga", "ngifunda isiZulu"] },
  { slug: "hausa", name: "Hausa", nativeName: "Hausa", family: "Chadic", region: "West Africa", script: "Latin Ajami", starterGoal: "market speech and daily phrases", firstLesson: ["sannu", "na gode", "ina koyon Hausa"] },
  { slug: "finnish", name: "Finnish", nativeName: "Suomi", family: "Uralic", region: "Finland", script: "Latin", starterGoal: "cases and practical phrases", firstLesson: ["hei", "kiitos", "opiskelen suomea"] },
  { slug: "hungarian", name: "Hungarian", nativeName: "Magyar", family: "Uralic", region: "Hungary", script: "Latin", starterGoal: "vowel harmony and cases", firstLesson: ["szia", "köszönöm", "magyarul tanulok"] },
  { slug: "czech", name: "Czech", nativeName: "Čeština", family: "Slavic", region: "Central Europe", script: "Latin", starterGoal: "cases and travel speech", firstLesson: ["ahoj", "děkuji", "učím se česky"] },
  { slug: "romanian", name: "Romanian", nativeName: "Română", family: "Romance", region: "Eastern Europe", script: "Latin", starterGoal: "Romance grammar and daily speech", firstLesson: ["salut", "mulțumesc", "învăț română"] },
  { slug: "serbian", name: "Serbian", nativeName: "Српски", family: "Slavic", region: "Balkans", script: "Cyrillic Latin", starterGoal: "two scripts and daily speech", firstLesson: ["здраво", "хвала", "учим српски"] },
  { slug: "croatian", name: "Croatian", nativeName: "Hrvatski", family: "Slavic", region: "Balkans", script: "Latin", starterGoal: "travel speech and reading", firstLesson: ["bok", "hvala", "učim hrvatski"] },
  { slug: "irish", name: "Irish", nativeName: "Gaeilge", family: "Celtic", region: "Ireland", script: "Latin", starterGoal: "Celtic basics and greetings", firstLesson: ["dia duit", "go raibh maith agat", "táim ag foghlaim Gaeilge"] },
  { slug: "welsh", name: "Welsh", nativeName: "Cymraeg", family: "Celtic", region: "Wales", script: "Latin", starterGoal: "pronunciation and core phrases", firstLesson: ["helo", "diolch", "dw i'n dysgu Cymraeg"] },
  { slug: "latin", name: "Latin", nativeName: "Latina", family: "Italic", region: "Classical", script: "Latin", starterGoal: "roots grammar and reading", firstLesson: ["salve", "gratias", "linguam Latinam disco"] },
];

export const worldLanguageFamilies = Array.from(new Set(worldLanguages.map((language) => language.family))).sort();

export const worldLanguageStarterPlan = [
  { id: "sound", zh: "先听音", en: "Hear the sound", bodyZh: "先掌握问候 感谢 自我介绍 三句话 不急着背语法", bodyEn: "Start with greeting thanks and self introduction before grammar" },
  { id: "script", zh: "再认字", en: "Meet the script", bodyZh: "拉丁字母以外的语言先认字母或文字系统", bodyEn: "For non Latin scripts learn the writing system early" },
  { id: "sentence", zh: "整句输入", en: "Use whole sentences", bodyZh: "每个词都放到一句话里练 不孤立背词", bodyEn: "Put every word inside a sentence instead of memorizing alone" },
  { id: "review", zh: "短频复习", en: "Short frequent review", bodyZh: "每天 10 分钟比周末一次 2 小时更稳", bodyEn: "Ten minutes daily beats one long weekend session" },
];
