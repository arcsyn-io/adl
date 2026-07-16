import type { TextStylePatch } from '@adl/stylesheet'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { freeFontOptions } from './free-font-options.js'
import type { TextToolbarState, ToolbarValue } from './text-toolbar-state.js'

type IconProps = {
  readonly children: ReactNode
  readonly className?: string
}

function Icon({ children, className = 'size-4' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}

type ToolButtonProps = {
  readonly label: string
  readonly children: ReactNode
  readonly active?: boolean
  readonly onClick?: () => void
  readonly disabled?: boolean
}

function ToolButton({ label, children, active = false, onClick, disabled = false }: ToolButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid size-7 shrink-0 place-items-center rounded border-0 p-0 transition-colors hover:bg-[#1b222d] hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'bg-[#202735] text-slate-100' : 'bg-transparent text-slate-500'}`}
    >
      {children}
    </button>
  )
}

const valueOr = <T,>(value: ToolbarValue<T>, fallback: T): T => value.kind === 'single' ? value.value : fallback
const colorInputValue = (value: ToolbarValue<string>): string => value.kind === 'single' ? value.value.slice(0, 7) : '#6594ff'
const textColorPalette = ['#FFFFFFFF', '#CBD5E1FF', '#172033FF', '#475569FF', '#B91C1CFF', '#C2410CFF', '#A16207FF', '#D97706FF', '#15803DFF', '#65A30DFF', '#0E7490FF', '#0891B2FF', '#1D4ED8FF', '#6D28D9FF', '#BE185DFF'] as const
const colorLabel = (color: string) => color.slice(0, 7)
const toOpaquePaint = (color: string) => `${color.slice(0, 7).toUpperCase()}FF`

export interface TopBarProps {
  readonly textToolbarState?: TextToolbarState
  readonly onApplyTextStyle: (patch: TextStylePatch) => void
  readonly onCopySelection: () => void
  readonly onRemoveSelection: () => void
}

function ColorSwatch({ color, label, active, disabled, onSelect }: { readonly color: string; readonly label: string; readonly active: boolean; readonly disabled: boolean; readonly onSelect: (color: string) => void }) {
  return (
    <button
      type="button"
      aria-label={`${label} ${colorLabel(color)}`}
      title={`${label} ${colorLabel(color)}`}
      disabled={disabled}
      onClick={() => onSelect(color)}
      className={`grid size-6 place-items-center rounded border p-0 disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'border-slate-100' : 'border-[#303947]'}`}
    >
      <span className="size-4 rounded-sm" style={{ backgroundColor: colorLabel(color) }} />
    </button>
  )
}

function TextColorMenu({ value, usedColors, disabled, onChange }: { readonly value: ToolbarValue<string>; readonly usedColors: readonly string[]; readonly disabled: boolean; readonly onChange: (color: string) => void }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDetailsElement>(null)
  const currentColor = value.kind === 'single' ? value.value : '#6594ffFF'
  const modelColors = usedColors.filter((color, index, colors) => colors.indexOf(color) === index)
  const select = (color: string) => onChange(toOpaquePaint(color))

  useEffect(() => {
    if (!open) return
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && menuRef.current?.contains(event.target)) return
      setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <details ref={menuRef} open={open} className="relative">
      <summary aria-label="Cor do texto" title="Cor do texto" onClick={event => { event.preventDefault(); if (!disabled) setOpen(current => !current) }} className={`grid size-7 cursor-pointer list-none place-items-center rounded hover:bg-[#1b222d] ${disabled ? 'pointer-events-none opacity-40' : ''}`}>
        <span className="size-4 rounded-sm border border-[#303947]" style={{ backgroundColor: colorLabel(currentColor) }} />
      </summary>
      <div className="absolute left-0 top-8 z-20 w-48 rounded-md border border-[#273140] bg-[#0f141b] p-2 shadow-xl" aria-label="Paleta de cor do texto">
        <p className="m-0 mb-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">Paleta</p>
        <div className="grid grid-cols-5 gap-1">
          {textColorPalette.map(color => <ColorSwatch key={color} color={color} label="Cor predefinida" active={currentColor === color} disabled={disabled} onSelect={select} />)}
        </div>
        {modelColors.length > 0 && <>
          <p className="m-0 mb-1 mt-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">Usadas no modelo</p>
          <div className="grid grid-cols-5 gap-1">
            {modelColors.map(color => <ColorSwatch key={color} color={color} label="Cor usada no modelo" active={currentColor === color} disabled={disabled} onSelect={select} />)}
          </div>
        </>}
        <label className="mt-2 flex items-center justify-between gap-2 rounded border border-[#273140] bg-[#111821] px-2 py-1 text-[11px] text-slate-300">
          Personalizada
          <input aria-label="Cor personalizada" type="color" value={colorInputValue(value)} disabled={disabled} onChange={event => onChange(toOpaquePaint(event.currentTarget.value))} className="size-5 cursor-pointer border-0 bg-transparent p-0" />
        </label>
      </div>
    </details>
  )
}

function TextToolbar({ state, onApplyTextStyle, onCopySelection, onRemoveSelection }: { readonly state?: TextToolbarState } & Pick<TopBarProps, 'onApplyTextStyle' | 'onCopySelection' | 'onRemoveSelection'>) {
  if (!state || state.targets.length === 0) return null

  const disabled = state.targets.some(target => !target.canPersistStyle)
  const fontFamily = valueOr(state.values.fontFamily, freeFontOptions[0]!.fontFamily).join('|')
  const fontSize = valueOr(state.values.fontSize, 14)
  const align = valueOr(state.values.textAlign, 'center')
  const weight = valueOr(state.values.fontWeight, 'normal')
  const fontStyle = valueOr(state.values.fontStyle, 'normal')
  const decoration = valueOr(state.values.textDecoration, 'none')
  const apply = (patch: TextStylePatch) => {
    if (!disabled) onApplyTextStyle(patch)
  }

  return (
    <div className="flex h-full min-w-0 items-center gap-1 border-l border-[#252b34] px-3" aria-label="Estilo do texto selecionado">
      <label className="sr-only" htmlFor="text-toolbar-font">Fonte</label>
      <select id="text-toolbar-font" aria-label="Fonte" value={fontFamily} disabled={disabled} onChange={event => apply({ fontFamily: event.currentTarget.value.split('|') })} className="h-7 max-w-[132px] rounded border border-[#273140] bg-[#111821] px-2 text-xs text-slate-200">
        {freeFontOptions.map(option => <option key={option.id} value={option.fontFamily.join('|')}>{option.label}</option>)}
      </select>

      <label className="sr-only" htmlFor="text-toolbar-size">Tamanho da fonte</label>
      <input id="text-toolbar-size" aria-label="Tamanho da fonte" type="number" min={8} max={256} value={fontSize} disabled={disabled} onChange={event => apply({ fontSize: Number(event.currentTarget.value) })} className="h-7 w-14 rounded border border-[#273140] bg-[#111821] px-2 text-xs text-slate-200" />

      <TextColorMenu value={state.values.textPaint} usedColors={state.usedTextPaints} disabled={disabled} onChange={color => apply({ textPaint: color })} />

      <ToolButton label="Alinhar a esquerda" active={align === 'left'} disabled={disabled} onClick={() => apply({ textAlign: 'left' })}><Icon><path d="M5 7h14M5 12h9M5 17h14" /></Icon></ToolButton>
      <ToolButton label="Centralizar texto" active={align === 'center'} disabled={disabled} onClick={() => apply({ textAlign: 'center' })}><Icon><path d="M5 7h14M8 12h8M5 17h14" /></Icon></ToolButton>
      <ToolButton label="Alinhar a direita" active={align === 'right'} disabled={disabled} onClick={() => apply({ textAlign: 'right' })}><Icon><path d="M5 7h14M10 12h9M5 17h14" /></Icon></ToolButton>
      <ToolButton label="Negrito" active={weight === 'bold'} disabled={disabled} onClick={() => apply({ fontWeight: weight === 'bold' ? 'normal' : 'bold' })}><span className="text-sm font-bold">B</span></ToolButton>
      <ToolButton label="Itálico" active={fontStyle === 'italic'} disabled={disabled} onClick={() => apply({ fontStyle: fontStyle === 'italic' ? 'normal' : 'italic' })}><span className="font-serif text-sm italic">I</span></ToolButton>
      <ToolButton label="Sublinhar" active={decoration === 'underline'} disabled={disabled} onClick={() => apply({ textDecoration: decoration === 'underline' ? 'none' : 'underline' })}><span className="text-sm underline underline-offset-2">U</span></ToolButton>
      <span className="mx-1 h-4 w-px bg-[#252b34]" />
      <ToolButton label="Copiar selecao" disabled={!state.actions.copy.enabled} onClick={onCopySelection}><Icon><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 5H7a2 2 0 0 0-2 2v9" /></Icon></ToolButton>
      <ToolButton label="Remover selecao" disabled={!state.actions.remove.enabled} onClick={onRemoveSelection}><Icon><path d="M5 7h14M9 7V4h6v3M8 10v7M12 10v7M16 10v7M7 7l1 13h8l1-13" /></Icon></ToolButton>
    </div>
  )
}

export function TopBar({ textToolbarState, onApplyTextStyle, onCopySelection, onRemoveSelection }: TopBarProps) {
  return (
    <header className="flex h-[43px] min-w-[960px] shrink-0 items-center border-b border-[#202630] bg-[#0d1117] px-3 text-xs text-slate-400">
      <div className="flex min-w-[350px] items-center gap-2">
        <ToolButton label="Alternar painel lateral">
          <Icon><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 4v16M13 9l-3 3 3 3" /></Icon>
        </ToolButton>
        <span className="grid size-6 place-items-center rounded bg-slate-100 text-xs font-bold text-[#11161d]">A</span>
        <span className="font-semibold text-slate-200">ADL</span>
        <span className="px-1 text-slate-600">/</span>
        <h1 className="m-0 text-xs font-semibold text-slate-200">Payments Flow</h1>
      </div>

      <TextToolbar state={textToolbarState} onApplyTextStyle={onApplyTextStyle} onCopySelection={onCopySelection} onRemoveSelection={onRemoveSelection} />

      <div className="ml-auto flex items-center gap-1">
        <button type="button" className="flex h-7 items-center gap-1.5 rounded border-0 bg-transparent px-2 text-slate-400 hover:bg-[#1b222d] hover:text-slate-200"><span className="text-lg leading-none">+</span> Novo</button>
        <span className="mx-1 h-4 w-px bg-[#252b34]" />
        <ToolButton label="Desfazer"><Icon><path d="M9 7 5 11l4 4M5 11h8a5 5 0 0 1 5 5" /></Icon></ToolButton>
        <ToolButton label="Refazer"><Icon><path d="m15 7 4 4-4 4M19 11h-8a5 5 0 0 0-5 5" /></Icon></ToolButton>
        <span className="mx-1 h-4 w-px bg-[#252b34]" />
        <button type="button" className="flex h-7 items-center gap-2 rounded border-0 bg-transparent px-2 font-semibold text-slate-200 hover:bg-[#1b222d]">
          <Icon><path d="M12 3v11M8 10l4 4 4-4M5 15v4h14v-4" /></Icon>
          Exportar <span className="text-[9px] text-slate-600">⌄</span>
        </button>
        <span className="mx-1 h-4 w-px bg-[#252b34]" />
        <button type="button" className="flex h-7 items-center gap-2 rounded border-0 bg-transparent px-2 text-slate-400 hover:bg-[#1b222d] hover:text-slate-200">
          <Icon><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8M12 17v4" /></Icon>
          Sistema
        </button>
        <ToolButton label="Mais opções"><span className="text-lg leading-none">•••</span></ToolButton>
      </div>
    </header>
  )
}

export function AssistantConversation() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 text-[13px] leading-[1.65] text-slate-100">
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.06em] text-slate-400">VOCÊ</p>
        <p className="m-0 font-medium">Preciso de um fluxo de pagamentos assíncrono com fila e um worker que grava no banco e notifica um sistema externo.</p>

        <p className="mb-1.5 mt-4 text-[10px] font-semibold tracking-[0.06em] text-[#8fa0b8]">ADL ASSISTANT</p>
        <p className="m-0 font-medium">O editor está conectado ao código ADL e ao stylesheet. Alterações válidas são refletidas no diagrama, e ajustes de geometria no canvas são gravados no ADLS.</p>

        <div className="mt-3 inline-flex items-center gap-2 rounded border border-[#222a35] bg-[#151b23] px-2 py-1 text-[11px] text-slate-400">
          <span className="size-1.5 rounded-full bg-[#6594ff]" />
          Editor ADL, stylesheet e diagrama sincronizados
        </div>
      </div>

      <form className="m-2 rounded-md border border-[#252d39] bg-[#090d12] p-3" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="assistant-prompt" className="sr-only">Descreva alterações no diagrama</label>
        <textarea id="assistant-prompt" aria-label="Descreva alterações no diagrama" placeholder="Descreva alterações no diagrama..." className="h-12 w-full resize-none bg-transparent text-[13px] text-slate-100 outline-none placeholder:text-slate-400" />
        <div className="flex items-end justify-between gap-3">
          <span className="text-[10px] text-slate-500">⌘ + ↵ para enviar</span>
          <button type="submit" className="flex h-8 items-center gap-2 rounded-md border-0 bg-[#6594ff] px-3 text-xs font-semibold text-[#08101f] transition-colors hover:bg-[#79a3ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8cb0ff]">
            <Icon><path d="m3 11 18-8-8 18-2-8-8-2Z" /><path d="m11 13 10-10" /></Icon>
            Enviar
          </button>
        </div>
      </form>
    </div>
  )
}

