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
  const admin = await isAdmin();
  
  if (!admin) {
    throw new Error("Unauthorized - Admin access required");
  }
}
