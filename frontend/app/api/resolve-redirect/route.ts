import { NextResponse } from "next/server";
import { decryptRedirect } from "@/lib/redirectCrypto";
import { isSafeRedirectPath } from "@/lib/validateRedirect";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = body?.token as string | undefined;
    if (!token) return NextResponse.json({ error: "missing token" }, { status: 400 });
    const path = await decryptRedirect(token);
    if (!path || !isSafeRedirectPath(path)) {
      return NextResponse.json({ error: "invalid token" }, { status: 400 });
    }

    return NextResponse.json({ path });
  } catch (error) {
    console.error("Failed to resolve redirect token:", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
