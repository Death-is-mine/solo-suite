// ponytail: MCP (Model Context Protocol) server — exposes workspace data to AI models

export interface McpTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  handler: (input: Record<string, unknown>) => Promise<unknown>
}

const tools = new Map<string, McpTool>()

export function registerTool(tool: McpTool) {
  tools.set(tool.name, tool)
}

export function getTool(name: string): McpTool | undefined {
  return tools.get(name)
}

export function listTools(): McpTool[] {
  return Array.from(tools.values())
}

export async function callTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  const tool = tools.get(name)
  if (!tool) throw new Error(`Unknown tool: ${name}`)
  return tool.handler(input)
}
