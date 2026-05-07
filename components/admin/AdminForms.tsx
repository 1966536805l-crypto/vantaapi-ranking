"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type AdminFormsProps = { kind: "courses" | "lessons" | "questions" };
type AdminCourse = { id: string; title: string; slug: string; direction: "ENGLISH" | "CPP" };
type AdminLesson = { id: string; title: string; slug: string; courseId?: string; course?: AdminCourse };
type AdminItem = Record<string, unknown> & {
  id: string;
  title?: string;
  slug?: string;
  prompt?: string;
  course?: AdminCourse;
  lesson?: AdminLesson & { course?: AdminCourse };
};

const kindLabel = {
  courses: "课程",
  lessons: "知识点",
  questions: "题目",
};

const questionTypeLabel = {
  MULTIPLE_CHOICE: "选择题",
  FILL_BLANK: "填空题",
  CODE_READING: "代码阅读题",
};

const difficultyLabel = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseOptions(value: FormDataEntryValue | null) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({
      label: String.fromCharCode(65 + index),
      content: line.replace(/^\*/, "").trim(),
      isCorrect: line.startsWith("*"),
    }));
}

function optionText(item: AdminItem | null) {
  const options = (item?.options || []) as { content: string; isCorrect?: boolean }[];
  return options.map((option) => `${option.isCorrect ? "*" : ""}${option.content}`).join("\n");
}

function itemSubtitle(item: AdminItem, kind: AdminFormsProps["kind"]) {
  if (kind === "courses") return `${item.direction === "CPP" ? "C++" : "英语"} · /${item.slug}`;
  if (kind === "lessons") return `${item.course?.title || "未关联课程"} · /${item.slug}`;
  if (kind === "questions") return `${item.lesson?.course?.title || "未关联课程"} · ${item.lesson?.title || "未关联知识点"} · ${difficultyLabel[String(item.difficulty || "EASY") as keyof typeof difficultyLabel] || "Easy"}`;
  return item.id;
}

function validateAdminPayload(kind: AdminFormsProps["kind"], body: Record<string, unknown>) {
  const slug = String(body.slug || "").trim();
  const sortOrder = Number(body.sortOrder ?? 0);

  if ((kind === "courses" || kind === "lessons") && !slugPattern.test(slug)) {
    return "Slug 只能使用小写字母、数字和中横线，例如 cpp-basics";
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 9999) {
    return "排序必须是 0-9999 的整数";
  }
  if (kind === "courses" && !String(body.title || "").trim()) return "请填写课程标题";
  if (kind === "lessons") {
    if (!String(body.courseId || "")) return "请先选择所属课程";
    if (!String(body.title || "").trim()) return "请填写知识点标题";
    if (!String(body.content || "").trim()) return "请填写讲解内容";
  }
  if (kind === "questions") {
    if (!String(body.lessonId || "")) return "请先选择所属知识点";
    if (!String(body.prompt || "").trim()) return "请填写题干";
    if (!String(body.answer || "").trim()) return "请填写正确答案";
    if (String(body.type) === "MULTIPLE_CHOICE") {
      const options = (body.options || []) as { isCorrect?: boolean }[];
      if (options.length < 2) return "选择题至少需要 2 个选项";
      if (options.filter((option) => option.isCorrect).length !== 1) return "选择题必须且只能有 1 个正确选项，请用 * 标记";
    }
  }
  return "";
}

