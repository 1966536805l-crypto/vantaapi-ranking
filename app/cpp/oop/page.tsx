import { ModuleDetail } from "@/components/learning/ModuleHub";

export default function Page() {
  return <ModuleDetail eyebrow="C++ OOP" title="Object Oriented C++" description="class object public private constructors members and inheritance." practiceHref="/cpp/quiz/oop" sections={[{ title: "Core concepts", body: "A class groups state and behavior. Access control decides what outside code can touch." }, { title: "Practice goal", body: "Read class definitions predict object state and understand constructor order." }]} />;
}
