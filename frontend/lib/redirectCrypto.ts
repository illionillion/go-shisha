import { createHash, randomBytes, createCipheriv, createDecipheriv } from "crypto";

const SECRET = process.env.REDIRECT_SECRET || "";

function base64urlEncode(buffer: Buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64urlDecode(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "==".slice((2 - s.length * 3) & 3);
  return Buffer.from(b64, "base64");
}

function deriveKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

export function encryptRedirect(path: string): string {
  if (!SECRET) throw new Error("REDIRECT_SECRET not set");
  const key = deriveKey(SECRET);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(path, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const result = Buffer.concat([iv, encrypted, authTag]);
  return base64urlEncode(result);
}

export function decryptRedirect(token: string): string | null {
  if (!SECRET) return null;
  try {
    const data = base64urlDecode(token);
    if (data.length < 29) return null; // 12(iv) + 1(min content) + 16(tag)
    const iv = data.subarray(0, 12);
    const authTag = data.subarray(data.length - 16);
    const encrypted = data.subarray(12, data.length - 16);
    const key = deriveKey(SECRET);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}
