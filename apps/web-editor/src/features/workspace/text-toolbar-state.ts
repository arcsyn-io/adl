import type { ResolvedDiagramStyles, TextStyle } from '@adl/stylesheet'

export type ToolbarValue<T> =
  | { readonly kind: 'empty' }
  | { readonly kind: 'single'; readonly value: T }
  | { readonly kind: 'mixed' }
  | { readonly kind: 'unavailable'; readonly reason: string }

export interface EditableTextTarget {
  readonly kind: 'element-text' | 'relation-label' | 'group-label'
  readonly entityId: string
  readonly currentTextStyle: TextStyle
  readonly canPersistStyle: boolean
  readonly readOnlyReason?: string
}

export interface TextToolbarState {
  readonly targets: readonly EditableTextTarget[]
  readonly usedTextPaints: readonly string[]
  readonly values: {
    readonly fontFamily: ToolbarValue<readonly string[]>
    readonly fontSize: ToolbarValue<number>
    readonly textPaint: ToolbarValue<string>
    readonly textAlign: ToolbarValue<'left' | 'center' | 'right'>
    readonly fontWeight: ToolbarValue<'normal' | 'bold'>
    readonly fontStyle: ToolbarValue<'normal' | 'italic'>
    readonly textDecoration: ToolbarValue<'none' | 'underline'>
  }
  readonly actions: {
    readonly copy: SelectionActionAvailability
    readonly remove: SelectionActionAvailability
  }
}

export interface SelectionActionAvailability {
  readonly enabled: boolean
  readonly reason?: string
  readonly affectedTargets: number
}

export interface TextToolbarInput {
  readonly selectedIds: readonly string[]
  readonly styles: ResolvedDiagramStyles
  readonly writable?: boolean
}

const empty = <T>(): ToolbarValue<T> => ({ kind: 'empty' })

function sameArray(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((item, index) => item === right[index])
}

function collect<T>(targets: readonly EditableTextTarget[], read: (style: TextStyle) => T, equal: (left: T, right: T) => boolean = Object.is): ToolbarValue<T> {
  if (targets.length === 0) return empty()
  const first = read(targets[0]!.currentTextStyle)
  return targets.every(target => equal(read(target.currentTextStyle), first)) ? { kind: 'single', value: first } : { kind: 'mixed' }
}

function solidColor(style: TextStyle): string {
  return style.paint.kind === 'solid' ? style.paint.color : '#000000'
}

function uniqueSolidTextPaints(styles: ResolvedDiagramStyles): readonly string[] {
  const colors = new Set<string>()
  for (const style of Object.values(styles.elements)) if (style.text.paint.kind === 'solid') colors.add(style.text.paint.color)
  for (const style of Object.values(styles.relations)) if (style.text.paint.kind === 'solid') colors.add(style.text.paint.color)
  for (const style of Object.values(styles.groups)) if (style.text.paint.kind === 'solid') colors.add(style.text.paint.color)
  return [...colors]
}

export function deriveTextToolbarState(input: TextToolbarInput): TextToolbarState {
  const writable = input.writable !== false
  const targets: EditableTextTarget[] = []
  for (const id of input.selectedIds) {
    const elementStyle = input.styles.elements[id]
    if (elementStyle) targets.push({ kind: 'element-text', entityId: id, currentTextStyle: elementStyle.text, canPersistStyle: writable, ...(writable ? {} : { readOnlyReason: 'A fonte visual esta somente leitura.' }) })
    const relationStyle = input.styles.relations[id]
    if (relationStyle) targets.push({ kind: 'relation-label', entityId: id, currentTextStyle: relationStyle.text, canPersistStyle: writable, ...(writable ? {} : { readOnlyReason: 'A fonte visual esta somente leitura.' }) })
    const groupStyle = input.styles.groups[id]
    if (groupStyle) targets.push({ kind: 'group-label', entityId: id, currentTextStyle: groupStyle.text, canPersistStyle: writable, ...(writable ? {} : { readOnlyReason: 'A fonte visual esta somente leitura.' }) })
  }
  const action = input.selectedIds.length > 0 ? { enabled: true, affectedTargets: input.selectedIds.length } : { enabled: false, reason: 'Nenhuma selecao ativa.', affectedTargets: 0 }
  return {
    targets,
    usedTextPaints: uniqueSolidTextPaints(input.styles),
    values: {
      fontFamily: collect(targets, style => style.fontFamily, sameArray),
      fontSize: collect(targets, style => style.fontSize),
      textPaint: collect(targets, solidColor),
      textAlign: collect(targets, style => style.textAlign),
      fontWeight: collect(targets, style => style.fontWeight),
      fontStyle: collect(targets, style => style.fontStyle),
      textDecoration: collect(targets, style => style.textDecoration),
    },
    actions: { copy: action, remove: action },
  }
}
