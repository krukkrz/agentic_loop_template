# Agentic Loop Template

A minimal template for building agentic loops with the [AI SDK](https://sdk.vercel.ai/) and OpenRouter.

## Setup

```bash
bun install
cp .env.example .env
```

Edit `.env` and fill in your API keys:

```
OPENROUTER_API_KEY=   # required — get one at openrouter.ai
TAVILY_API_KEY=        # required if using web_search tool
NOTION_TOKEN=          # required if using notion tool
NOTION_PARENT_PAGE_ID= # required if using notion tool
```

## Run

```bash
bun run index.ts
```

## System Prompt

Edit `src/prompts/system_prompt.md` to define what the agent should do.

## Tools

Available tools are in `src/tools/`. To add a tool to the agent, import it in `index.ts` and add it to the `tools` object:

```ts
import {web_search} from "./src/tools/tavily_search";
import {createNotionTools} from "./src/tools/notion";
import {createReadWebPageTool} from "./src/tools/read_web_page";

const notion = await createNotionTools();
const readWebPage = createReadWebPageTool();

const agent = new ToolLoopAgent({
    tools: {
        web_search,
        ...notion.tools,
        ...readWebPage.tools,
    },
    // ...
});

// cleanup MCP connections when done
await notion.close();
```

| Tool | File | Description |
|---|---|---|
| `web_search` | `tavily_search.ts` | Web search via Tavily |
| `read_web_page` | `read_web_page.ts` | Fetch a URL as markdown |
| `create_notion_page` | `notion.ts` | Create a page in Notion |