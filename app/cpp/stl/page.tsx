import { ModuleDetail } from "@/components/learning/ModuleHub";

export default function Page() {
  return <ModuleDetail eyebrow="C++ STL" title="STL Containers" description="vector map set queue stack and common operations." practiceHref="/cpp/quiz/stl" sections={[{ title: "Containers", body: "vector map set queue and stack cover most beginner storage patterns.", examples: ["vector<int> a; a.push_back(1);", "map<string, int> count;"] }, { title: "Practice", body: "Choose the right container read short snippets and predict output." }]} />;
}
