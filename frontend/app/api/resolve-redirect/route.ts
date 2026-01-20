import { NextResponse } from "next/server";
import { decryptRedirect } from "@/lib/redirectCrypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = body?.token as string | undefined;
    if (!token) return NextResponse.json({ error: "missing token" }, { status: 400 });
    const path = await decryptRedirect(token);
    if (!path || typeof path !== "string")
      return NextResponse.json({ error: "invalid token" }, { status: 400 });
    // safety: only allow relative paths
    if (!path.startsWith("/")) return NextResponse.json({ error: "invalid path" }, { status: 400 });
    return NextResponse.json({ path });
  } catch {
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
