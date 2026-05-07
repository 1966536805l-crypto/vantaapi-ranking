import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE } from "@/lib/auth-constants";
import { verifyAuthToken } from "@/lib/auth-token";

type RequireServerAdminOptions = {
  allowUnverified2FA?: boolean;
};

function admin2FARequired() {
  return process.env.ADMIN_2FA_REQUIRED !== "false";
}

export async function getServerUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload) return null;

  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true, twoFactorEnabled: true, createdAt: true },
    });
  } catch {
    return null;
  }
}

export async function requireServerUser() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireServerAdmin(options: RequireServerAdminOptions = {}) {
  const user = await requireServerUser();
  if (user.role !== "ADMIN") redirect("/");
  if (admin2FARequired() && !options.allowUnverified2FA && !user.twoFactorEnabled) redirect("/admin/security");
  return user;
}
