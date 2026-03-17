import { tool } from "ai";
import { z } from "zod";
import { join, resolve } from "path";

const WORKSPACE_DIR = resolve("./workspace");

function safePath(filename: string): string {
  const full = resolve(join(WORKSPACE_DIR, filename));
  if (!full.startsWith(WORKSPACE_DIR)) {
    throw new Error("Path traversal not allowed");
  }
  return full;
}

async function ensureWorkspace() {
  await Bun.$`mkdir -p ${WORKSPACE_DIR}`.quiet();
}

export function createWorkspaceTools() {
  return {
    tools: {
      workspace_read: tool({
        description: "Read the content of a file in the ./workspace directory.",
        inputSchema: z.object({
          filename: z.string().describe("Filename relative to workspace"),
        }),
        execute: async ({ filename }) => {
          const file = Bun.file(safePath(filename));
          if (!(await file.exists())) {
            return `Error: '${filename}' does not exist`;
          }
          return await file.text();
        },
      }),
      workspace_write: tool({
        description:
            "Create or overwrite a file in the ./workspace directory.",
        inputSchema: z.object({
          filename: z.string().describe("Filename relative to workspace"),
          content: z.string().describe("Content to write"),
        }),
        execute: async ({ filename, content }) => {
          await ensureWorkspace();
          await Bun.write(safePath(filename), content);
          return `Written '${filename}' (${content.length} chars)`;
        },
      }),
      workspace_edit: tool({
        description:
            "Replace all occurrences of a string in a file in the ./workspace directory.",
        inputSchema: z.object({
          filename: z.string().describe("Filename relative to workspace"),
          old_string: z.string().describe("String to replace"),
          new_string: z.string().describe("Replacement string"),
        }),
        execute: async ({ filename, old_string, new_string }) => {
          const path = safePath(filename);
          const file = Bun.file(path);
          if (!(await file.exists())) {
            return `Error: '${filename}' does not exist`;
          }
          const original = await file.text();
          if (!original.includes(old_string)) {
            return `Error: string not found in '${filename}'`;
          }
          const updated = original.replaceAll(old_string, new_string);
          await Bun.write(path, updated);
          return `Edited '${filename}'`;
        },
      }),
      workspace_list: tool({
        description: "List all files in the ./workspace directory.",
        inputSchema: z.object({}),
        execute: async () => {
          await ensureWorkspace();
          const glob = new Bun.Glob("**/*");
          const files: string[] = [];
          for await (const f of glob.scan(WORKSPACE_DIR)) {
            files.push(f);
          }
          return files.length > 0 ? files.join("\n") : "(workspace is empty)";
        },
      }),
    },
  };
}