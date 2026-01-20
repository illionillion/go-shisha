"use server";
import { decryptRedirect } from "@/lib/redirectCrypto";

export async function resolveRedirect(token: string): Promise<string | null> {
  if (!token) return null;
  const path = await decryptRedirect(token);
  if (!path || typeof path !== "string") return null;
  // only allow relative paths
  if (!path.startsWith("/")) return null;
  // simple length guard
  if (path.length > 2048) return null;
  return path;
}
