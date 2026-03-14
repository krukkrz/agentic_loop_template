import {createOpenRouter} from "@openrouter/ai-sdk-provider";
import {stepCountIs, ToolLoopAgent} from "ai";

const prompt = await Bun.file('./src/prompts/system_prompt.md').text();

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

const agent = new ToolLoopAgent({
    model: openrouter("openai/gpt-4o-mini-2024-07-18"),
    stopWhen: stepCountIs(10),
    tools: {
        // Add your tools here. See src/tools/ for available tools.
    },
    experimental_onStepStart: event => {
        console.log(`\n[Step ${event.stepNumber}]`);
    },
    onStepFinish: event => {
        const toolCalls = event.toolCalls?.map(t => t.toolName).join(', ');
        console.log(`  finish: ${event.finishReason} | tokens: ${event.usage.totalTokens}${toolCalls ? ` | tools: ${toolCalls}` : ''}`);
    },
    onFinish: event => {
        console.log(`\n[Done] steps: ${event.steps.length} | total tokens: ${event.totalUsage.totalTokens}`);
    },
    experimental_onToolCallStart: event => {
        console.log(`  -> ${event.toolCall.toolName}(${JSON.stringify(event.toolCall.input)})`);
    },
});

const result = await agent.generate({
    prompt: prompt,
});

console.log('\n[Output]\n', result.output);