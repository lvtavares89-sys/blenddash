import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, unknown> = {};

  checks.DATABASE_URL_SET = !!process.env.DATABASE_URL;
  checks.DATABASE_URL_PREFIX = process.env.DATABASE_URL?.substring(0, 30) + "...";
  checks.NODE_ENV = process.env.NODE_ENV;

  try {
    const { PrismaClient } = await import("@prisma/client");
    const db = new PrismaClient();
    checks.prisma_init = "ok";
    const count = await db.zigEvento.count();
    checks.zigEvento_count = count;
    await db.$disconnect();
    checks.db_connected = true;
  } catch (e) {
    checks.db_error = e instanceof Error ? e.message : String(e);
    checks.db_connected = false;
  }

  return NextResponse.json(checks);
}