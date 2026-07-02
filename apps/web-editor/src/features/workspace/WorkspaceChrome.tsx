import type { ReactNode } from 'react'

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
}

function ToolButton({ label, children, active = false, onClick }: ToolButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid size-7 shrink-0 place-items-center rounded border-0 p-0 transition-colors hover:bg-[#1b222d] hover:text-slate-200 ${active ? 'bg-[#202735] text-slate-100' : 'bg-transparent text-slate-500'}`}
    >
      {children}
    </button>
  )
}

export function TopBar() {
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

      <div className="flex h-full items-center gap-0.5 border-l border-[#252b34] px-4">
        <ToolButton label="Estilo de texto"><span className="font-serif text-base">T</span></ToolButton>
        <span className="px-1 text-slate-500">14⌄</span>
        <ToolButton label="Alinhar texto"><Icon><path d="M5 7h14M5 12h10M5 17h14" /></Icon></ToolButton>
        <ToolButton label="Cor"><span className="size-4 rounded bg-[#6594ff]" /></ToolButton>
        <ToolButton label="Negrito"><span className="text-sm font-bold">B</span></ToolButton>
        <ToolButton label="Itálico"><span className="font-serif text-sm italic">I</span></ToolButton>
        <ToolButton label="Sublinhar"><span className="text-sm underline underline-offset-2">U</span></ToolButton>
        <span className="mx-1 h-4 w-px bg-[#252b34]" />
        <ToolButton label="Duplicar"><Icon><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 5H7a2 2 0 0 0-2 2v9" /></Icon></ToolButton>
        <ToolButton label="Excluir"><Icon><path d="M5 7h14M9 7V4h6v3M8 10v7M12 10v7M16 10v7M7 7l1 13h8l1-13" /></Icon></ToolButton>
      </div>

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
