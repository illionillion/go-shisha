// Edge Runtime互換のWeb Crypto API実装
// middleware.tsとServer Actionsの両方で動作

const SECRET = process.env.REDIRECT_SECRET;

if (!SECRET) {
  console.error("REDIRECT_SECRET is not set");
  throw new Error("REDIRECT_SECRET not set");
}

function base64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64urlDecode(s: string): Uint8Array {
  // パディング文字数を計算して追加（base64urlはパディングを省略するため）
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "==".slice((2 - s.length * 3) & 3);
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", keyData);
  return crypto.subtle.importKey("raw", hashBuffer, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptRedirect(path: string): Promise<string> {
  if (!SECRET) throw new Error("REDIRECT_SECRET not set");
  const key = await deriveKey(SECRET);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const data = encoder.encode(path);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  const encryptedArray = new Uint8Array(encrypted);
  const result = new Uint8Array(iv.length + encryptedArray.length);
  result.set(iv, 0);
  result.set(encryptedArray, iv.length);
  return base64urlEncode(result);
}

export async function decryptRedirect(token: string): Promise<string | null> {
  if (!SECRET) return null;
  try {
    const data = base64urlDecode(token);
    const IV_LENGTH = 12;
    const MIN_PAYLOAD_LENGTH = 1;
    const AUTH_TAG_LENGTH = 16;
    const MIN_DATA_LENGTH = IV_LENGTH + MIN_PAYLOAD_LENGTH + AUTH_TAG_LENGTH;
    if (data.length < MIN_DATA_LENGTH) return null;
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);
    const key = await deriveKey(SECRET);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch {
    return null;
  }
}