export function CanvasToolbar({ onReorganize }: { readonly onReorganize: () => void }) {
  return (
    <div className="canvas-toolbar">
      <ToolButton label="Selecionar" active><Icon><path d="m5 4 6.5 15 2-6 6-2L5 4Z" /></Icon></ToolButton>
      <span className="mx-1 h-5 w-px bg-[#29313d]" />
      <ToolButton label="Diminuir zoom"><Icon><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4M8 11h6" /></Icon></ToolButton>
      <span className="min-w-12 text-center text-[11px] text-slate-400">100%</span>
      <ToolButton label="Aumentar zoom"><Icon><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4M8 11h6M11 8v6" /></Icon></ToolButton>
      <ToolButton label="Reorganizar diagrama" onClick={onReorganize}><Icon><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /><circle cx="12" cy="12" r="3" /></Icon></ToolButton>
      <span className="mx-1 h-5 w-px bg-[#29313d]" />
      <ToolButton label="Grade" active><Icon><path d="M4 4h16v16H4zM4 10h16M10 4v16M15 4v16M4 15h16" /></Icon></ToolButton>
      <ToolButton label="Conexões" active><Icon><path d="M8 12a4 4 0 0 1 4-4h2M16 12a4 4 0 0 1-4 4h-2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="12" r="2" /></Icon></ToolButton>
    </div>
  )
}
