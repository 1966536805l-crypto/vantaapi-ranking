/**
 * AI 客户端封装
 * 支持 DeepSeek V4 和其他兼容 OpenAI API 的模型
 */

type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type AIResponse = {
  success: boolean;
  content?: string;
  error?: string;
  status?: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

type AIStreamResponse =
  | {
      success: true;
      response: Response;
      model: string;
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

/**
 * 调用 AI 模型
 */
export async function callAI(
  messages: AIMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
    timeoutMs?: number;
  }
): Promise<AIResponse> {
  if (!AI_API_KEY) {
    return {
      success: false,
      error: "AI_API_KEY 未配置",
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options?.timeoutMs ?? AI_TIMEOUT);

  try {
    const baseUrl = AI_BASE_URL.replace(/\/+$/, "");
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "en-US,en",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: options?.model || AI_MODEL,
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
      return {
        success: false,
        error: `AI API 返回错误: ${response.status}`,
        status: response.status,
      };
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
      return {
        success: false,
        error: "AI 返回数据格式错误",
      };
    }

    return {
      success: true,
      content: data.choices[0].message?.content || "",
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
        return {
          success: false,
          error: "AI 请求超时",
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "未知错误",
    };
  }
}

export async function streamAI(
  messages: AIMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
    timeoutMs?: number;
  }
): Promise<AIStreamResponse> {
  if (!AI_API_KEY) {
    return {
      success: false,
      error: "AI_API_KEY 未配置",
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options?.timeoutMs ?? AI_TIMEOUT);

  try {
    const baseUrl = AI_BASE_URL.replace(/\/+$/, "");
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "en-US,en",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: options?.model || AI_MODEL,
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
      return {
        success: false,
        error: `AI API 返回错误: ${response.status}`,
        status: response.status,
      };
    }

    return {
      success: true,
      response,
      model: options?.model || AI_MODEL,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.name === "AbortError" ? "AI 请求超时" : error.message,
      };
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
