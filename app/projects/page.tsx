"use client";

import { useEffect, useState } from "react";
import ConsolePage from "@/components/ConsolePage";

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

const defaults: Todo[] = [
  { id: "1", text: "把网站改成个人学习与项目控制台", done: true },
  { id: "2", text: "补齐学习、错题、状态页面", done: false },
  { id: "3", text: "本地检查通过后再部署", done: false },
];

export default function ProjectsPage() {
  const [todos, setTodos] = useState<Todo[]>(defaults);
  const [newTodo, setNewTodo] = useState("");
  const [status, setStatus] = useState("本地开发中");

  useEffect(() => {
    const savedTodos = localStorage.getItem("immortal-project-todos");
    const savedStatus = localStorage.getItem("immortal-project-status");
    if (savedTodos) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTodos(JSON.parse(savedTodos));
    }
    if (savedStatus) {
      setStatus(savedStatus);
    }
  }, []);

  const saveTodos = (next: Todo[]) => {
    setTodos(next);
    localStorage.setItem("immortal-project-todos", JSON.stringify(next));
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    saveTodos([{ id: crypto.randomUUID(), text: newTodo, done: false }, ...todos]);
    setNewTodo("");
  };

  const doneCount = todos.filter((todo) => todo.done).length;
  const progress = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;

  return (
    <ConsolePage
      eyebrow="项目控制台"
      title="VantaAPI 进度、待办、部署状态。"
      description="这里记录你的网站进度。只展示你自己的项目状态，不展示他人隐私或公开对比信息。"
    >
      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-semibold text-white">部署状态</h2>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              localStorage.setItem("immortal-project-status", event.target.value);
            }}
            className="mt-4 w-full rounded-lg border border-white/10 bg-[#101318] px-4 py-3 text-sm text-white outline-none"
          >
            <option>本地开发中</option>
            <option>等待测试</option>
            <option>准备部署</option>
            <option>线上运行中</option>
            <option>需要修复</option>
          </select>
          <div className="mt-5 rounded-lg bg-black/30 p-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-stone-400">完成度</span>
              <span className="text-cyan-100">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-lime-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-semibold text-white">待办</h2>
          <div className="mt-4 flex gap-2">
            <input
              value={newTodo}
              onChange={(event) => setNewTodo(event.target.value)}
              placeholder="新增一个待办"
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
            />
            <button onClick={addTodo} className="rounded-lg bg-cyan-300 px-4 font-semibold text-black">
              添加
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {todos.map((todo) => (
              <label
                key={todo.id}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={(event) =>
                    saveTodos(
                      todos.map((item) =>
                        item.id === todo.id
                          ? { ...item, done: event.target.checked }
                          : item
                      )
                    )
                  }
                  className="accent-cyan-300"
                />
                <span className={todo.done ? "text-stone-500 line-through" : "text-stone-200"}>
                  {todo.text}
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>
    </ConsolePage>
  );
}
