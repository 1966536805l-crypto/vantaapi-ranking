import { spawn } from "child_process";
import { writeFile, unlink, mkdir, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomBytes } from "crypto";

export type CppRunResult = {
  success: boolean;
  stdout?: string;
  stderr?: string;
  timeMs?: number;
  error?: string;
};

const MAX_OUTPUT_LENGTH = 10 * 1024; // 10KB
const TIMEOUT_MS = 2000; // 2 seconds
const MAX_CODE_LENGTH = 50 * 1024;
const BLOCKED_CODE_PATTERNS = [
  /#\s*include\s*<\s*(sys\/|unistd\.h|pthread\.h|signal\.h|dlfcn\.h)/i,
  /\b(system|popen|fork|execv?|execl|clone|ptrace|socket|connect|bind|listen|accept)\s*\(/,
  /\b(fopen|freopen|ofstream|ifstream|fstream)\s*\(/,
];

const BITS_STDCXX_REPLACEMENT = `#include <algorithm>
#include <array>
#include <bitset>
#include <cassert>
#include <cctype>
#include <cerrno>
#include <cfenv>
#include <cfloat>
#include <chrono>
#include <climits>
#include <cmath>
#include <complex>
#include <csetjmp>
#include <csignal>
#include <cstdarg>
#include <cstddef>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <ctime>
#include <deque>
#include <exception>
#include <functional>
#include <iomanip>
#include <ios>
#include <iosfwd>
#include <iostream>
#include <istream>
#include <iterator>
#include <limits>
#include <list>
#include <locale>
#include <map>
#include <memory>
#include <new>
#include <numeric>
#include <ostream>
#include <queue>
#include <random>
#include <regex>
#include <set>
#include <sstream>
#include <stack>
#include <stdexcept>
#include <streambuf>
#include <string>
#include <tuple>
#include <type_traits>
#include <typeinfo>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <valarray>
#include <vector>`;

function normalizeCppSource(code: string) {
  return code.replace(/^\s*#\s*include\s*<\s*bits\/stdc\+\+\.h\s*>\s*$/im, BITS_STDCXX_REPLACEMENT);
}

export async function runCppCode(
  code: string,
  stdin: string
): Promise<CppRunResult> {
  if (process.env.ENABLE_CPP_RUNNER !== "true") {
    return {
      success: false,
      error: "C++ runner is disabled / C++ 运行器未启用",
    };
  }

  if (code.length > MAX_CODE_LENGTH) {
    return {
      success: false,
      error: "Code is too large / 代码过长",
    };
  }

  if (BLOCKED_CODE_PATTERNS.some((pattern) => pattern.test(code))) {
    return {
      success: false,
      error: "Unsafe system, process, network or file operation blocked / 已阻止不安全的系统、进程、网络或文件操作",
    };
  }

  // 生成唯一的临时目录
  const sessionId = randomBytes(16).toString("hex");
  const tempDir = join(tmpdir(), `cpp-runner-${sessionId}`);
  const sourceFile = join(tempDir, "main.cpp");
  const executableFile = join(tempDir, "main");

  try {
    // 创建临时目录
    await mkdir(tempDir, { recursive: true });

    // 写入源代码。macOS Apple clang 没有 bits/stdc++.h，
    // 这里替换成常用标准库头，方便直接粘贴竞赛代码。
    await writeFile(sourceFile, normalizeCppSource(code), "utf-8");

    // 编译 C++ 代码
    const compileResult = await compileCode(sourceFile, executableFile);
    if (!compileResult.success) {
      return {
        success: false,
        error: "编译错误",
        stderr: compileResult.stderr,
      };
    }

    // 运行编译后的程序
    const runResult = await executeProgram(executableFile, stdin);
    return runResult;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    };
  } finally {
    // 清理临时文件
    try {
      await unlink(sourceFile).catch(() => {});
      await unlink(executableFile).catch(() => {});
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    } catch {
      // 忽略清理错误
    }
  }
}

async function compileCode(
  sourceFile: string,
  executableFile: string
): Promise<{ success: boolean; stderr?: string }> {
  return new Promise((resolve) => {
    const compiler = spawn("g++", [
      sourceFile,
      "-o",
      executableFile,
      "-std=c++17",
      "-O2",
      "-pipe",
      "-Wall",
      "-Wextra",
      "-Wshadow",
      "-Wconversion",
    ], {
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true,
    });

    let stderr = "";

    compiler.stderr.on("data", (data) => {
      stderr += data.toString();
      if (stderr.length > MAX_OUTPUT_LENGTH) {
        compiler.kill();
        resolve({
          success: false,
          stderr: stderr.slice(0, MAX_OUTPUT_LENGTH) + "\n[输出被截断]",
        });
      }
    });

    compiler.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        resolve({
          success: false,
          stderr: stderr || "编译失败",
        });
      }
    });

    compiler.on("error", (error) => {
      resolve({
        success: false,
        stderr: `编译器错误: ${error.message}`,
      });
    });
  });
}

async function executeProgram(
  executableFile: string,
  stdin: string
): Promise<CppRunResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const process = spawn(executableFile, [], {
      timeout: TIMEOUT_MS,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let killed = false;

    // 超时控制
    const timeoutId = setTimeout(() => {
      killed = true;
      process.kill();
      resolve({
        success: false,
        error: "Time limit exceeded / 运行超时 2s",
      });
    }, TIMEOUT_MS);

    // 写入标准输入
    if (stdin) {
      process.stdin.write(stdin);
      process.stdin.end();
    } else {
      process.stdin.end();
    }

    process.stdout.on("data", (data) => {
      stdout += data.toString();
      if (stdout.length > MAX_OUTPUT_LENGTH) {
        killed = true;
        process.kill();
        clearTimeout(timeoutId);
        resolve({
          success: false,
          error: "Output limit exceeded / 输出超过 10KB",
          stdout: stdout.slice(0, MAX_OUTPUT_LENGTH) + "\n[truncated / 输出被截断]",
        });
      }
    });

    process.stderr.on("data", (data) => {
      stderr += data.toString();
      if (stderr.length > MAX_OUTPUT_LENGTH) {
        stderr = stderr.slice(0, MAX_OUTPUT_LENGTH) + "\n[输出被截断]";
      }
    });

    process.on("close", (code) => {
      if (killed) return;

      clearTimeout(timeoutId);
      const timeMs = Date.now() - startTime;

      if (code === 0) {
        resolve({
          success: true,
          stdout: stdout || "(无输出)",
          stderr: stderr || "",
          timeMs,
        });
      } else {
        resolve({
          success: false,
          error: `程序异常退出 (退出码: ${code})`,
          stdout: stdout || "",
          stderr: stderr || "",
          timeMs,
        });
      }
    });

    process.on("error", (error) => {
      if (killed) return;

      clearTimeout(timeoutId);
      resolve({
        success: false,
        error: `运行错误: ${error.message}`,
      });
    });
  });
}
