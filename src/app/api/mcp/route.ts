import { type NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/with-auth'
import { listTools, callTool } from '@/lib/mcp'
import '@/lib/mcp/tools'

// ponytail: MCP JSON-RPC endpoint — simple tool listing and execution

export const POST = withAuth(async (request, session) => {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { method, params, id } = body

  try {
    switch (method) {
      case 'tools/list': {
        const tools = listTools()
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            tools: tools.map((t) => ({
              name: t.name,
              description: t.description,
              inputSchema: t.inputSchema,
            })),
          },
        })
      }
      case 'tools/call': {
        const { name, arguments: args } = params ?? {}
        if (!name) return NextResponse.json({ error: 'Missing tool name' }, { status: 400 })
        const result = await callTool(name, args ?? {})
        return NextResponse.json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(result) }] } })
      }
      default:
        return NextResponse.json({ jsonrpc: '2.0', id, error: { code: -32601, message: `Unknown method: ${method}` } })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ jsonrpc: '2.0', id, error: { code: -32000, message } })
  }
})
