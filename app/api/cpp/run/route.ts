import { NextRequest, NextResponse } from "next/server";
import { runCppCode } from "@/lib/cpp-runner";
import { z } from "zod";

const runRequestSchema = z.object({
  code: z.string().min(1, "代码不能为空").max(50000, "代码过长"),
  stdin: z.string().max(10000, "输入过长").default(""),
});

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();

    // 验证输入
    const validation = runRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { code, stdin } = validation.data;

    // 运行 C++ 代码
    const result = await runCppCode(code, stdin);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("C++ 运行错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: "服务器错误",
      },
      { status: 500 }
    );
  }
}
