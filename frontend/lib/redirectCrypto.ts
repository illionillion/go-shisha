// Minimal AES-GCM encrypt/decrypt helper for redirectUrl
// Uses Web Crypto (Edge + Node WebCrypto compatible) and base64url encoding.
const SECRET = process.env.REDIRECT_SECRET || "";

function base64urlEncode(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64urlDecode(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "==".slice((2 - s.length * 3) & 3);
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(b64, "base64"));
  }
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getCrypto(): Promise<Crypto> {
  const maybe = (globalThis as unknown as { crypto?: Crypto }).crypto;
  if (maybe && (maybe as unknown as { subtle?: unknown }).subtle) return maybe;
  if (typeof process !== "undefined") {
    const nodeCrypto = await import("crypto");
    if (nodeCrypto?.webcrypto && (nodeCrypto.webcrypto as unknown as { subtle?: unknown }).subtle) {
      return nodeCrypto.webcrypto as unknown as Crypto;
    }
  }
  throw new Error("Web Crypto API not available");
}

async function deriveKey(secret: string) {
  const webcrypto = await getCrypto();
  const enc = new TextEncoder();
  const hash = await webcrypto.subtle.digest("SHA-256", enc.encode(secret));
  return webcrypto.subtle.importKey("raw", hash, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptRedirect(path: string) {
  if (!SECRET) throw new Error("REDIRECT_SECRET not set");
  const webcrypto = await getCrypto();
  const key = await deriveKey(SECRET);
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ct = await webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(path));
  const ctArr = new Uint8Array(ct as ArrayBuffer);
  const out = new Uint8Array(iv.byteLength + ctArr.byteLength);
  out.set(iv, 0);
  out.set(ctArr, iv.byteLength);
  return base64urlEncode(out);
}

export async function decryptRedirect(token: string) {
  if (!SECRET) return null;
  try {
    const webcrypto = await getCrypto();
    const key = await deriveKey(SECRET);
    const data = base64urlDecode(token);
    if (data.length < 13) return null;
    const iv = data.subarray(0, 12);
    const ct = data.subarray(12);
    const plain = await webcrypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return new TextDecoder().decode(new Uint8Array(plain as ArrayBuffer));
  } catch {
    return null;
  }
}

// no default export
