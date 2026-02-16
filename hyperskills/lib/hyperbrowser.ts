import { Hyperbrowser } from "@hyperbrowser/sdk";
import { ScrapedContent } from "@/types";

export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  const apiKey = process.env.HYPERBROWSER_API_KEY;

  if (!apiKey) {
    throw new Error("HYPERBROWSER_API_KEY is not configured");
  }

  try {
    const client = new Hyperbrowser({
      apiKey: apiKey,
    });

    const result = await client.scrape.startAndWait({
      url: url,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
      },
    });

    // Extract markdown content from the result
    const markdown = (result as any).data?.markdown || "";

    return {
      url,
      markdown,
      success: true,
    };
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    return {
      url,
      markdown: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function scrapeUrls(urls: string[]): Promise<ScrapedContent[]> {
  const scrapePromises = urls.map((url) => scrapeUrl(url));
  const results = await Promise.all(scrapePromises);

  // Filter out failed scrapes but keep at least some content
  const successfulResults = results.filter((r) => r.success && r.markdown.length > 0);

  if (successfulResults.length === 0) {
    throw new Error("Failed to scrape any URLs successfully");
  }

  return successfulResults;
}

/**
 * Scrape multiple URLs using Hyperbrowser's native batch API
 * More efficient than individual scrapes - handles parallelization internally
 */
export async function scrapeBatch(urls: string[]): Promise<ScrapedContent[]> {
  const apiKey = process.env.HYPERBROWSER_API_KEY;

  if (!apiKey) {
    throw new Error("HYPERBROWSER_API_KEY is not configured");
  }

  try {
    const client = new Hyperbrowser({
      apiKey: apiKey,
    });

    const result = await client.scrape.batch.startAndWait({
      urls: urls,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
      },
    });

    // Process batch results
    const scrapedContent: ScrapedContent[] = [];

    if (result.data && Array.isArray(result.data)) {
      for (const item of result.data) {
        const url = item.url || "";
        const markdown = item.markdown || "";
        const success = !!markdown && markdown.length > 0;

        scrapedContent.push({
          url,
          markdown,
          success,
          error: success ? undefined : "No content extracted",
        });
      }
    }

    // Filter successful results
    const successfulResults = scrapedContent.filter(
      (r) => r.success && r.markdown.length > 0
    );

    if (successfulResults.length === 0) {
      throw new Error("Failed to scrape any URLs successfully");
    }

    return successfulResults;
  } catch (error) {
    console.error("Batch scrape failed:", error);
    throw new Error(
      error instanceof Error ? error.message : "Batch scrape failed"
    );
  }
}
