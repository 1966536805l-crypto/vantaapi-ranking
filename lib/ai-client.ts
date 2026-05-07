/**
 * AI 客户端封装
 * 支持 DeepSeek V4 和其他兼容 OpenAI API 的模型
 */

import { classifyAIReason, recordAIEvent } from "@/lib/ai-observability";
import { resetProviderCircuit, shouldSkipProvider, tripProviderCircuit } from "@/lib/ai-circuit-breaker";

type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type AIResponse = {
  success: boolean;
  content?: string;
  error?: string;
  status?: number;
  model?: string;
  provider?: "gateway" | "ollama";
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

type AIOptions = {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  timeoutMs?: number;
  gatewayTimeoutMs?: number;
  ollamaTimeoutMs?: number;
  fallbackToOllama?: boolean;
};

type AIStreamResponse =
  | {
      success: true;
      response: Response;
      model: string;
      format: "openai-sse" | "ollama-jsonl";
      provider: "gateway" | "ollama";
    }
  | {
      success: false;
      error: string;
      status?: number;
    };

const AI_BASE_URL = process.env.AI_BASE_URL || "https://api.deepseek.com/v1";
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "deepseek-chat";
const AI_TIMEOUT = parseInt(process.env.AI_TIMEOUT || "12000", 10);
const OLLAMA_ENABLED = process.env.OLLAMA_ENABLED === "true";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:3b";
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || "";
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || "18000", 10);

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function ollamaHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Language": "en-US,en",
  };

  if (OLLAMA_API_KEY) headers.Authorization = `Bearer ${OLLAMA_API_KEY}`;
  return headers;
}

function ollamaOptions(options?: { temperature?: number; maxTokens?: number }) {
  return {
    temperature: options?.temperature ?? 0.3,
    num_predict: options?.maxTokens ?? 700,
  };
}

