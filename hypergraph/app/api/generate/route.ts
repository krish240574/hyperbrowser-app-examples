import { NextRequest, NextResponse } from "next/server";
import { searchDocs } from "@/lib/serper";
import { scrapeUrls } from "@/lib/hyperbrowser";
import { generateGraph } from "@/lib/generator";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const urls = await searchDocs(topic.trim());
    if (urls.length === 0) {
      return NextResponse.json(
        { error: "No documentation found for this topic" },
        { status: 404 }
      );
    }

    const docs = await scrapeUrls(urls);
    if (docs.length === 0) {
      return NextResponse.json(
        { error: "Failed to scrape any documentation" },
        { status: 502 }
      );
    }

    const { graph, files } = await generateGraph(topic.trim(), docs);

    return NextResponse.json({ graph, files });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
