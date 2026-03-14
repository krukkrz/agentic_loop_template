import {tavilySearch} from "@tavily/ai-sdk";

export const web_search = tavilySearch({
    apiKey: process.env.TAVILY_API_KEY,
});