async function callOllama(
  messages: AIMessage[],
  options?: AIOptions,
): Promise<AIResponse> {
  const model = options?.model || OLLAMA_MODEL;
  if (!OLLAMA_ENABLED) {
    recordAIEvent({
      provider: "ollama",
      operation: "chat",
      status: "disabled",
      model,
      durationMs: 0,
      reason: "Ollama disabled",
    });
    return {
      success: false,
      error: "Ollama 未启用",
    };
  }

  const circuit = await shouldSkipProvider("ollama");
  if (circuit.open) {
    recordAIEvent({
      provider: "ollama",
      operation: "chat",
      status: "disabled",
      model,
      durationMs: 0,
      reason: `cooldown ${Math.ceil(circuit.retryInMs / 1000)}s ${circuit.reason}`,
    });
    return {
      success: false,
      error: "Ollama 暂时冷却中",
    };
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    options?.ollamaTimeoutMs ?? Math.max(options?.timeoutMs ?? 0, OLLAMA_TIMEOUT),
  );

  try {
    const response = await fetch(`${normalizeBaseUrl(OLLAMA_BASE_URL)}/api/chat`, {
      method: "POST",
      headers: ollamaHeaders(),
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: ollamaOptions(options),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("Ollama API 错误:", response.status, errorText);
      recordAIEvent({
        provider: "ollama",
        operation: "chat",
        status: classifyAIReason(undefined, response.status),
        model,
        durationMs: Date.now() - startedAt,
        httpStatus: response.status,
        reason: `HTTP ${response.status}`,
      });
      await tripProviderCircuit("ollama", classifyAIReason(undefined, response.status), `HTTP ${response.status}`, response.status);
      return {
        success: false,
        error: `Ollama 返回错误: ${response.status}`,
        status: response.status,
      };
    }

    const data = (await response.json()) as {
      message?: { content?: string };
      response?: string;
    };

    recordAIEvent({
      provider: "ollama",
      operation: "chat",
      status: "success",
      model,
      durationMs: Date.now() - startedAt,
      httpStatus: response.status,
      reason: "completed",
    });
    await resetProviderCircuit("ollama");

    return {
      success: true,
      content: data.message?.content || data.response || "",
      model,
      provider: "ollama",
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      recordAIEvent({
        provider: "ollama",
        operation: "chat",
        status: classifyAIReason(error.name === "AbortError" ? "Ollama 请求超时" : error.message),
        model,
        durationMs: Date.now() - startedAt,
        reason: error.name === "AbortError" ? "timeout" : error.message,
      });
      await tripProviderCircuit(
        "ollama",
        classifyAIReason(error.name === "AbortError" ? "Ollama 请求超时" : error.message),
        error.name === "AbortError" ? "timeout" : error.message,
      );
      return {
        success: false,
        error: error.name === "AbortError" ? "Ollama 请求超时" : error.message,
      };
    }

    return {
      success: false,
      error: "Ollama 未知错误",
    };
  }
}

async function streamOllama(
  messages: AIMessage[],
  options?: AIOptions,
): Promise<AIStreamResponse> {
  const model = options?.model || OLLAMA_MODEL;
  if (!OLLAMA_ENABLED) {
    recordAIEvent({
      provider: "ollama",
      operation: "stream",
      status: "disabled",
      model,
      durationMs: 0,
      reason: "Ollama disabled",
    });
    return {
      success: false,
      error: "Ollama 未启用",
    };
  }

  const circuit = await shouldSkipProvider("ollama");
  if (circuit.open) {
    recordAIEvent({
      provider: "ollama",
      operation: "stream",
      status: "disabled",
      model,
      durationMs: 0,
      reason: `cooldown ${Math.ceil(circuit.retryInMs / 1000)}s ${circuit.reason}`,
    });
    return {
      success: false,
      error: "Ollama 暂时冷却中",
    };
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    options?.ollamaTimeoutMs ?? Math.max(options?.timeoutMs ?? 0, OLLAMA_TIMEOUT),
  );

  try {
    const response = await fetch(`${normalizeBaseUrl(OLLAMA_BASE_URL)}/api/chat`, {
      method: "POST",
      headers: ollamaHeaders(),
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        options: ollamaOptions(options),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok || !response.body) {
      const errorText = await response.text().catch(() => "");
      console.error("Ollama stream API 错误:", response.status, errorText);
      recordAIEvent({
        provider: "ollama",
        operation: "stream",
        status: classifyAIReason(undefined, response.status),
        model,
        durationMs: Date.now() - startedAt,
        httpStatus: response.status,
        reason: `HTTP ${response.status}`,
      });
      await tripProviderCircuit("ollama", classifyAIReason(undefined, response.status), `HTTP ${response.status}`, response.status);
      return {
        success: false,
        error: `Ollama 返回错误: ${response.status}`,
        status: response.status,
      };
    }

    recordAIEvent({
      provider: "ollama",
      operation: "stream",
      status: "success",
      model,
      durationMs: Date.now() - startedAt,
      httpStatus: response.status,
      reason: "headers-ready",
    });
    await resetProviderCircuit("ollama");

    return {
      success: true,
      response,
      model,
      format: "ollama-jsonl",
      provider: "ollama",
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      recordAIEvent({
        provider: "ollama",
        operation: "stream",
        status: classifyAIReason(error.name === "AbortError" ? "Ollama 请求超时" : error.message),
        model,
        durationMs: Date.now() - startedAt,
        reason: error.name === "AbortError" ? "timeout" : error.message,
      });
      await tripProviderCircuit(
        "ollama",
        classifyAIReason(error.name === "AbortError" ? "Ollama 请求超时" : error.message),
        error.name === "AbortError" ? "timeout" : error.message,
      );
      return {
        success: false,
        error: error.name === "AbortError" ? "Ollama 请求超时" : error.message,
      };
    }

    return {
      success: false,
      error: "Ollama 未知错误",
    };
  }
}

async function callOllamaFallback(
  messages: AIMessage[],
  options: AIOptions | undefined,
  primaryError: string,
  status?: number,
): Promise<AIResponse> {
  if (options?.fallbackToOllama === false) {
    return {
      success: false,
      error: primaryError,
      status,
    };
  }

  const fallback = await callOllama(messages, options);
  if (fallback.success) return fallback;

  return {
    success: false,
    error: `${primaryError}; Ollama fallback: ${fallback.error}`,
    status,
  };
}

async function streamOllamaFallback(
  messages: AIMessage[],
  options: AIOptions | undefined,
  primaryError: string,
  status?: number,
): Promise<AIStreamResponse> {
  if (options?.fallbackToOllama === false) {
    return {
      success: false,
      error: primaryError,
      status,
    };
  }

  const fallback = await streamOllama(messages, options);
  if (fallback.success) return fallback;

  return {
    success: false,
    error: `${primaryError}; Ollama fallback: ${fallback.error}`,
    status,
  };
}

/**
 * 调用 AI 模型
 */
export async function callAI(
  messages: AIMessage[],
  options?: AIOptions,
): Promise<AIResponse> {
  const model = options?.model || AI_MODEL;
  if (!AI_API_KEY) {
    recordAIEvent({
      provider: "gateway",
      operation: "chat",
      status: "disabled",
      model,
      durationMs: 0,
      reason: "AI_API_KEY missing",
    });
    return callOllamaFallback(messages, options, "AI_API_KEY 未配置");
  }

  const circuit = await shouldSkipProvider("gateway");
  if (circuit.open) {
    recordAIEvent({
      provider: "gateway",
      operation: "chat",
      status: "disabled",
      model,
      durationMs: 0,
      reason: `cooldown ${Math.ceil(circuit.retryInMs / 1000)}s ${circuit.reason}`,
    });
    return callOllamaFallback(messages, options, "AI gateway 暂时冷却中");
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options?.gatewayTimeoutMs ?? options?.timeoutMs ?? AI_TIMEOUT);

  try {
    const baseUrl = normalizeBaseUrl(AI_BASE_URL);
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "en-US,en",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API 错误:", response.status, errorText);
      recordAIEvent({
        provider: "gateway",
        operation: "chat",
        status: classifyAIReason(undefined, response.status),
        model,
        durationMs: Date.now() - startedAt,
        httpStatus: response.status,
        reason: `HTTP ${response.status}`,
      });
      await tripProviderCircuit("gateway", classifyAIReason(undefined, response.status), `HTTP ${response.status}`, response.status);
      return callOllamaFallback(messages, options, `AI API 返回错误: ${response.status}`, response.status);
    }

    const data = await response.json() as {
      choices?: {
        message?: {
          content?: string;
          reasoning_content?: string;
        };
      }[];
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
    };

    if (!data.choices || data.choices.length === 0) {
      recordAIEvent({
        provider: "gateway",
        operation: "chat",
        status: "error",
        model,
        durationMs: Date.now() - startedAt,
        httpStatus: response.status,
        reason: "empty choices",
      });
      await tripProviderCircuit("gateway", "error", "empty choices");
      return {
        success: false,
        error: "AI 返回数据格式错误",
      };
    }

    recordAIEvent({
      provider: "gateway",
      operation: "chat",
      status: "success",
      model,
      durationMs: Date.now() - startedAt,
      httpStatus: response.status,
      reason: "completed",
    });
    await resetProviderCircuit("gateway");

    return {
      success: true,
      content: data.choices[0].message?.content || "",
      model,
      provider: "gateway",
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens ?? 0,
            completionTokens: data.usage.completion_tokens ?? 0,
            totalTokens: data.usage.total_tokens ?? 0,
          }
        : undefined,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        recordAIEvent({
          provider: "gateway",
          operation: "chat",
          status: "timeout",
          model,
          durationMs: Date.now() - startedAt,
          reason: "timeout",
        });
        await tripProviderCircuit("gateway", "timeout", "timeout");
        return callOllamaFallback(messages, options, "AI 请求超时");
      }
      recordAIEvent({
        provider: "gateway",
        operation: "chat",
        status: classifyAIReason(error.message),
        model,
        durationMs: Date.now() - startedAt,
        reason: error.message,
      });
      await tripProviderCircuit("gateway", classifyAIReason(error.message), error.message);
      return callOllamaFallback(messages, options, error.message);
    }

    return {
      success: false,
      error: "未知错误",
    };
  }
}

