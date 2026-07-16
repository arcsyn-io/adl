export interface FreeFontOption {
  readonly id: string
  readonly label: string
  readonly fontFamily: readonly string[]
  readonly genericFallback: 'sans-serif' | 'serif' | 'monospace'
  readonly licenseName: string
  readonly licenseSource: string
}

export const freeFontOptions = [
  {
    id: 'inter',
    label: 'Inter',
    fontFamily: ['Inter', 'sans-serif'],
    genericFallback: 'sans-serif',
    licenseName: 'SIL Open Font License 1.1',
    licenseSource: 'rsms/inter',
  },
  {
    id: 'source-sans-3',
    label: 'Source Sans 3',
    fontFamily: ['Source Sans 3', 'sans-serif'],
    genericFallback: 'sans-serif',
    licenseName: 'SIL Open Font License 1.1',
    licenseSource: 'adobe-fonts/source-sans',
  },
  {
    id: 'noto-sans',
    label: 'Noto Sans',
    fontFamily: ['Noto Sans', 'sans-serif'],
    genericFallback: 'sans-serif',
    licenseName: 'SIL Open Font License 1.1',
    licenseSource: 'notofonts/noto-fonts',
  },
  {
    id: 'roboto-slab',
    label: 'Roboto Slab',
    fontFamily: ['Roboto Slab', 'serif'],
    genericFallback: 'serif',
    licenseName: 'Apache License 2.0',
    licenseSource: 'googlefonts/robotoslab',
  },
  {
    id: 'jetbrains-mono',
    label: 'JetBrains Mono',
    fontFamily: ['JetBrains Mono', 'monospace'],
    genericFallback: 'monospace',
    licenseName: 'SIL Open Font License 1.1',
    licenseSource: 'JetBrains/JetBrainsMono',
  },
] as const satisfies readonly FreeFontOption[]

export function findFreeFontOption(id: string): FreeFontOption | undefined {
  return freeFontOptions.find(option => option.id === id)
}
