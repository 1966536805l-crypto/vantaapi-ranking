import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import RepoAuditForm from "@/components/home/RepoAuditForm";
import FlagLanguageToggle from "@/components/layout/FlagLanguageToggle";
import { isInterfaceLanguage, localizedHref, localizedLanguageAlternates, type InterfaceLanguage } from "@/lib/language";

type HomeSearchParams = Promise<{ ui?: string | string[]; lang?: string | string[] }>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function resolveHomeLanguage(rawLang?: string | string[], rawUi?: string | string[], requestLanguage?: string | null): InterfaceLanguage {
  const lang = firstParam(rawLang);
  if (isInterfaceLanguage(lang)) return lang;
  if (isInterfaceLanguage(requestLanguage)) return requestLanguage;
  return firstParam(rawUi) === "zh" ? "zh" : "en";
}

async function headerLanguage() {
  const requestHeaders = await headers();
  const language = requestHeaders.get("x-jinming-language");
  return isInterfaceLanguage(language) ? language : null;
}

const homeCopy = {
  en: {
    audit: "Audit", tools: "Tools", programming: "Programming", eyebrow: "GitHub Launch Audit",
    title: "Paste a repo. Get the launch blockers.",
    subtitle: "Deterministic checks first: README, env files, CI, deploy, and security signals. Then package the result into issue drafts, PR copy, and a release checklist.",
    outcomes: ["Rules-first score", "Blockers", "Issue drafts", "PR description"],
    pass: "Pass", review: "Review", sample: "Sample report", evidence: [["P1", ".env.example", "Env keys need local preview production separation"], ["P1", "README.md", "Quick start should stay under five minutes"], ["P2", "release docs", "Release checklist should be visible to maintainers"]],
    pr: "Copy-ready PR description", workflow: "Move the audit into the developer workflow", developerTools: "View developer tools", programmingLab: "Open programming lab",
    security: "Security", privacy: "Privacy", terms: "Terms",
  },
  zh: {
    audit: "上线体检", tools: "工具", programming: "编程", eyebrow: "GitHub 上线体检",
    title: "粘贴仓库，拿到上线前检查报告。",
    subtitle: "先用确定性规则检查 README、环境变量、CI、部署和安全提示，再整理成 Issue 草稿、PR 描述和发布清单。",
    outcomes: ["上线评分", "阻塞项", "Issue 草稿", "PR 描述"],
    pass: "通过", review: "待确认", sample: "示例报告", evidence: [["P1", ".env.example", "环境变量需要区分本地 预览 生产"], ["P1", "README.md", "快速开始路径需要控制在五分钟内"], ["P2", "release docs", "发布清单不应该只存在维护者脑子里"]],
    pr: "可复制 PR 描述", workflow: "把体检结果直接放进开发流程", developerTools: "查看开发者工具", programmingLab: "进入编程训练",
    security: "安全说明", privacy: "隐私", terms: "条款",
  },
  ja: {
    audit: "公開前診断", tools: "ツール", programming: "プログラミング", eyebrow: "GitHub 公開前診断",
    title: "リポジトリを貼るだけで、公開前の詰まりを確認。",
    subtitle: "README、環境変数、CI、デプロイ、セキュリティをルールで先に確認し、Issue 草案、PR 文、リリースチェックリストにまとめます。",
    outcomes: ["診断スコア", "ブロッカー", "Issue 草案", "PR 説明"],
    pass: "合格", review: "確認", sample: "レポート例", evidence: [["P1", ".env.example", "環境変数は local preview production で分ける必要があります"], ["P1", "README.md", "クイックスタートは 5 分以内に収めます"], ["P2", "release docs", "リリース手順を見える場所に置きます"]],
    pr: "コピーできる PR 説明", workflow: "診断結果を開発フローへ", developerTools: "開発者ツールを見る", programmingLab: "プログラミングへ",
    security: "セキュリティ", privacy: "プライバシー", terms: "利用規約",
  },
  ko: {
    audit: "출시 점검", tools: "도구", programming: "프로그래밍", eyebrow: "GitHub 출시 점검",
    title: "저장소를 붙여 넣고 출시 전 문제를 확인하세요.",
    subtitle: "README, 환경 변수, CI, 배포, 보안 신호를 규칙으로 먼저 점검하고 Issue 초안, PR 문구, 릴리스 체크리스트로 정리합니다.",
    outcomes: ["점검 점수", "차단 항목", "Issue 초안", "PR 설명"],
    pass: "통과", review: "검토", sample: "예시 보고서", evidence: [["P1", ".env.example", "환경 변수는 local preview production 으로 나눠야 합니다"], ["P1", "README.md", "빠른 시작은 5분 안에 끝나야 합니다"], ["P2", "release docs", "릴리스 체크리스트는 유지보수자가 볼 수 있어야 합니다"]],
    pr: "복사 가능한 PR 설명", workflow: "점검 결과를 개발 흐름에 연결", developerTools: "개발자 도구 보기", programmingLab: "프로그래밍 열기",
    security: "보안", privacy: "개인정보", terms: "약관",
  },
  es: {
    audit: "Auditoría", tools: "Herramientas", programming: "Programación", eyebrow: "Auditoría de lanzamiento GitHub",
    title: "Pega un repo y detecta bloqueos antes de publicar.",
    subtitle: "Primero revisa README, variables, CI, despliegue y seguridad con reglas deterministas. Luego genera issues, texto de PR y checklist de release.",
    outcomes: ["Puntuación", "Bloqueos", "Borradores issue", "Descripción PR"],
    pass: "OK", review: "Revisar", sample: "Informe ejemplo", evidence: [["P1", ".env.example", "Las variables deben separarse por local preview production"], ["P1", "README.md", "El quick start debe durar menos de cinco minutos"], ["P2", "release docs", "El checklist de release debe ser visible"]],
    pr: "Descripción PR lista", workflow: "Lleva la auditoría al flujo de desarrollo", developerTools: "Ver herramientas", programmingLab: "Abrir programación",
    security: "Seguridad", privacy: "Privacidad", terms: "Términos",
  },
  fr: {
    audit: "Audit", tools: "Outils", programming: "Programmation", eyebrow: "Audit de lancement GitHub",
    title: "Collez un repo. Trouvez les blocages avant publication.",
    subtitle: "Contrôles déterministes pour README, variables, CI, déploiement et sécurité, puis brouillons d’issues, texte de PR et checklist de release.",
    outcomes: ["Score", "Blocages", "Brouillons issue", "Description PR"],
    pass: "OK", review: "À vérifier", sample: "Exemple de rapport", evidence: [["P1", ".env.example", "Les variables doivent séparer local preview production"], ["P1", "README.md", "Le démarrage rapide doit rester sous cinq minutes"], ["P2", "release docs", "La checklist de release doit être visible"]],
    pr: "Description PR prête", workflow: "Intégrer l’audit au flux dev", developerTools: "Voir les outils", programmingLab: "Ouvrir programmation",
    security: "Sécurité", privacy: "Confidentialité", terms: "Conditions",
  },
  de: {
    audit: "Audit", tools: "Tools", programming: "Programmieren", eyebrow: "GitHub Launch Audit",
    title: "Repo einfügen. Launch-Blocker finden.",
    subtitle: "Regelbasierte Checks für README, Umgebungsvariablen, CI, Deployment und Sicherheit, danach Issue-Entwürfe, PR-Text und Release-Checkliste.",
    outcomes: ["Score", "Blocker", "Issue Entwürfe", "PR Beschreibung"],
    pass: "OK", review: "Prüfen", sample: "Beispielbericht", evidence: [["P1", ".env.example", "Env-Keys brauchen local preview production Trennung"], ["P1", "README.md", "Quick Start sollte unter fünf Minuten bleiben"], ["P2", "release docs", "Release-Checkliste muss sichtbar sein"]],
    pr: "Kopierbare PR Beschreibung", workflow: "Audit in den Dev-Workflow bringen", developerTools: "Tools ansehen", programmingLab: "Programmieren öffnen",
    security: "Sicherheit", privacy: "Datenschutz", terms: "Bedingungen",
  },
  pt: {
    audit: "Auditoria", tools: "Ferramentas", programming: "Programação", eyebrow: "Auditoria de lançamento GitHub",
    title: "Cole um repo e veja bloqueios antes do lançamento.",
    subtitle: "Checagens determinísticas para README, env, CI, deploy e segurança, depois rascunhos de issues, texto de PR e checklist de release.",
    outcomes: ["Pontuação", "Bloqueios", "Issues", "Descrição PR"],
    pass: "OK", review: "Revisar", sample: "Relatório exemplo", evidence: [["P1", ".env.example", "Variáveis precisam separar local preview production"], ["P1", "README.md", "Quick start deve ficar abaixo de cinco minutos"], ["P2", "release docs", "Checklist de release deve ficar visível"]],
    pr: "Descrição PR pronta", workflow: "Levar auditoria ao fluxo dev", developerTools: "Ver ferramentas", programmingLab: "Abrir programação",
    security: "Segurança", privacy: "Privacidade", terms: "Termos",
  },
  ru: {
    audit: "Аудит", tools: "Инструменты", programming: "Программирование", eyebrow: "GitHub аудит перед запуском",
    title: "Вставьте репозиторий и найдите блокеры запуска.",
    subtitle: "Проверки README, env, CI, деплоя и безопасности по правилам, затем черновики issues, PR описание и release checklist.",
    outcomes: ["Оценка", "Блокеры", "Issues", "PR описание"],
    pass: "OK", review: "Проверить", sample: "Пример отчета", evidence: [["P1", ".env.example", "Env ключи нужно разделить на local preview production"], ["P1", "README.md", "Quick start должен быть короче пяти минут"], ["P2", "release docs", "Release checklist должен быть видимым"]],
    pr: "Готовое PR описание", workflow: "Перенести аудит в dev flow", developerTools: "Открыть инструменты", programmingLab: "Открыть программирование",
    security: "Безопасность", privacy: "Приватность", terms: "Условия",
  },
  ar: {
    audit: "تدقيق الإطلاق", tools: "الأدوات", programming: "البرمجة", eyebrow: "تدقيق GitHub قبل الإطلاق",
    title: "ألصق المستودع واعرف عوائق الإطلاق.",
    subtitle: "فحوصات قواعدية لـ README والمتغيرات و CI والنشر والأمان، ثم مسودات Issues ووصف PR وقائمة إطلاق.",
    outcomes: ["النتيجة", "العوائق", "مسودات Issues", "وصف PR"],
    pass: "ناجح", review: "مراجعة", sample: "تقرير مثال", evidence: [["P1", ".env.example", "يجب فصل المتغيرات بين local preview production"], ["P1", "README.md", "البداية السريعة يجب أن تكون أقل من خمس دقائق"], ["P2", "release docs", "قائمة الإطلاق يجب أن تكون مرئية"]],
    pr: "وصف PR جاهز للنسخ", workflow: "أدخل التدقيق في سير التطوير", developerTools: "عرض أدوات المطور", programmingLab: "فتح البرمجة",
    security: "الأمان", privacy: "الخصوصية", terms: "الشروط",
  },
  hi: {
    audit: "लॉन्च ऑडिट", tools: "टूल्स", programming: "प्रोग्रामिंग", eyebrow: "GitHub लॉन्च ऑडिट",
    title: "Repo पेस्ट करें और लॉन्च blockers देखें।",
    subtitle: "README, env, CI, deploy और security को नियमों से जांचें, फिर issue drafts, PR copy और release checklist बनाएं।",
    outcomes: ["स्कोर", "अवरोध", "Issue मसौदे", "PR विवरण"],
    pass: "पास", review: "जांचें", sample: "नमूना रिपोर्ट", evidence: [["P1", ".env.example", "Env keys को local preview production में अलग करें"], ["P1", "README.md", "Quick start पांच मिनट से कम रखें"], ["P2", "release docs", "Release checklist दिखनी चाहिए"]],
    pr: "कॉपी योग्य PR विवरण", workflow: "Audit को developer workflow में लाएं", developerTools: "डेवलपर टूल्स देखें", programmingLab: "प्रोग्रामिंग खोलें",
    security: "Security", privacy: "Privacy", terms: "Terms",
  },
  id: {
    audit: "Audit", tools: "Alat", programming: "Pemrograman", eyebrow: "Audit rilis GitHub",
    title: "Tempel repo dan temukan blocker sebelum rilis.",
    subtitle: "Cek README, env, CI, deploy, dan keamanan dengan aturan, lalu buat draft issue, teks PR, dan checklist rilis.",
    outcomes: ["Skor", "Blocker", "Draft issue", "Deskripsi PR"],
    pass: "Lulus", review: "Tinjau", sample: "Contoh laporan", evidence: [["P1", ".env.example", "Env perlu dibagi local preview production"], ["P1", "README.md", "Quick start sebaiknya di bawah lima menit"], ["P2", "release docs", "Checklist rilis harus terlihat"]],
    pr: "Deskripsi PR siap salin", workflow: "Masukkan audit ke alur developer", developerTools: "Lihat alat developer", programmingLab: "Buka pemrograman",
    security: "Keamanan", privacy: "Privasi", terms: "Ketentuan",
  },
  vi: {
    audit: "Kiểm tra", tools: "Công cụ", programming: "Lập trình", eyebrow: "Kiểm tra GitHub trước khi ra mắt",
    title: "Dán repo và tìm blocker trước khi ra mắt.",
    subtitle: "Kiểm tra README, env, CI, deploy và bảo mật bằng luật, rồi tạo issue draft, PR copy và release checklist.",
    outcomes: ["Điểm", "Blocker", "Issue draft", "PR mô tả"],
    pass: "Đạt", review: "Xem lại", sample: "Báo cáo mẫu", evidence: [["P1", ".env.example", "Env cần tách local preview production"], ["P1", "README.md", "Quick start nên dưới năm phút"], ["P2", "release docs", "Release checklist cần hiển thị"]],
    pr: "PR mô tả sẵn sao chép", workflow: "Đưa audit vào quy trình dev", developerTools: "Xem công cụ dev", programmingLab: "Mở lập trình",
    security: "Bảo mật", privacy: "Riêng tư", terms: "Điều khoản",
  },
  th: {
    audit: "ตรวจปล่อยงาน", tools: "เครื่องมือ", programming: "เขียนโปรแกรม", eyebrow: "GitHub Launch Audit",
    title: "วาง repo แล้วดู blocker ก่อนปล่อยจริง",
    subtitle: "ตรวจ README, env, CI, deploy และ security ด้วยกฎ แล้วสรุปเป็น issue draft, PR copy และ release checklist",
    outcomes: ["คะแนน", "จุดติดขัด", "ร่าง issue", "คำอธิบาย PR"],
    pass: "ผ่าน", review: "ตรวจเพิ่ม", sample: "รายงานตัวอย่าง", evidence: [["P1", ".env.example", "Env ต้องแยก local preview production"], ["P1", "README.md", "Quick start ควรต่ำกว่า 5 นาที"], ["P2", "release docs", "ต้องเห็น release checklist"]],
    pr: "คำอธิบาย PR พร้อมคัดลอก", workflow: "นำ audit เข้าสู่ dev workflow", developerTools: "ดูเครื่องมือ", programmingLab: "เปิดบทเรียนโปรแกรม",
    security: "Security", privacy: "Privacy", terms: "Terms",
  },
  tr: {
    audit: "Denetim", tools: "Araçlar", programming: "Programlama", eyebrow: "GitHub yayın denetimi",
    title: "Repo yapıştır, yayın engellerini gör.",
    subtitle: "README, env, CI, dağıtım ve güvenliği kurallarla kontrol eder; issue taslakları, PR metni ve release checklist üretir.",
    outcomes: ["Skor", "Engeller", "Issue taslakları", "PR açıklaması"],
    pass: "Geçti", review: "İncele", sample: "Örnek rapor", evidence: [["P1", ".env.example", "Env anahtarları local preview production olarak ayrılmalı"], ["P1", "README.md", "Quick start beş dakikanın altında olmalı"], ["P2", "release docs", "Release checklist görünür olmalı"]],
    pr: "Kopyalanabilir PR açıklaması", workflow: "Denetimi geliştirici akışına taşı", developerTools: "Araçları gör", programmingLab: "Programlamayı aç",
    security: "Güvenlik", privacy: "Gizlilik", terms: "Şartlar",
  },
  it: {
    audit: "Audit", tools: "Strumenti", programming: "Programmazione", eyebrow: "Audit GitHub prima del lancio",
    title: "Incolla un repo e trova i blocchi di lancio.",
    subtitle: "Controlli deterministici per README, env, CI, deploy e sicurezza, poi bozze issue, testo PR e checklist release.",
    outcomes: ["Punteggio", "Blocchi", "Issue draft", "Descrizione PR"],
    pass: "OK", review: "Rivedi", sample: "Report esempio", evidence: [["P1", ".env.example", "Le env devono separare local preview production"], ["P1", "README.md", "Quick start sotto cinque minuti"], ["P2", "release docs", "Checklist release visibile"]],
    pr: "Descrizione PR pronta", workflow: "Porta audit nel flusso dev", developerTools: "Vedi strumenti", programmingLab: "Apri programmazione",
    security: "Sicurezza", privacy: "Privacy", terms: "Termini",
  },
  nl: {
    audit: "Audit", tools: "Hulpmiddelen", programming: "Programmeren", eyebrow: "GitHub launch audit",
    title: "Plak een repo en vind launch blockers.",
    subtitle: "Regelchecks voor README, env, CI, deploy en security, daarna issue drafts, PR tekst en release checklist.",
    outcomes: ["Score", "Blockers", "Issue drafts", "PR beschrijving"],
    pass: "OK", review: "Controleren", sample: "Voorbeeldrapport", evidence: [["P1", ".env.example", "Env keys moeten local preview production scheiden"], ["P1", "README.md", "Quick start onder vijf minuten houden"], ["P2", "release docs", "Release checklist moet zichtbaar zijn"]],
    pr: "Kopieerbare PR beschrijving", workflow: "Breng audit in de dev workflow", developerTools: "Bekijk tools", programmingLab: "Open programmeren",
    security: "Beveiliging", privacy: "Privacy", terms: "Voorwaarden",
  },
  pl: {
    audit: "Audyt", tools: "Narzędzia", programming: "Programowanie", eyebrow: "GitHub audyt przed publikacją",
    title: "Wklej repo i znajdź blokery publikacji.",
    subtitle: "Regułowe kontrole README, env, CI, deploy i bezpieczeństwa, potem szkice issue, opis PR i release checklist.",
    outcomes: ["Wynik", "Blokery", "Issue drafts", "Opis PR"],
    pass: "OK", review: "Sprawdź", sample: "Przykładowy raport", evidence: [["P1", ".env.example", "Env keys muszą rozdzielać local preview production"], ["P1", "README.md", "Quick start powinien być poniżej pięciu minut"], ["P2", "release docs", "Release checklist musi być widoczny"]],
    pr: "Opis PR do skopiowania", workflow: "Wprowadź audyt do dev workflow", developerTools: "Zobacz narzędzia", programmingLab: "Otwórz programowanie",
    security: "Bezpieczeństwo", privacy: "Prywatność", terms: "Warunki",
  },
} satisfies Record<InterfaceLanguage, {
  audit: string;
  tools: string;
  programming: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  outcomes: string[];
  pass: string;
  review: string;
  sample: string;
  evidence: string[][];
  pr: string;
  workflow: string;
  developerTools: string;
  programmingLab: string;
  security: string;
  privacy: string;
  terms: string;
}>;

