import { auth } from "@/lib/auth";

const ADMIN_EMAILS = [
  "admin@athlink.com",
  "contact@athlink.com",
];

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  
  if (!session?.user?.email) {
    return false;
  }
  
  return ADMIN_EMAILS.includes(session.user.email);
}

export async function requireAdmin() {
  const session = await auth();
  console.log("[DEBUG] requireAdmin - Session:", JSON.stringify(session, null, 2));
  console.log("[DEBUG] requireAdmin - Email:", session?.user?.email);
  console.log("[DEBUG] requireAdmin - ADMIN_EMAILS:", ADMIN_EMAILS);
  
  const admin = await isAdmin();
  console.log("[DEBUG] requireAdmin - isAdmin result:", admin);
  
  if (!admin) {
    throw new Error("Unauthorized - Admin access required");
  }
}
