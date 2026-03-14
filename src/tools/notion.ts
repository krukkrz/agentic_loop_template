import { createMCPClient } from "@ai-sdk/mcp";
import { Experimental_StdioMCPTransport } from "@ai-sdk/mcp/mcp-stdio";
import { markdownToBlocks } from "@tryfabric/martian";
import { tool } from "ai";
import { z } from "zod";

export async function createNotionTools() {
  const client = await createMCPClient({
    transport: new Experimental_StdioMCPTransport({
      command: "bunx",
      args: ["@notionhq/notion-mcp-server"],
      env: {
        NOTION_TOKEN: process.env.NOTION_TOKEN!,
        PATH: process.env.PATH!,
      },
    }),
  });

  const mcpTools = await client.tools();
  const rawCreatePage = mcpTools["API-post-page"];

  if (!rawCreatePage) {
    await client.close();
    throw new Error(
      `API-post-page tool not found. Available: ${Object.keys(mcpTools).join(", ")}`
    );
  }

  const raw = process.env.NOTION_PARENT_PAGE_ID!;
  const parentPageId = raw.includes("-")
    ? raw
    : `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;

  const create_notion_page = tool({
    description:
      "Create a new page in Notion under the designated reports parent page. Use this to publish finished research reports.",
    inputSchema: z.object({
      title: z.string().describe("The title of the Notion page"),
      content: z
        .string()
        .describe("The page content in markdown format"),
    }),
    execute: async (input, options) => {
      return rawCreatePage.execute(
        {
          parent: { page_id: parentPageId },
          properties: {
            title: {
              title: [{ text: { content: input.title } }],
            },
          },
          children: markdownToBlocks(input.content),
        },
        options,
      );
    },
  });

  return {
    tools: { create_notion_page },
    close: () => client.close(),
  };
}
