import { translateMany } from "@/lib/machine-translate";
import type { Lang } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  let body: { texts?: unknown; target?: unknown };
  try {
    body = (await request.json()) as { texts?: unknown; target?: unknown };
  } catch {
    return Response.json({ error: "The request could not be read." }, { status: 400 });
  }

  const target: Lang = body.target === "he" ? "he" : "en";
  if (
    !Array.isArray(body.texts) ||
    body.texts.length > 80 ||
    body.texts.some((item) => typeof item !== "string" || item.length > 4_000)
  ) {
    return Response.json({ error: "The text could not be translated." }, { status: 400 });
  }

  try {
    const texts = await translateMany(body.texts as string[], target);
    return Response.json({ texts });
  } catch {
    return Response.json({ error: "The translation did not finish." }, { status: 502 });
  }
}
