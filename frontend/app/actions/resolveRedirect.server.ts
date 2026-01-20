"use server";
import crypto from "crypto";

function base64urlDecode(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "==".slice((2 - s.length * 3) & 3);
  return Buffer.from(b64, "base64");
}

export async function resolveRedirect(token: string): Promise<string | null> {
  if (!token) return null;
  const secret = process.env.REDIRECT_SECRET;
  if (!secret) return null;
  try {
    const data = base64urlDecode(token);
    if (data.length < 13) return null;
    const iv = data.subarray(0, 12);
    const ct = data.subarray(12);

    // derive 32-byte key via SHA-256(secret)
    const key = crypto.createHash("sha256").update(secret).digest();

    // AES-256-GCM decrypt
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    // auth tag is appended at end of ct for subtle.encrypt; for Node we need to separate tag
    // In our encrypt implementation, ct includes tag at end (WebCrypto appends tag to ciphertext)
    // Tag length is 16 bytes
    if (ct.length < 16) return null;
    const ciphertext = ct.subarray(0, ct.length - 16);
    const authTag = ct.subarray(ct.length - 16);
    decipher.setAuthTag(authTag);
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const path = plain.toString("utf8");

    if (!path || typeof path !== "string") return null;
    if (!path.startsWith("/")) return null;
    if (path.length > 2048) return null;
    return path;
  } catch {
    return null;
  }
}
