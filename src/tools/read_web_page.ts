import { tool } from "ai";
import { z } from "zod";

export function createReadWebPageTool() {
  const tools = {
    read_web_page: tool({
      description: "Fetches the content of a web page and returns it as clean markdown text using Jina Reader.",
      inputSchema: z.object({
        url: z.url().describe("The URL of the web page to read"),
      }),
      execute: async (input) => {
        const jinaUrl = `https://r.jina.ai/${input.url}`;
        try {
          const response = await fetch(jinaUrl);
          if (!response.ok) {
            return `Error: HTTP ${response.status} ${response.statusText}`;
          }
          return await response.text();
        } catch (err) {
          return `Error fetching page: ${err instanceof Error ? err.message : String(err)}`;
        }
      },
    }),
  };

  return { tools, close: () => {} };
}
