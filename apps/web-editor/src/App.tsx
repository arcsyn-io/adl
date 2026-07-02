import {
  Background,
  BackgroundVariant,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import type { ReactNode } from 'react'

type DiagramNodeData = {
  label: string
}

type DiagramNode = Node<DiagramNodeData, 'diagram'>

const diagramNodes: DiagramNode[] = [
  { id: 'client', type: 'diagram', position: { x: 40, y: 120 }, data: { label: 'Cliente' }, style: { width: 132, height: 60 } },
  { id: 'gateway', type: 'diagram', position: { x: 220, y: 120 }, data: { label: 'API Gateway' }, style: { width: 132, height: 60 } },
  { id: 'payments', type: 'diagram', position: { x: 400, y: 120 }, data: { label: 'Serviço de Pagamentos' }, style: { width: 168, height: 60 }, selected: true },
  { id: 'queue', type: 'diagram', position: { x: 620, y: 120 }, data: { label: 'Fila' }, style: { width: 108, height: 60 } },
  { id: 'worker', type: 'diagram', position: { x: 620, y: 250 }, data: { label: 'Worker' }, style: { width: 108, height: 60 } },
  { id: 'external', type: 'diagram', position: { x: 800, y: 250 }, data: { label: 'Sistema Externo' }, style: { width: 156, height: 60 } },
  { id: 'database', type: 'diagram', position: { x: 400, y: 380 }, data: { label: 'Banco de Dados' }, style: { width: 132, height: 60 } },
]

const edgeDefaults = {
  type: 'straight',
  style: { stroke: '#6f7784', strokeWidth: 1.25 },
  labelStyle: { fill: '#7f8998', fontSize: 10 },
  labelBgStyle: { fill: '#0c1118', stroke: '#202733', strokeWidth: 1 },
  labelBgPadding: [7, 3] as [number, number],
  labelBgBorderRadius: 3,
  markerEnd: { type: MarkerType.ArrowClosed, color: '#6f7784', width: 14, height: 14 },
}

const diagramEdges: Edge[] = [
  { ...edgeDefaults, id: 'client-gateway', source: 'client', sourceHandle: 'right-source', target: 'gateway', targetHandle: 'left-target', label: 'solicita' },
  { ...edgeDefaults, id: 'gateway-payments', source: 'gateway', sourceHandle: 'right-source', target: 'payments', targetHandle: 'left-target', label: 'encaminha' },
  { ...edgeDefaults, id: 'payments-queue', source: 'payments', sourceHandle: 'right-source', target: 'queue', targetHandle: 'left-target', label: 'publica' },
  { ...edgeDefaults, id: 'queue-worker', source: 'queue', sourceHandle: 'bottom-source', target: 'worker', targetHandle: 'top-target', label: 'consome' },
  { ...edgeDefaults, id: 'worker-external', source: 'worker', sourceHandle: 'right-source', target: 'external', targetHandle: 'left-target', label: 'notifica' },
  { ...edgeDefaults, id: 'worker-database', source: 'worker', sourceHandle: 'left-source', target: 'database', targetHandle: 'right-target', label: 'persiste' },
]

function DiagramNodeCard({ data, selected }: NodeProps<DiagramNode>) {
  const handleClass = selected
    ? '!size-2 !border !border-[#0a0e14] !bg-[#6594ff]'
    : '!size-1 !border-0 !bg-transparent'

  return (
    <div className={`grid size-full place-items-center rounded-md border bg-[#10151c] px-3 text-center text-[13px] font-semibold text-slate-100 ${selected ? 'border-[#6594ff]' : 'border-[#343d49]'}`}>
      <Handle id="top-target" type="target" position={Position.Top} className={handleClass} />
      <Handle id="top-source" type="source" position={Position.Top} className={handleClass} />
      <Handle id="left-target" type="target" position={Position.Left} className={handleClass} />
      <Handle id="left-source" type="source" position={Position.Left} className={handleClass} />
      <span>{data.label}</span>
      <Handle id="right-target" type="target" position={Position.Right} className={handleClass} />
      <Handle id="right-source" type="source" position={Position.Right} className={handleClass} />
      <Handle id="bottom-target" type="target" position={Position.Bottom} className={handleClass} />
      <Handle id="bottom-source" type="source" position={Position.Bottom} className={handleClass} />
    </div>
  )
}

const nodeTypes = { diagram: DiagramNodeCard }

type IconProps = {
  children: ReactNode
  className?: string
}

function Icon({ children, className = 'size-4' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}

type ToolButtonProps = {
  label: string
  children: ReactNode
  active?: boolean
}

function ToolButton({ label, children, active = false }: ToolButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid size-7 shrink-0 place-items-center rounded text-slate-500 transition-colors hover:bg-[#1b222d] hover:text-slate-200 ${active ? 'bg-[#202735] text-slate-100' : ''}`}
    >
      {children}
    </button>
  )
}

function TopBar() {
  return (
    <header className="flex h-[43px] min-w-[960px] items-center border-b border-[#202630] bg-[#0d1117] px-3 text-xs text-slate-400">
      <div className="flex min-w-[350px] items-center gap-2">
        <ToolButton label="Alternar painel lateral">
          <Icon><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 4v16M13 9l-3 3 3 3" /></Icon>
        </ToolButton>
        <span className="grid size-6 place-items-center rounded bg-slate-100 text-xs font-bold text-[#11161d]">A</span>
        <span className="font-semibold text-slate-200">ADL</span>
        <span className="px-1 text-slate-600">/</span>
        <h1 className="text-xs font-semibold text-slate-200">Payments Flow</h1>
      </div>

      <div className="flex h-full items-center gap-0.5 border-l border-[#252b34] px-4">
        <ToolButton label="Estilo de texto"><span className="font-serif text-base">T</span></ToolButton>
        <button type="button" className="flex h-7 items-center gap-1 rounded px-1 text-slate-500 hover:bg-[#1b222d]">14 <span className="text-[9px]">⌄</span></button>
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
        <button type="button" className="flex h-7 items-center gap-1.5 rounded px-2 hover:bg-[#1b222d] hover:text-slate-200"><span className="text-lg leading-none">+</span> Novo</button>
        <span className="mx-1 h-4 w-px bg-[#252b34]" />
        <ToolButton label="Desfazer"><Icon><path d="M9 7 5 11l4 4M5 11h8a5 5 0 0 1 5 5" /></Icon></ToolButton>
        <ToolButton label="Refazer"><Icon><path d="m15 7 4 4-4 4M19 11h-8a5 5 0 0 0-5 5" /></Icon></ToolButton>
        <span className="mx-1 h-4 w-px bg-[#252b34]" />
        <button type="button" className="flex h-7 items-center gap-2 rounded px-2 font-semibold text-slate-200 hover:bg-[#1b222d]">
          <Icon><path d="M12 3v11M8 10l4 4 4-4M5 15v4h14v-4" /></Icon>
          Exportar <span className="text-[9px] text-slate-600">⌄</span>
        </button>
        <span className="mx-1 h-4 w-px bg-[#252b34]" />
        <button type="button" className="flex h-7 items-center gap-2 rounded px-2 hover:bg-[#1b222d] hover:text-slate-200">
          <Icon><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8M12 17v4" /></Icon>
          Sistema
        </button>
        <ToolButton label="Mais opções"><span className="text-lg leading-none">•••</span></ToolButton>
      </div>
    </header>
  )
}

function AssistantPanel() {
  return (
    <aside aria-label="Assistente ADL" className="flex h-full w-[356px] shrink-0 flex-col border-r border-[#202630] bg-[#0f141b]">
      <nav aria-label="Modos do editor" className="flex h-[42px] shrink-0 items-center gap-1 border-b border-[#202630] px-1 text-[11px] text-slate-400">
        <button type="button" className="grid h-7 min-w-9 place-items-center rounded-md bg-[#202735] px-2 font-semibold text-slate-100">IA</button>
        <button type="button" className="h-7 rounded px-2.5 hover:bg-[#1a212b] hover:text-slate-200">ADL</button>
        <button type="button" className="h-7 rounded px-2.5 hover:bg-[#1a212b] hover:text-slate-200">ADLS</button>
        <button type="button" className="ml-auto h-7 rounded px-2.5 text-[10px] font-semibold tracking-[0.08em] hover:bg-[#1a212b] hover:text-slate-200">ASSISTENTE</button>
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 text-[13px] leading-[1.65] text-slate-100">
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.06em] text-slate-400">VOCÊ</p>
        <p className="font-medium">Preciso de um fluxo de pagamentos assíncrono com fila e um worker que grava no banco e notifica um sistema externo.</p>

        <p className="mb-1.5 mt-4 text-[10px] font-semibold tracking-[0.06em] text-[#8fa0b8]">ADL ASSISTANT</p>
        <p className="font-medium">
          Gerei o diagrama inicial com Cliente → API Gateway → Serviço de Pagamentos, publicando em uma Fila consumida por um Worker que persiste no Banco e notifica o Sistema Externo. Você pode ajustar diretamente no canvas ou pedir novas mudanças aqui.
        </p>

        <div className="mt-3 inline-flex items-center gap-2 rounded border border-[#222a35] bg-[#151b23] px-2 py-1 text-[11px] text-slate-400">
          <span className="size-1.5 rounded-full bg-[#6594ff]" />
          7 nós, 6 conexões aplicadas ao diagrama
        </div>

        <p className="mb-1.5 mt-4 text-[10px] font-semibold tracking-[0.06em] text-slate-400">VOCÊ</p>
        <p className="font-medium">Adicione um cache entre o gateway e o serviço de pagamentos.</p>

        <div className="mt-4 flex items-center gap-2 text-[12px] text-slate-400">
          <Icon className="size-3.5 text-[#6594ff]"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /><circle cx="12" cy="12" r="3" /></Icon>
          Gerando alterações...
        </div>
      </div>

      <form className="m-2 rounded-md border border-[#252d39] bg-[#090d12] p-3" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="assistant-prompt" className="sr-only">Descreva alterações no diagrama</label>
        <textarea
          id="assistant-prompt"
          aria-label="Descreva alterações no diagrama"
          placeholder="Descreva alterações no diagrama..."
          className="h-12 w-full resize-none bg-transparent text-[13px] text-slate-100 outline-none placeholder:text-slate-400"
        />
        <div className="flex items-end justify-between gap-3">
          <span className="text-[10px] text-slate-500">⌘ + ↵ para enviar</span>
          <button type="submit" className="flex h-8 items-center gap-2 rounded-md bg-[#6594ff] px-3 text-xs font-semibold text-[#08101f] transition-colors hover:bg-[#79a3ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8cb0ff]">
            <Icon><path d="m3 11 18-8-8 18-2-8-8-2Z" /><path d="m11 13 10-10" /></Icon>
            Enviar
          </button>
        </div>
      </form>
    </aside>
  )
}

function CanvasToolbar() {
  return (
    <div className="pointer-events-auto absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center rounded-lg border border-[#29313d] bg-[#161c25] p-1 shadow-[0_8px_30px_rgba(0,0,0,.35)]">
      <ToolButton label="Selecionar" active><Icon><path d="m5 4 6.5 15 2-6 6-2L5 4Z" /></Icon></ToolButton>
      <span className="mx-1 h-5 w-px bg-[#29313d]" />
      <ToolButton label="Diminuir zoom"><Icon><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4M8 11h6" /></Icon></ToolButton>
      <span className="min-w-12 text-center text-[11px] text-slate-400">100%</span>
      <ToolButton label="Aumentar zoom"><Icon><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4M8 11h6M11 8v6" /></Icon></ToolButton>
      <ToolButton label="Centralizar"><Icon><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /><circle cx="12" cy="12" r="3" /></Icon></ToolButton>
      <ToolButton label="Tela cheia"><Icon><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" /></Icon></ToolButton>
      <span className="mx-1 h-5 w-px bg-[#29313d]" />
      <ToolButton label="Grade" active><Icon><path d="M4 4h16v16H4zM4 10h16M10 4v16M15 4v16M4 15h16" /></Icon></ToolButton>
      <ToolButton label="Conexões" active><Icon><path d="M8 12a4 4 0 0 1 4-4h2M16 12a4 4 0 0 1-4 4h-2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="12" r="2" /></Icon></ToolButton>
      <ToolButton label="Camadas" active><Icon><path d="M5 7h14M5 12h14M5 17h14" /></Icon></ToolButton>
    </div>
  )
}

function DiagramCanvas() {
  return (
    <section aria-label="Diagrama Payments Flow" className="relative min-w-0 flex-1 bg-[#0a0e14]">
      <ReactFlow
        nodes={diagramNodes}
        edges={diagramEdges}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.5}
        maxZoom={1.75}
        nodesDraggable={false}
        nodesConnectable={false}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#202630" gap={24} size={1} variant={BackgroundVariant.Lines} />
      </ReactFlow>

      <div className="pointer-events-none absolute right-1 top-3 z-10 rounded border border-[#202733] bg-[#10151c] px-2 py-1.5 text-[10px] text-slate-500">
        Serviço de Pagamentos · 168×60
      </div>
      <CanvasToolbar />
      <button type="button" aria-label="Recolher painel" className="absolute -right-4 bottom-2 z-10 grid size-10 place-items-center rounded-full border border-[#343c48] bg-[#0d1219] text-slate-400 hover:text-slate-100">
        <Icon><path d="m14 8-4 4 4 4" /></Icon>
      </button>
    </section>
  )
}

export function App() {
  return (
    <main className="flex h-screen min-h-[600px] min-w-[960px] flex-col overflow-hidden bg-[#0a0e14] text-slate-100">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <AssistantPanel />
        <DiagramCanvas />
      </div>
    </main>
  )
}
