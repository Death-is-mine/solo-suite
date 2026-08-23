import { getContext } from '@/lib/workspace-context'
import { authorize, type Permission } from '@/lib/authorization'

// ponytail: MCP tool registry — every tool declares its required permission.
// callTool() checks authorization before executing.

export interface McpTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  permission: Permission
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

  const ctx = getContext()
  if (!authorize(tool.permission, ctx)) {
    throw new Error(`Permission denied: ${tool.permission}`)
  }

  const start = Date.now()
  try {
    const result = await tool.handler(input)
    console.log(JSON.stringify({
      type: 'mcp.execution',
      tool: name,
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
      permission: tool.permission,
      status: 'success',
      duration_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    }))
    return result
  } catch (err) {
    console.error(JSON.stringify({
      type: 'mcp.execution',
      tool: name,
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
      permission: tool.permission,
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
      duration_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    }))
    throw err
  }
}