const homePreviewCopy: Record<InterfaceLanguage, {
  outcomesAria: string;
  reportAria: string;
  prText: string;
}> = {
  en: {
    outcomesAria: "Core outcomes",
    reportAria: "Report preview",
    prText: `## Launch readiness audit

Score: 86/100
Risk: Low

### Today
- [ ] Document env keys by environment

### Before public launch
- [ ] Keep quick start under five minutes
- [ ] Keep release checklist visible

### Verification
npm run lint
npm run build`,
  },
  zh: {
    outcomesAria: "核心结果",
    reportAria: "报告预览",
    prText: `## 上线前体检

评分: 86/100
风险: 低

### 今天
- [ ] 按环境补全变量说明

### 公开发布前
- [ ] 快速开始控制在五分钟内
- [ ] 发布清单放在可见位置

### 验证
npm run lint
npm run build`,
  },
  ja: {
    outcomesAria: "主な結果",
    reportAria: "レポートプレビュー",
    prText: `## 公開前診断

スコア: 86/100
リスク: 低

### 今日
- [ ] 環境ごとの変数を文書化

### 公開前
- [ ] クイックスタートを五分以内にする
- [ ] リリースチェックリストを見える場所に置く

### 検証
npm run lint
npm run build`,
  },
  ko: {
    outcomesAria: "핵심 결과",
    reportAria: "보고서 미리보기",
    prText: `## 출시 전 점검

점수: 86/100
위험: 낮음

### 오늘
- [ ] 환경별 변수 문서화

### 공개 출시 전
- [ ] 빠른 시작을 5분 안으로 유지
- [ ] 릴리스 체크리스트를 보이게 유지

### 검증
npm run lint
npm run build`,
  },
  es: {
    outcomesAria: "Resultados clave",
    reportAria: "Vista previa del informe",
    prText: `## Auditoria antes del lanzamiento

Puntuacion: 86/100
Riesgo: bajo

### Hoy
- [ ] Documentar variables por entorno

### Antes de publicar
- [ ] Mantener el inicio rapido bajo cinco minutos
- [ ] Mantener visible la checklist de release

### Verificacion
npm run lint
npm run build`,
  },
  fr: {
    outcomesAria: "Resultats principaux",
    reportAria: "Apercu du rapport",
    prText: `## Audit avant lancement

Score: 86/100
Risque: faible

### Aujourd hui
- [ ] Documenter les variables par environnement

### Avant publication
- [ ] Garder le demarrage rapide sous cinq minutes
- [ ] Rendre la checklist de release visible

### Verification
npm run lint
npm run build`,
  },
  de: {
    outcomesAria: "Kernergebnisse",
    reportAria: "Berichtsvorschau",
    prText: `## Launch Audit

Score: 86/100
Risiko: niedrig

### Heute
- [ ] Env Variablen pro Umgebung dokumentieren

### Vor dem oeffentlichen Launch
- [ ] Quick Start unter fuenf Minuten halten
- [ ] Release Checkliste sichtbar halten

### Verifizierung
npm run lint
npm run build`,
  },
  pt: {
    outcomesAria: "Resultados principais",
    reportAria: "Previa do relatorio",
    prText: `## Auditoria antes do lancamento

Pontuacao: 86/100
Risco: baixo

### Hoje
- [ ] Documentar env por ambiente

### Antes do lancamento publico
- [ ] Manter inicio rapido abaixo de cinco minutos
- [ ] Manter checklist de release visivel

### Verificacao
npm run lint
npm run build`,
  },
  ru: {
    outcomesAria: "Ключевые результаты",
    reportAria: "Предпросмотр отчета",
    prText: `## Аудит перед запуском

Оценка: 86/100
Риск: низкий

### Сегодня
- [ ] Описать env ключи по окружениям

### Перед публичным запуском
- [ ] Удержать quick start до пяти минут
- [ ] Оставить release checklist видимым

### Проверка
npm run lint
npm run build`,
  },
  ar: {
    outcomesAria: "النتائج الأساسية",
    reportAria: "معاينة التقرير",
    prText: `## تدقيق الجاهزية للإطلاق

النتيجة: 86/100
المخاطر: منخفضة

### اليوم
- [ ] وثق مفاتيح البيئة حسب كل بيئة

### قبل الإطلاق العام
- [ ] اجعل البداية السريعة أقل من خمس دقائق
- [ ] اجعل قائمة الإطلاق ظاهرة للفريق

### التحقق
npm run lint
npm run build`,
  },
  hi: {
    outcomesAria: "मुख्य परिणाम",
    reportAria: "रिपोर्ट पूर्वावलोकन",
    prText: `## लॉन्च तैयारी ऑडिट

स्कोर: 86/100
जोखिम: कम

### आज
- [ ] हर environment के env keys लिखें

### सार्वजनिक लॉन्च से पहले
- [ ] Quick start पांच मिनट से कम रखें
- [ ] Release checklist साफ दिखाएं

### जांच
npm run lint
npm run build`,
  },
  id: {
    outcomesAria: "Hasil utama",
    reportAria: "Pratinjau laporan",
    prText: `## Audit kesiapan rilis

Skor: 86/100
Risiko: rendah

### Hari ini
- [ ] Dokumentasikan env key per lingkungan

### Sebelum rilis publik
- [ ] Jaga quick start di bawah lima menit
- [ ] Buat checklist rilis mudah terlihat

### Verifikasi
npm run lint
npm run build`,
  },
  vi: {
    outcomesAria: "Ket qua chinh",
    reportAria: "Xem truoc bao cao",
    prText: `## Kiem tra san sang ra mat

Diem: 86/100
Rui ro: thap

### Hom nay
- [ ] Ghi ro env key theo tung moi truong

### Truoc khi ra mat cong khai
- [ ] Giu quick start duoi nam phut
- [ ] De checklist release o noi de thay

### Kiem tra
npm run lint
npm run build`,
  },
  th: {
    outcomesAria: "ผลลัพธ์หลัก",
    reportAria: "ตัวอย่างรายงาน",
    prText: `## ตรวจความพร้อมก่อนปล่อย

คะแนน: 86/100
ความเสี่ยง: ต่ำ

### วันนี้
- [ ] เขียน env key แยกตาม environment

### ก่อนเปิดสาธารณะ
- [ ] ทำ quick start ให้น้อยกว่า 5 นาที
- [ ] วาง release checklist ให้ทีมเห็น

### ตรวจสอบ
npm run lint
npm run build`,
  },
  tr: {
    outcomesAria: "Ana sonuclar",
    reportAria: "Rapor onizleme",
    prText: `## Yayin hazirlik denetimi

Skor: 86/100
Risk: dusuk

### Bugun
- [ ] Env anahtarlarini ortama gore belgeleyin

### Halka acik yayindan once
- [ ] Quick start bes dakikanin altinda kalsin
- [ ] Release checklist gorunur olsun

### Dogrulama
npm run lint
npm run build`,
  },
  it: {
    outcomesAria: "Risultati chiave",
    reportAria: "Anteprima report",
    prText: `## Audit prontezza lancio

Punteggio: 86/100
Rischio: basso

### Oggi
- [ ] Documentare le env key per ambiente

### Prima del lancio pubblico
- [ ] Tenere il quick start sotto cinque minuti
- [ ] Tenere visibile la checklist release

### Verifica
npm run lint
npm run build`,
  },
  nl: {
    outcomesAria: "Kernresultaten",
    reportAria: "Rapportvoorbeeld",
    prText: `## Launch gereedheidsaudit

Score: 86/100
Risico: laag

### Vandaag
- [ ] Documenteer env keys per omgeving

### Voor publieke launch
- [ ] Houd quick start onder vijf minuten
- [ ] Houd release checklist zichtbaar

### Controle
npm run lint
npm run build`,
  },
  pl: {
    outcomesAria: "Glowne wyniki",
    reportAria: "Podglad raportu",
    prText: `## Audyt gotowosci publikacji

Wynik: 86/100
Ryzyko: niskie

### Dzisiaj
- [ ] Opisz env key dla kazdego srodowiska

### Przed publiczna publikacja
- [ ] Utrzymaj quick start ponizej pieciu minut
- [ ] Utrzymaj release checklist w widocznym miejscu

### Weryfikacja
npm run lint
npm run build`,
  },
};