export default function AdminForms({ kind }: AdminFormsProps) {
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"muted" | "success" | "error">("muted");
  const [items, setItems] = useState<AdminItem[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [editing, setEditing] = useState<AdminItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  function show(text: string, tone: "muted" | "success" | "error" = "muted") {
    setMessage(text);
    setMessageTone(tone);
  }

  const loadRelations = useCallback(async () => {
    if (kind === "lessons" || kind === "questions") {
      const response = await fetch("/api/admin/courses");
      const data = await response.json().catch(() => ({}));
      if (response.ok) setCourses(data.courses || []);
    }
    if (kind === "questions") {
      const response = await fetch("/api/admin/lessons");
      const data = await response.json().catch(() => ({}));
      if (response.ok) setLessons(data.lessons || []);
    }
  }, [kind]);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/admin/${kind}`);
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      show(data.message || "加载失败", "error");
      return;
    }
    setItems(data[kind] || []);
    show(`已加载 ${data[kind]?.length || 0} 个${kindLabel[kind]}`);
  }, [kind]);

  const loadAll = useCallback(async () => {
    await Promise.all([load(), loadRelations()]);
  }, [load, loadRelations]);

  useEffect(() => {
    void Promise.resolve().then(loadAll);
  }, [loadAll]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const formElement = event.currentTarget;
      const form = new FormData(formElement);
      const body: Record<string, unknown> = Object.fromEntries(form.entries());

      if (kind === "courses") {
        body.slug = String(form.get("slug") || "").trim().toLowerCase();
        body.title = String(form.get("title") || "").trim();
        body.description = String(form.get("description") || "").trim();
        body.direction = String(form.get("direction") || "ENGLISH");
        body.isPublished = form.get("isPublished") === "on";
        body.sortOrder = Number(form.get("sortOrder") || 0);
      }

      if (kind === "lessons") {
        body.courseId = String(form.get("courseId") || "").trim();
        body.slug = String(form.get("slug") || "").trim().toLowerCase();
        body.title = String(form.get("title") || "").trim();
        body.summary = String(form.get("summary") || "").trim();
        body.content = String(form.get("content") || "").trim();
        body.isPublished = form.get("isPublished") === "on";
        body.sortOrder = Number(form.get("sortOrder") || 0);
      }

      if (kind === "questions") {
        body.lessonId = String(form.get("lessonId") || "").trim();
        body.type = String(form.get("type") || "MULTIPLE_CHOICE");
        body.prompt = String(form.get("prompt") || "").trim();
        body.answer = String(form.get("answer") || "").trim();
        body.explanation = String(form.get("explanation") || "").trim();
        body.difficulty = String(form.get("difficulty") || "EASY");
        body.sortOrder = Number(form.get("sortOrder") || 0);
        body.options = parseOptions(form.get("options"));
        body.codeSnippet = String(form.get("codeSnippet") || "").trim() || null;
      }

      const validationMessage = validateAdminPayload(kind, body);
      if (validationMessage) {
        show(validationMessage, "error");
        setSaving(false);
        return;
      }

      const url = editing ? `/api/admin/${kind}/${editing.id}` : `/api/admin/${kind}`;
      const response = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      show(response.ok ? (editing ? "已更新" : "已创建") : data.message || "保存失败", response.ok ? "success" : "error");
      if (response.ok) {
        setEditing(null);
        formElement.reset();
        await loadAll();
      }
    } catch {
      show("保存失败，请检查网络后重试", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("确定删除？关联数据也可能被级联删除。")) return;
    const response = await fetch(`/api/admin/${kind}/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    show(response.ok ? "已删除" : data.message || "删除失败", response.ok ? "success" : "error");
    await loadAll();
  }

  const messageClass =
    messageTone === "error"
      ? "border-red-100 bg-red-50 text-red-700"
      : messageTone === "success"
        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
        : "border-black/5 bg-white/60 text-[color:var(--muted)]";

  return (
    <div className="space-y-4">
      <form key={editing?.id || "new"} onSubmit={save} className="apple-card space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">{editing ? "Edit" : "Create"}</p>
            <h2 className="mt-1 font-serif text-2xl">{editing ? "编辑" : "创建"}{kindLabel[kind]}</h2>
          </div>
          <div className="flex gap-2">
            {editing && <button type="button" onClick={() => setEditing(null)} className="apple-button-secondary px-3 py-2 text-sm">取消</button>}
            <button type="button" onClick={loadAll} disabled={loading || saving} className="apple-button-secondary px-3 py-2 text-sm disabled:opacity-50">{loading ? "加载中" : "刷新"}</button>
          </div>
        </div>

        {kind === "courses" && <CourseFields item={editing} />}
        {kind === "lessons" && <LessonFields item={editing} courses={courses} />}
        {kind === "questions" && <QuestionFields item={editing} lessons={lessons} />}

        <div className="flex flex-wrap items-center gap-3">
          <button disabled={saving} className="apple-button-primary px-5 py-2.5 text-sm disabled:opacity-50">
            {saving ? "保存中" : editing ? "保存修改" : "创建"}
          </button>
          {kind === "questions" && <p className="text-xs text-[color:var(--muted)]">选择题：正确选项行首加 *；填空/代码阅读可不填选项。</p>}
        </div>
        {message && <p className={`rounded-[8px] border px-3 py-2.5 text-sm ${messageClass}`}>{message}</p>}
      </form>

      <section className="apple-card p-5">
        <h2 className="section-rule font-serif text-2xl">当前{kindLabel[kind]}</h2>
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-[8px] border border-black/5 bg-white/65 p-3 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="line-clamp-2 font-semibold">{item.title || item.prompt || item.slug || item.id}</p>
                <p className="mt-1 text-xs text-slate-500">{itemSubtitle(item, kind)}</p>
                <p className="mt-1 font-mono text-[11px] text-slate-400">{item.id}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(item)} className="apple-button-secondary px-3 py-2 text-sm">编辑</button>
                <button onClick={() => remove(item.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">删除</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-slate-500">暂无数据。可以直接创建，或点击刷新。</p>}
        </div>
      </section>
    </div>
  );
}