export async function streamAI(
  messages: AIMessage[],
  options?: AIOptions,
): Promise<AIStreamResponse> {
  const model = options?.model || AI_MODEL;
  if (!AI_API_KEY) {
    recordAIEvent({
      provider: "gateway",
      operation: "stream",
      status: "disabled",
      model,
      durationMs: 0,
      reason: "AI_API_KEY missing",
    });
    return streamOllamaFallback(messages, options, "AI_API_KEY 未配置");
  }

  const circuit = await shouldSkipProvider("gateway");
  if (circuit.open) {
    recordAIEvent({
      provider: "gateway",
      operation: "stream",
      status: "disabled",
      model,
      durationMs: 0,
      reason: `cooldown ${Math.ceil(circuit.retryInMs / 1000)}s ${circuit.reason}`,
    });
    return streamOllamaFallback(messages, options, "AI gateway 暂时冷却中");
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options?.gatewayTimeoutMs ?? options?.timeoutMs ?? AI_TIMEOUT);

  try {
    const baseUrl = normalizeBaseUrl(AI_BASE_URL);
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "en-US,en",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.4,
        max_tokens: options?.maxTokens ?? 700,
        stream: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok || !response.body) {
      const errorText = await response.text().catch(() => "");
      console.error("AI stream API 错误:", response.status, errorText);
      recordAIEvent({
        provider: "gateway",
        operation: "stream",
        status: classifyAIReason(undefined, response.status),
        model,
        durationMs: Date.now() - startedAt,
        httpStatus: response.status,
        reason: `HTTP ${response.status}`,
      });
      await tripProviderCircuit("gateway", classifyAIReason(undefined, response.status), `HTTP ${response.status}`, response.status);
      return streamOllamaFallback(messages, options, `AI API 返回错误: ${response.status}`, response.status);
    }

    recordAIEvent({
      provider: "gateway",
      operation: "stream",
      status: "success",
      model,
      durationMs: Date.now() - startedAt,
      httpStatus: response.status,
      reason: "headers-ready",
    });
    await resetProviderCircuit("gateway");

    return {
      success: true,
      response,
      model,
      format: "openai-sse",
      provider: "gateway",
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      recordAIEvent({
        provider: "gateway",
        operation: "stream",
        status: classifyAIReason(error.name === "AbortError" ? "AI 请求超时" : error.message),
        model,
        durationMs: Date.now() - startedAt,
        reason: error.name === "AbortError" ? "timeout" : error.message,
      });
      await tripProviderCircuit(
        "gateway",
        classifyAIReason(error.name === "AbortError" ? "AI 请求超时" : error.message),
        error.name === "AbortError" ? "timeout" : error.message,
      );
      return streamOllamaFallback(messages, options, error.name === "AbortError" ? "AI 请求超时" : error.message);
    }

    return {
      success: false,
      error: "未知错误",
    };
  }
}

