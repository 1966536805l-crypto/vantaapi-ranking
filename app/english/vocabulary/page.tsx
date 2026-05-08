import Link from "next/link";
import { AppleStudyHeader } from "@/components/learning/ModuleHub";
import { requireChineseForEnglishLearning } from "@/lib/english-content-access";
import { examVocabularyPacks, keySentenceFrames } from "@/lib/exam-content";
import {
  getFrameLabel,
  getFrameUsage,
  getPackFocus,
  getPackShortTitle,
  getReadingLogicWords,
  vocabularyHubCopy,
} from "@/lib/exam-i18n";
import { bilingualLanguage, localizedHref, resolveInterfaceLanguage, type PageSearchParams } from "@/lib/language";

export default async function VocabularyPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveInterfaceLanguage(searchParams ? await searchParams : undefined);
  requireChineseForEnglishLearning(language);
  const copyLanguage = bilingualLanguage(language);
  const copy = vocabularyHubCopy[copyLanguage];

  return (
    <main className="apple-page pb-12 pt-4">
      <AppleStudyHeader language={language} />
      <section className="apple-shell py-7">
        <div className="module-hero px-5 py-6">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 className="apple-display-title mt-3 max-w-4xl text-3xl sm:text-4xl">{copy.title}</h1>
          <p className="apple-display-subtitle mt-3 max-w-3xl text-sm text-[color:var(--muted)]">
            {copy.subtitle}
          </p>
        </div>

        <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Link href={localizedHref("/english/typing", language)} className="dense-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{copyLanguage === "zh" ? "英文打字" : "English typing"}</p>
                <h2 className="mt-2 text-xl font-semibold">{copyLanguage === "zh" ? "听写打字系统" : "Typing System"}</h2>
              </div>
              <span className="text-3xl font-semibold">⌨</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              {copyLanguage === "zh"
                ? "听发音后输入英文 · 实时验证 · 拼对过关 · 本地进度"
                : "Listen then type English · Real-time feedback · Spell to pass · Local progress"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(copyLanguage === "zh" ? ["听音", "盲打", "错了重听", "本地进度"] : ["listen", "type", "retry", "local progress"]).map((item) => (
                <span key={item} className="dense-status">{item}</span>
              ))}
            </div>
          </Link>
          <Link href={localizedHref("/english/vocabulary/custom", language)} className="dense-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{copyLanguage === "zh" ? "我的词书" : "My Wordbook"}</p>
                <h2 className="mt-2 text-xl font-semibold">{copyLanguage === "zh" ? "自定义词书" : "Custom Wordbook"}</h2>
              </div>
              <span className="text-3xl font-semibold">+</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              {copyLanguage === "zh"
                ? "自建词库 · 批量导入 · 本机保存 · 四选一训练 · 艾宾浩斯复习"
                : "Custom wordbook · Bulk import · Local storage · Four-choice drill · Ebbinghaus review"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(copyLanguage === "zh" ? ["自建词库", "批量导入", "本机保存", "直接训练"] : ["custom", "bulk import", "local", "train"]).map((item) => (
                <span key={item} className="dense-status">{item}</span>
              ))}
            </div>
          </Link>
          {examVocabularyPacks.map((pack) => (
            <Link key={pack.slug} href={localizedHref(pack.route, language)} className="dense-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">{pack.level}</p>
                  <h2 className="mt-2 text-xl font-semibold">{getPackShortTitle(pack, copyLanguage)}</h2>
                </div>
                <span className="dense-status">{copyLanguage === "zh" ? "持续扩充" : "expanding"}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{getPackFocus(pack, copyLanguage).join("  ")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {pack.priorityWords.slice(0, 4).map((item) => (
                  <span key={item.word} className="dense-status">{item.word}</span>
                ))}
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="dense-panel p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">{copy.sentenceEyebrow}</p>
                <h2 className="mt-2 text-2xl font-semibold">{copy.sentenceTitle}</h2>
              </div>
              <Link href={localizedHref("/english/quiz/vocabulary", language)} className="dense-action-primary">{copy.quizLabel}</Link>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {keySentenceFrames.map((frame) => (
                <div key={frame.sentence} className="dense-card p-3 text-sm leading-6">
                  <p className="font-medium">{getFrameLabel(frame, copyLanguage)}</p>
                  <p className="mt-1">{frame.sentence}</p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{getFrameUsage(frame, copyLanguage)}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="dense-panel p-4 sm:p-5">
            <p className="eyebrow">{copy.logicEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold">{copy.logicTitle}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {getReadingLogicWords(copyLanguage).map((item) => (
                <span key={item} className="dense-status">{item}</span>
              ))}
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
