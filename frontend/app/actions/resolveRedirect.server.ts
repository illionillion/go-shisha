"use server";
import { decryptRedirect } from "@/lib/redirectCrypto";

export async function resolveRedirect(token: string): Promise<string | null> {
  if (!token) return null;
  try {
    const path = decryptRedirect(token);
    if (!path || typeof path !== "string") return null;
    if (!path.startsWith("/")) return null;
    if (path.length > 2048) return null;
    return path;
  } catch {
    return null;
  }
}