/**
 * C++ 错误分析
 */
export async function analyzeCppError(
  code: string,
  stdin: string,
  stderr: string,
  stdout: string
): Promise<AIResponse> {
  const systemPrompt = `你是一个 C++ 编程助手，专门帮助学生分析代码错误。

请分析以下 C++ 代码的错误，并以 JSON 格式返回结果：

{
  "errorType": "编译错误" | "运行错误" | "逻辑错误" | "复杂度太高",
  "cause": "错误原因的简短描述（1-2句话）",
  "hint": "修复建议（具体、可操作）",
  "nextAction": "下一步应该做什么"
}

要求：
1. 语言简洁、直接
2. 不要说教，只给关键信息
3. 如果是编译错误，指出具体的语法问题
4. 如果是运行错误，分析可能的原因（数组越界、除零、栈溢出等）
5. 如果是逻辑错误，提示思路方向
6. 只返回 JSON，不要其他内容`;

  const userPrompt = `代码：
\`\`\`cpp
${code}
\`\`\`

输入：
${stdin || "(无输入)"}

标准错误输出：
${stderr || "(无错误输出)"}

标准输出：
${stdout || "(无输出)"}

请分析这段代码的问题。`;

  return callAI(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    {
      temperature: 0.3,
      maxTokens: 1000,
    }
  );
}

/**
 * 数学错题分析
 */
export async function analyzeMathMistake(
  question: string,
  myAnswer: string,
  correctAnswer: string,
  myProcess?: string
): Promise<AIResponse> {
  const systemPrompt = `你是一个数学学习助手，专门帮助学生分析错题。

请分析学生的错误，并以 JSON 格式返回结果：

{
  "mistakeType": "审题错" | "概念不清" | "公式乱用" | "计算粗心" | "图形没看出来" | "变量关系没建出来" | "第一突破口卡住" | "会方法但表达乱",
  "cause": "错误原因分析（1-2句话）",
  "correctThinking": "正确的解题思路（分步骤）",
  "keyPoint": "这道题的关键点"
}

要求：
1. 准确判断错误类型
2. 分析要具体，不要泛泛而谈
3. 正确思路要清晰、分步骤
4. 只返回 JSON，不要其他内容`;

  const userPrompt = `题目：
${question}

学生的答案：
${myAnswer}

正确答案：
${correctAnswer}

${myProcess ? `学生的解题过程：\n${myProcess}` : ""}

请分析学生的错误。`;

  return callAI(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    {
      temperature: 0.3,
      maxTokens: 1500,
    }
  );
}
