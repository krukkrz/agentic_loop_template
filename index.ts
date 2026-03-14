/*
    1. make a research using web_search
    2. gather information and prepare report
    3. create a page in notion


    need:
        - notion MCP
        - Web search tool

 */

import {createOpenRouter} from "@openrouter/ai-sdk-provider";
import {ToolLoopAgent} from "ai";
import {tavilySearch} from "@tavily/ai-sdk";

const prompt = await Bun.file('./src/prompts/system_prompt.md').text();

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

const agent = new ToolLoopAgent({
    model: openrouter("anthropic/claude-sonnet-4.5"),
    tools: {
        web_search: tavilySearch({
            apiKey: process.env.TAVILY_API_KEY,
        }),
    },
    experimental_onStart: event => {
        console.log(`[${new Date().toISOString()}] Generation started`, {
            model: event.model.modelId,
            provider: event.model.provider,
        });
    },
    onStepFinish: event => {
        console.log(
            `[${new Date().toISOString()}] Step ${event.stepNumber} finished`,
            {
                finishReason: event.finishReason,
                tokens: event.usage.totalTokens,
                text: event.text,
            },
        );
    },
    onFinish: event => {
        console.log(`[${new Date().toISOString()}] Generation complete`, {
            totalSteps: event.steps.length,
            totalTokens: event.totalUsage.totalTokens,
        });
    },
    experimental_onToolCallStart: event => {
        console.log(`[${new Date().toISOString()}] Tool "${event.toolCall.toolName}" starting...`);
    },
});

const result = await agent.generate({
    prompt: prompt,
});

console.log('[result]', result.output);