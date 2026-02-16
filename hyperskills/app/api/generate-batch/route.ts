import { NextRequest, NextResponse } from "next/server";
import { scrapeBatch } from "@/lib/hyperbrowser";
import { generateSkill } from "@/lib/openai";

export interface BatchGenerateRequest {
  urls: string[];
}

export interface BatchGenerateResponse {
  results: Array<{
    url: string;
    content?: string;
    success: boolean;
    error?: string;
    duration?: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchGenerateRequest = await request.json();
    const { urls } = body;

    // Validate input
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "URLs array is required and must not be empty" },
        { status: 400 }
      );
    }

    console.log(`Batch scraping ${urls.length} URLs using Hyperbrowser batch API...`);
    const startTime = Date.now();

    // Step 1: Batch scrape all URLs at once using Hyperbrowser's native batch API
    const scrapedContent = await scrapeBatch(urls);
    const scrapeTime = Date.now() - startTime;
    console.log(`Batch scrape completed in ${scrapeTime}ms - ${scrapedContent.length} successful`);

    // Step 2: Generate SKILL.md for each successfully scraped URL
    const results = await Promise.allSettled(
      scrapedContent.map(async (content) => {
        const generateStartTime = Date.now();
        try {
          const skillContent = await generateSkill(content.url, [content]);
          const duration = Date.now() - generateStartTime;

          return {
            url: content.url,
            content: skillContent,
            success: true,
            duration,
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to generate skill";
          console.error(`Failed to generate skill for ${content.url}:`, error);

          return {
            url: content.url,
            success: false,
            error: errorMessage,
          };
        }
      })
    );

    // Format results
    const formattedResults = results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          url: "unknown",
          success: false,
          error: result.reason?.message || "Generation failed",
        };
      }
    });

    const response: BatchGenerateResponse = {
      results: formattedResults,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in /api/generate-batch:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
