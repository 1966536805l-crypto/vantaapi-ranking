import type { InterfaceLanguage } from "@/lib/language";
import { methodI18n } from "@/lib/programming-trainer/foundation";

const compactMethodI18n: Partial<Record<InterfaceLanguage, {
  title: Record<string, string>;
  body: Record<string, string>;
}>> = {
  fr: {
    title: {
      "Recall from memory": "rappel de memoire",
      "Trace the code": "suivre le code",
      "Type it yourself": "taper soi meme",
      "Mix topics": "melanger les sujets",
      "Hints after trying": "indices apres essai",
      "Build small things": "construire petit",
    },
    body: {
      "Recall from memory": "lis un point puis recris le sans regarder",
      "Trace the code": "note les valeurs ligne par ligne avant d executer",
      "Type it yourself": "copie moins tape plus et corrige un petit bug",
      "Mix topics": "alterne syntaxe donnees debug et mini projets",
      "Hints after trying": "essaie seul puis ouvre un indice",
      "Build small things": "transforme chaque bloc en script page requete ou outil",
    },
  },
  de: {
    title: {
      "Recall from memory": "aus dem gedaechtnis",
      "Trace the code": "code verfolgen",
      "Type it yourself": "selbst tippen",
      "Mix topics": "themen mischen",
      "Hints after trying": "hinweise nach versuch",
      "Build small things": "klein bauen",
    },
    body: {
      "Recall from memory": "lies einen punkt und schreibe ihn ohne blick zurueck",
      "Trace the code": "notiere variablenwerte vor dem ausfuehren",
      "Type it yourself": "weniger kopieren mehr tippen und kleine fehler reparieren",
      "Mix topics": "wechsel zwischen syntax datenstrukturen debugging und mini projekten",
      "Hints after trying": "versuche allein und oeffne dann einen hinweis",
      "Build small things": "mache aus jedem block ein script eine seite eine abfrage oder ein tool",
    },
  },
  pt: {
    title: {
      "Recall from memory": "lembrar de memoria",
      "Trace the code": "rastrear o codigo",
      "Type it yourself": "digitar voce mesmo",
      "Mix topics": "misturar topicos",
      "Hints after trying": "dicas depois de tentar",
      "Build small things": "criar coisas pequenas",
    },
    body: {
      "Recall from memory": "leia um ponto pequeno e reescreva sem olhar",
      "Trace the code": "anote valores linha por linha antes de rodar",
      "Type it yourself": "copie menos digite mais e corrija um erro pequeno",
      "Mix topics": "alterne sintaxe dados debug e mini projetos",
      "Hints after trying": "tente sozinho e abra uma dica",
      "Build small things": "transforme cada bloco em script pagina consulta ou ferramenta",
    },
  },
  ru: {
    title: {
      "Recall from memory": "вспомнить по памяти",
      "Trace the code": "проследить код",
      "Type it yourself": "набрать самому",
      "Mix topics": "смешивать темы",
      "Hints after trying": "подсказки после попытки",
      "Build small things": "строить малое",
    },
    body: {
      "Recall from memory": "прочитай маленький пункт и воспроизведи без подсказки",
      "Trace the code": "запиши значения переменных перед запуском",
      "Type it yourself": "меньше копируй больше набирай и чини по одному багу",
      "Mix topics": "чередуй синтаксис данные отладку и мини проекты",
      "Hints after trying": "сначала попробуй сам потом открой одну подсказку",
      "Build small things": "превращай каждый блок в скрипт страницу запрос или инструмент",
    },
  },
  hi: {
    title: {
      "Recall from memory": "याद से दोहराएं",
      "Trace the code": "code trace करें",
      "Type it yourself": "खुद type करें",
      "Mix topics": "topics मिलाएं",
      "Hints after trying": "कोशिश के बाद hint",
      "Build small things": "छोटी चीजें बनाएं",
    },
    body: {
      "Recall from memory": "छोटा point पढ़कर बिना देखे फिर लिखें",
      "Trace the code": "run से पहले variable values line by line लिखें",
      "Type it yourself": "कम copy करें ज्यादा type करें और एक छोटा error ठीक करें",
      "Mix topics": "syntax data structure debugging और mini project बदलते रहें",
      "Hints after trying": "पहले खुद कोशिश करें फिर एक hint खोलें",
      "Build small things": "हर block को script page query या tool बनाएं",
    },
  },
  id: {
    title: {
      "Recall from memory": "ingat dari memori",
      "Trace the code": "telusuri kode",
      "Type it yourself": "ketik sendiri",
      "Mix topics": "campur topik",
      "Hints after trying": "petunjuk setelah mencoba",
      "Build small things": "buat hal kecil",
    },
    body: {
      "Recall from memory": "baca satu poin lalu tulis ulang tanpa melihat",
      "Trace the code": "catat nilai variabel sebelum menjalankan",
      "Type it yourself": "kurangi salin lebih banyak mengetik dan perbaiki satu error",
      "Mix topics": "ganti antara sintaks data debugging dan mini proyek",
      "Hints after trying": "coba sendiri dulu lalu buka satu petunjuk",
      "Build small things": "ubah tiap blok jadi script halaman query atau alat",
    },
  },
  vi: {
    title: {
      "Recall from memory": "nho lai",
      "Trace the code": "lan theo code",
      "Type it yourself": "tu go",
      "Mix topics": "tron chu de",
      "Hints after trying": "goi y sau khi thu",
      "Build small things": "lam thu nho",
    },
    body: {
      "Recall from memory": "doc mot y nho roi viet lai ma khong nhin",
      "Trace the code": "ghi gia tri bien tung dong truoc khi chay",
      "Type it yourself": "it copy hon go nhieu hon va sua mot loi nho",
      "Mix topics": "doi qua lai giua cu phap du lieu debug va du an nho",
      "Hints after trying": "tu thu truoc roi mo mot goi y",
      "Build small things": "bien moi khoi thanh script trang truy van hoac cong cu",
    },
  },
  th: {
    title: {
      "Recall from memory": "ทวนจากความจำ",
      "Trace the code": "ไล่โค้ด",
      "Type it yourself": "พิมพ์เอง",
      "Mix topics": "สลับหัวข้อ",
      "Hints after trying": "ลองก่อนค่อยใบ้",
      "Build small things": "สร้างชิ้นเล็ก",
    },
    body: {
      "Recall from memory": "อ่านจุดเล็กแล้วเขียนใหม่โดยไม่ดู",
      "Trace the code": "เขียนค่าตัวแปรทีละบรรทัดก่อนรัน",
      "Type it yourself": "คัดลอกให้น้อย พิมพ์ให้มาก แล้วแก้ error ทีละจุด",
      "Mix topics": "สลับ syntax data debug และโปรเจกต์เล็ก",
      "Hints after trying": "ลองเองก่อนแล้วค่อยเปิดคำใบ้หนึ่งข้อ",
      "Build small things": "เปลี่ยนแต่ละบทเป็น script page query หรือ tool",
    },
  },
  tr: {
    title: {
      "Recall from memory": "hafizadan cagir",
      "Trace the code": "kodu izle",
      "Type it yourself": "kendin yaz",
      "Mix topics": "konulari karistir",
      "Hints after trying": "denemeden sonra ipucu",
      "Build small things": "kucuk seyler yap",
    },
    body: {
      "Recall from memory": "kucuk bir noktayi oku sonra bakmadan yaz",
      "Trace the code": "calistirmadan once degiskenleri satir satir izle",
      "Type it yourself": "daha az kopyala daha cok yaz ve bir hatayi duzelt",
      "Mix topics": "syntax veri debug ve mini projeler arasinda gec",
      "Hints after trying": "once kendin dene sonra bir ipucu ac",
      "Build small things": "her bloku script sayfa sorgu veya araca cevir",
    },
  },
  it: {
    title: {
      "Recall from memory": "ricorda a memoria",
      "Trace the code": "traccia il codice",
      "Type it yourself": "scrivi tu",
      "Mix topics": "mescola temi",
      "Hints after trying": "indizi dopo il tentativo",
      "Build small things": "costruisci piccolo",
    },
    body: {
      "Recall from memory": "leggi un punto piccolo e riscrivilo senza guardare",
      "Trace the code": "segui i valori riga per riga prima di eseguire",
      "Type it yourself": "copia meno scrivi di piu e correggi un errore",
      "Mix topics": "alterna sintassi dati debug e mini progetti",
      "Hints after trying": "prova da solo poi apri un indizio",
      "Build small things": "trasforma ogni blocco in script pagina query o tool",
    },
  },
  nl: {
    title: {
      "Recall from memory": "uit geheugen",
      "Trace the code": "code volgen",
      "Type it yourself": "zelf typen",
      "Mix topics": "onderwerpen mengen",
      "Hints after trying": "hints na poging",
      "Build small things": "klein bouwen",
    },
    body: {
      "Recall from memory": "lees een klein punt en schrijf het terug zonder te kijken",
      "Trace the code": "noteer waarden regel voor regel voor je runt",
      "Type it yourself": "kopieer minder typ meer en repareer een kleine fout",
      "Mix topics": "wissel syntax data debug en mini projecten af",
      "Hints after trying": "probeer eerst zelf en open dan een hint",
      "Build small things": "maak van elk blok een script pagina query of tool",
    },
  },
  pl: {
    title: {
      "Recall from memory": "przywolaj z pamieci",
      "Trace the code": "sledz kod",
      "Type it yourself": "wpisz sam",
      "Mix topics": "mieszaj tematy",
      "Hints after trying": "podpowiedz po probie",
      "Build small things": "buduj male rzeczy",
    },
    body: {
      "Recall from memory": "przeczytaj maly punkt i odtworz bez patrzenia",
      "Trace the code": "zapisz wartosci zmiennych przed uruchomieniem",
      "Type it yourself": "mniej kopiuj wiecej pisz i popraw jeden maly blad",
      "Mix topics": "zmieniaj skladnie dane debug i mini projekty",
      "Hints after trying": "najpierw sprobuj sam potem otworz jedna podpowiedz",
      "Build small things": "zamien kazdy blok w skrypt strone zapytanie lub narzedzie",
    },
  },
};

function methodTitle(methodTitleValue: string, language: InterfaceLanguage) {
  return methodI18n[language]?.title[methodTitleValue] ?? compactMethodI18n[language]?.title[methodTitleValue] ?? methodTitleValue;
}

function methodBody(methodTitleValue: string, methodBodyValue: string, language: InterfaceLanguage) {
  return methodI18n[language]?.body[methodTitleValue] ?? compactMethodI18n[language]?.body[methodTitleValue] ?? methodBodyValue;
}

export { methodBody, methodTitle };
