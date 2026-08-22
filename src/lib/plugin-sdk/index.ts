// ponytail: plugin SDK — minimal extension point for custom modules

export interface Plugin {
  name: string
  version: string
  description?: string
  register: () => Promise<void> | void
}

const plugins = new Map<string, Plugin>()

export function registerPlugin(plugin: Plugin) {
  if (plugins.has(plugin.name)) {
    console.warn(`[plugin] ${plugin.name} already registered, skipping`)
    return
  }
  plugins.set(plugin.name, plugin)
  console.log(`[plugin] registered: ${plugin.name}@${plugin.version}`)
}

export async function initPlugins() {
  for (const [name, plugin] of plugins) {
    try {
      await plugin.register()
      console.log(`[plugin] ${name} initialized`)
    } catch (err) {
      console.error(`[plugin] ${name} init failed:`, err)
    }
  }
}

export function listPlugins(): { name: string; version: string; description?: string }[] {
  return Array.from(plugins.values()).map(({ name, version, description }) => ({ name, version, description }))
}

export function getPlugin(name: string): Plugin | undefined {
  return plugins.get(name)
}
