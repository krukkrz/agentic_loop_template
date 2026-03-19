import {createOpenRouter} from "@openrouter/ai-sdk-provider";
import {stepCountIs, ToolLoopAgent} from "ai";

const prompt = await Bun.file('./src/prompts/system_prompt.md').text();

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

// const model = "openai/gpt-4o-mini"; //$0,15
const model = "openai/gpt-5-mini"; //$0,25
// const model = "anthropic/claude-3.5-haiku"; //$0,20
// const model = "anthropic/claude-sonnet-4.6"; $3,00


const agent = new ToolLoopAgent({
    model: openrouter(model),
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