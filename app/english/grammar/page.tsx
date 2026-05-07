import { ModuleDetail } from "@/components/learning/ModuleHub";
import { requireChineseForEnglishLearning } from "@/lib/english-content-access";
import { resolveLanguage, type PageSearchParams } from "@/lib/language";

export default async function Page({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const language = resolveLanguage(searchParams ? await searchParams : undefined);
  requireChineseForEnglishLearning(language);

  return <ModuleDetail eyebrow="英语语法" title="语法系统" description="短规则 例句 判断题 选择题 组合成可持续练习" practiceHref="/english/quiz/grammar?lang=zh" sections={[{ title: "核心范围", body: "时态 主谓一致 句型 从句 连接词和常见错误会拆成短课 每次只练一个点", examples: ["She studies English every day.", "The evidence suggests that the claim needs support."] }, { title: "练习闭环", body: "先读规则 再看例句 然后做检查题 错题进入复盘" }]} />;
}