function Field({ name, label, required, textarea, defaultValue, placeholder, type = "text", min, max }: { name: string; label: string; required?: boolean; textarea?: boolean; defaultValue?: string; placeholder?: string; type?: string; min?: number; max?: number }) {
  const className = "mt-2 w-full rounded-[8px] border border-black/10 bg-white/75 px-3 py-2.5 text-sm outline-none focus:border-[color:var(--accent)]";
  return <label className="block text-sm font-semibold text-slate-700">{label}{textarea ? <textarea name={name} required={required} defaultValue={defaultValue} placeholder={placeholder} rows={4} className={className} /> : <input name={name} type={type} min={min} max={max} required={required} defaultValue={defaultValue} placeholder={placeholder} className={className} />}</label>;
}

function CourseFields({ item }: { item: AdminItem | null }) {
  return <><label className="block text-sm font-semibold text-slate-700">学习方向<select name="direction" defaultValue={String(item?.direction || "ENGLISH")} className="mt-2 w-full rounded-[8px] border border-black/10 bg-white/75 px-3 py-2.5"><option value="ENGLISH">英语</option><option value="CPP">C++</option></select></label><Field name="slug" label="Slug" required defaultValue={String(item?.slug || "")} placeholder="english-basics" /><Field name="title" label="课程标题" required defaultValue={String(item?.title || "")} /><Field name="description" label="课程简介" textarea defaultValue={String(item?.description || "")} /><Field name="sortOrder" label="排序" type="number" min={0} max={9999} defaultValue={String(item?.sortOrder ?? 0)} /><label className="flex items-center gap-2 text-sm text-slate-700"><input name="isPublished" type="checkbox" defaultChecked={item?.isPublished !== false} /> 发布</label></>;
}

function LessonFields({ item, courses }: { item: AdminItem | null; courses: AdminCourse[] }) {
  return <><label className="block text-sm font-semibold text-slate-700">所属课程<select name="courseId" required defaultValue={String(item?.courseId || courses[0]?.id || "")} className="mt-2 w-full rounded-[8px] border border-black/10 bg-white/75 px-3 py-2.5"><option value="" disabled>{courses.length ? "请选择课程" : "暂无课程，请先创建课程"}</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.direction === "CPP" ? "C++" : "英语"} · {course.title}</option>)}</select></label><Field name="slug" label="Slug" required defaultValue={String(item?.slug || "")} placeholder="variables" /><Field name="title" label="知识点标题" required defaultValue={String(item?.title || "")} /><Field name="summary" label="摘要" textarea defaultValue={String(item?.summary || "")} /><Field name="content" label="讲解内容" textarea required defaultValue={String(item?.content || "")} /><Field name="sortOrder" label="排序" type="number" min={0} max={9999} defaultValue={String(item?.sortOrder ?? 0)} /><label className="flex items-center gap-2 text-sm text-slate-700"><input name="isPublished" type="checkbox" defaultChecked={item?.isPublished !== false} /> 发布</label></>;
}

function QuestionFields({ item, lessons }: { item: AdminItem | null; lessons: AdminLesson[] }) {
  return <><label className="block text-sm font-semibold text-slate-700">所属知识点<select name="lessonId" required defaultValue={String(item?.lessonId || lessons[0]?.id || "")} className="mt-2 w-full rounded-[8px] border border-black/10 bg-white/75 px-3 py-2.5"><option value="" disabled>{lessons.length ? "请选择知识点" : "暂无知识点，请先创建课程和知识点"}</option>{lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.course?.direction === "CPP" ? "C++" : "英语"} · {lesson.course?.title} · {lesson.title}</option>)}</select></label><label className="block text-sm font-semibold text-slate-700">题型<select name="type" defaultValue={String(item?.type || "MULTIPLE_CHOICE")} className="mt-2 w-full rounded-[8px] border border-black/10 bg-white/75 px-3 py-2.5">{Object.entries(questionTypeLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="block text-sm font-semibold text-slate-700">难度<select name="difficulty" defaultValue={String(item?.difficulty || "EASY")} className="mt-2 w-full rounded-[8px] border border-black/10 bg-white/75 px-3 py-2.5">{Object.entries(difficultyLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><Field name="prompt" label="题干" textarea required defaultValue={String(item?.prompt || "")} /><Field name="codeSnippet" label="代码片段（可选）" textarea defaultValue={String(item?.codeSnippet || "")} /><Field name="answer" label="正确答案" required defaultValue={String(item?.answer || "")} /><Field name="explanation" label="解析" textarea defaultValue={String(item?.explanation || "")} /><Field name="options" label="选择题选项：一行一个，正确项前加 *" textarea defaultValue={optionText(item)} placeholder={"*正确选项\n干扰选项"} /><Field name="sortOrder" label="排序" type="number" min={0} max={9999} defaultValue={String(item?.sortOrder ?? 0)} /></>;
}
