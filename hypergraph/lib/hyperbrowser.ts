import Hyperbrowser from "@hyperbrowser/sdk";

let client: Hyperbrowser | null = null;

function getClient(): Hyperbrowser {
  if (!client) {
    const apiKey = process.env.HYPERBROWSER_API_KEY;
    if (!apiKey) throw new Error("HYPERBROWSER_API_KEY is not set");
    client = new Hyperbrowser({ apiKey });
  }
  return client;
}

interface ScrapeResult {
  url: string;
  markdown: string;
}

export async function scrapeUrls(urls: string[]): Promise<ScrapeResult[]> {
  const hb = getClient();

  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const result = await hb.scrape.startAndWait({
        url,
        scrapeOptions: {
          formats: ["markdown"],
          onlyMainContent: true,
        },
      });
      return { url, markdown: result.data?.markdown ?? "" };
    })
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<ScrapeResult> =>
        r.status === "fulfilled" && r.value.markdown.length >= 100
    )
    .map((r) => r.value);
}
