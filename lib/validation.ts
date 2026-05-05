import { z } from "zod";

/**
 * 用户注册验证
 */
export const registerSchema = z.object({
  email: z
    .string()
    .email("邮箱格式不正确")
    .max(254, "邮箱长度不能超过254个字符")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(12, "密码长度至少12位")
    .max(128, "密码长度不能超过128位")
    .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
    .regex(/[a-z]/, "密码必须包含至少一个小写字母")
    .regex(/[0-9]/, "密码必须包含至少一个数字")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "密码必须包含至少一个特殊字符"),
  username: z
    .string()
    .min(3, "用户名至少3个字符")
    .max(30, "用户名不能超过30个字符")
    .regex(/^[a-zA-Z0-9_-]+$/, "用户名只能包含字母、数字、下划线和连字符")
    .trim()
    .optional(),
  recaptchaToken: z.string().optional(),
});

/**
 * 用户登录验证
 */
export const loginSchema = z.object({
  email: z.string().email("邮箱格式不正确").toLowerCase().trim(),
  password: z.string().min(1, "密码不能为空"),
  twoFactorCode: z.string().length(6, "验证码必须是6位数字").optional(),
  rememberMe: z.boolean().optional(),
});

/**
 * 项目提交验证
 */
export const rankingSchema = z.object({
  title: z
    .string()
    .min(2, "标题至少2个字符")
    .max(200, "标题不能超过200个字符")
    .trim(),
  description: z
    .string()
    .max(5000, "描述不能超过5000个字符")
    .trim()
    .optional(),
  imageUrl: z
    .string()
    .url("图片链接格式不正确")
    .regex(/^https?:\/\//, "图片链接必须使用 http 或 https 协议")
    .max(2048, "图片链接过长")
    .optional(),
  categoryId: z.string().cuid("分类ID格式不正确"),
  submittedBy: z.string().max(100, "提交者名称过长").trim().optional(),
});

/**
 * 评论验证
 */
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "评论内容不能为空")
    .max(2000, "评论内容不能超过2000个字符")
    .trim(),
  rankingId: z.string().cuid("项目ID格式不正确"),
  parentId: z.string().cuid("父评论ID格式不正确").optional(),
});

/**
 * 投诉验证
 */
export const reportSchema = z.object({
  type: z.enum(
    ["ranking", "spam", "illegal", "copyright", "fraud", "adult", "other"],
    {
      message: "投诉类型不正确",
    }
  ),
  targetId: z.string().cuid("目标ID格式不正确"),
  reason: z.string().min(1, "投诉原因不能为空").max(100, "投诉原因过长"),
  description: z
    .string()
    .max(2000, "详细说明不能超过2000个字符")
    .trim()
    .optional(),
  email: z.string().email("邮箱格式不正确").optional(),
  recaptchaToken: z.string().optional(),
});

/**
 * 分类验证
 */
export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "分类名称至少2个字符")
    .max(50, "分类名称不能超过50个字符")
    .trim(),
  description: z.string().max(500, "分类描述不能超过500个字符").trim().optional(),
  icon: z.string().max(100, "图标名称过长").trim().optional(),
});

/**
 * 审核操作验证
 */
export const reviewSchema = z.object({
  id: z.string().cuid("ID格式不正确"),
  status: z.enum(["approved", "rejected"], {
    message: "状态必须是 approved 或 rejected",
  }),
  reason: z.string().max(500, "原因不能超过500个字符").trim().optional(),
});

/**
 * 邮箱验证码验证
 */
export const emailVerificationSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  code: z.string().length(6, "验证码必须是6位数字"),
});

/**
 * 密码重置验证
 */
export const passwordResetSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  code: z.string().length(6, "验证码必须是6位数字"),
  newPassword: z
    .string()
    .min(12, "密码长度至少12位")
    .max(128, "密码长度不能超过128位")
    .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
    .regex(/[a-z]/, "密码必须包含至少一个小写字母")
    .regex(/[0-9]/, "密码必须包含至少一个数字")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "密码必须包含至少一个特殊字符"),
});

/**
 * 通用验证辅助函数
 */
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err) => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ["验证失败"] };
  }
}

/**
 * 弱密码黑名单
 */
const WEAK_PASSWORDS = [
  "password123",
  "123456789012",
  "qwerty123456",
  "admin123456",
  "letmein12345",
  "welcome12345",
  "password1234",
  "123456789abc",
  "abc123456789",
];

/**
 * 检查密码是否在弱密码黑名单中
 */
export function isWeakPassword(password: string): boolean {
  const lowerPassword = password.toLowerCase();
  return WEAK_PASSWORDS.some((weak) => lowerPassword.includes(weak));
}

/**
 * 检查密码是否包含用户信息
 */
export function passwordContainsUserInfo(
  password: string,
  email: string,
  username?: string
): boolean {
  const lowerPassword = password.toLowerCase();
  const emailLocal = email.split("@")[0].toLowerCase();

  if (lowerPassword.includes(emailLocal)) {
    return true;
  }

  if (username && lowerPassword.includes(username.toLowerCase())) {
    return true;
  }

  return false;
}