export async function generateMetadata({ searchParams }: { searchParams: HomeSearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const language = resolveHomeLanguage(params?.lang, params?.ui, await headerLanguage());
  const t = homeCopy[language];
  const title = `${t.eyebrow} | JinMing Lab`;

  return {
    title,
    description: t.subtitle,
    keywords: [
      "GitHub launch audit",
      "repo readiness checker",
      "deterministic checks",
      "release checklist",
      "GitHub issue template",
      "PR description generator",
      "GitHub 项目体检",
    ],
    alternates: {
      canonical: localizedHref("/", language),
      languages: localizedLanguageAlternates("/"),
    },
    openGraph: {
      title,
      description: t.subtitle,
      url: "https://vantaapi.com",
      siteName: "JinMing Lab",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description: t.subtitle,
    },
  };
}

export default async function HomePage({ searchParams }: { searchParams: HomeSearchParams }) {
  const params = await searchParams;
  const language = resolveHomeLanguage(params?.lang, params?.ui, await headerLanguage());
  const isRtl = language === "ar";
  const t = homeCopy[language];
  const preview = homePreviewCopy[language];

  const scorecards = [
    ["README", "90", t.pass],
    ["ENV", "75", t.review],
    ["CI", "85", t.pass],
    ["DEPLOY", "82", t.pass],
    ["SECURITY", "88", t.pass],
  ];

  const evidenceCards = t.evidence;

  return (
    <main className="home-audit-page" dir={isRtl ? "rtl" : "ltr"}>
      <header className="home-audit-nav">
        <Link href={localizedHref("/", language)} className="home-audit-brand">
          <span>JM</span>
          <strong>JinMing Lab</strong>
        </Link>
        <nav>
          <Link href={localizedHref("/tools/github-repo-analyzer", language)}>{t.audit}</Link>
          <Link href={localizedHref("/tools", language)}>{t.tools}</Link>
          <Link href={localizedHref("/english", language)}>{language === "zh" ? "英语" : "English"}</Link>
          <Link href={localizedHref("/programming", language)}>{t.programming}</Link>
          <FlagLanguageToggle initialLanguage={language} />
        </nav>
      </header>

      <section className="home-audit-command">
        <div className="home-audit-hero">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <RepoAuditForm language={language} />
          <div className="home-audit-outcomes" aria-label={preview.outcomesAria}>
            {t.outcomes.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <p>{t.subtitle}</p>
        </div>

        <div className="home-audit-preview" aria-label={preview.reportAria}>
          <div className="home-audit-report">
            <div className="home-audit-report-head">
              <div>
                <p className="eyebrow">{t.sample}</p>
                <h2>vercel/swr</h2>
              </div>
              <strong>86</strong>
            </div>
            <div className="home-audit-score-strip">
              {scorecards.map(([label, score, status]) => (
                <article key={label}>
                  <span>{label}</span>
                  <strong>{score}</strong>
                  <em>{status}</em>
                </article>
              ))}
            </div>
            <div className="home-audit-evidence-grid">
              {evidenceCards.map(([severity, source, body]) => (
                <article key={`${severity}-${source}`}>
                  <div>
                    <span>{severity}</span>
                    <strong>{source}</strong>
                  </div>
                  <p>{body}</p>
                </article>
              ))}
            </div>
            <div className="home-audit-pr-preview">
              <div>
                <p className="eyebrow">{t.pr}</p>
                <h3>{t.workflow}</h3>
              </div>
              <pre>{preview.prText}</pre>
            </div>
          </div>
        </div>
      </section>

      <footer className="home-audit-footer">
        <Link href={localizedHref("/tools", language)}>{t.developerTools}</Link>
        <Link href={localizedHref("/english", language)}>{language === "zh" ? "英语入口" : "English"}</Link>
        <Link href={localizedHref("/programming", language)}>{t.programmingLab}</Link>
        <Link href={localizedHref("/security", language)}>{t.security}</Link>
        <Link href={localizedHref("/privacy", language)}>{t.privacy}</Link>
        <Link href={localizedHref("/terms", language)}>{t.terms}</Link>
      </footer>
    </main>
  );
}
