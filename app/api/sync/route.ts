import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (token !== (process.env.ZIG_SYNC_TOKEN ?? "zig-sync-blend-2026")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const output = execSync("npx tsx scripts/zig-sync.ts", {
      cwd: process.cwd(),
      timeout: 60000,
      encoding: "utf-8",
    });
    return NextResponse.json({ ok: true, output: output.slice(0, 500) });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: err.slice(0, 300) }, { status: 500 });
  }
}