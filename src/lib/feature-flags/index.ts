export const featureFlags = {
  ai: { label: 'AI', default: 'beta' as const },
  reviews: { label: 'Reviews', default: 'disabled' as const },
  clientPortal: { label: 'Client Portal', default: 'beta' as const },
  documents: { label: 'Documents', default: 'enabled' as const },
  automation: { label: 'Automation', default: 'enabled' as const },
  backup: { label: 'Backup', default: 'enabled' as const },
  reports: { label: 'Reports', default: 'enabled' as const },
} as const

export type FeatureFlagKey = keyof typeof featureFlags
export type FeatureFlagState = 'enabled' | 'disabled' | 'beta' | 'experimental'

export function isFeatureEnabled(key: FeatureFlagKey, overrides?: Record<string, FeatureFlagState>): boolean {
  const state = overrides?.[key] ?? featureFlags[key].default
  return state === 'enabled' || state === 'beta'
}
