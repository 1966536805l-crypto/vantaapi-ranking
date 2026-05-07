import { ModuleDetail } from "@/components/learning/ModuleHub";

export default function Page() {
  return <ModuleDetail eyebrow="C++ Algorithms" title="Algorithm Basics" description="Simulation arrays strings searching counting and output prediction." practiceHref="/cpp/quiz/algorithms" sections={[{ title: "MVP scope", body: "Loop simulation array traversal string processing simple search and counting." }, { title: "Later scope", body: "Online execution judging leaderboards submissions and solution discussions can be added after the MVP is stable." }]} />;
}
