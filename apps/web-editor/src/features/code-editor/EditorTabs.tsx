import { useCallback, useState, type ReactNode } from 'react'
import { CodeEditor } from './CodeEditor.js'

export interface EditorTabsProps {
  readonly adlText: string
  readonly stylesheetText: string
  readonly onAdlChange: (text: string) => void
  readonly onStylesheetChange: (text: string) => void
  readonly assistant: ReactNode
}

type WorkspaceTab = 'assistant' | 'adl' | 'stylesheet'

export function EditorTabs({ adlText, stylesheetText, onAdlChange, onStylesheetChange, assistant }: EditorTabsProps) {
  const [active, setActive] = useState<WorkspaceTab>('assistant')
  const [adl, setAdl] = useState(adlText)
  const [lastAdlText, setLastAdlText] = useState(adlText)
  if (adlText !== lastAdlText) { setLastAdlText(adlText); setAdl(adlText) }
  const changeAdl = useCallback((text: string) => {
    setAdl(text)
    onAdlChange(text)
  }, [onAdlChange])

  return (
    <aside aria-label="Workspace lateral" className="source-tabs">
      <div className="source-tablist" role="tablist" aria-label="Fontes do diagrama">
        <button type="button" role="tab" aria-label="Assistente IA" aria-selected={active === 'assistant'} aria-controls="assistant-panel" id="assistant-tab" onClick={() => setActive('assistant')}>IA</button>
        <button type="button" role="tab" aria-label="Código ADL" aria-selected={active === 'adl'} aria-controls="adl-editor-panel" id="adl-editor-tab" onClick={() => setActive('adl')}>ADL</button>
        <button type="button" role="tab" aria-label="Stylesheet aplicado" aria-selected={active === 'stylesheet'} aria-controls="stylesheet-editor-panel" id="stylesheet-editor-tab" onClick={() => setActive('stylesheet')}>ADLS</button>
        <span className="source-tab-caption">ASSISTENTE</span>
      </div>

      {active === 'assistant' ? (
        <div className="source-tabpanel" role="tabpanel" id="assistant-panel" aria-labelledby="assistant-tab">{assistant}</div>
      ) : active === 'adl' ? (
        <div className="source-tabpanel" role="tabpanel" id="adl-editor-panel" aria-labelledby="adl-editor-tab">
          <CodeEditor key="adl" initialText={adl} onChange={changeAdl} />
        </div>
      ) : (
        <div className="source-tabpanel" role="tabpanel" id="stylesheet-editor-panel" aria-labelledby="stylesheet-editor-tab">
          <CodeEditor key="stylesheet" initialText={stylesheetText} onChange={onStylesheetChange} mode="stylesheet" title="Editor de stylesheet" ariaLabel="Código do stylesheet aplicado" />
        </div>
      )}
    </aside>
  )
}
