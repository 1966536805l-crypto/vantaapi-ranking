import { ModuleDetail } from "@/components/learning/ModuleHub";

export default function Page() {
  return <ModuleDetail eyebrow="C++ Basics" title="Syntax And Types" description="Variables input output branches loops and functions with dense code reading practice." practiceHref="/cpp/quiz/basics" sections={[{ title: "Core scope", body: "int double char string cin cout if else for while and functions.", examples: ["int score = 100;", "cout << 3 + 4;"] }, { title: "Question types", body: "Multiple choice fill blank code reading and output prediction are supported without online execution." }]} />;
}
