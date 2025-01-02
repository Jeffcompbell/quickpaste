import React from 'react'
import { PromptPanel } from './PromptPanel'
import { getElectronAPI } from '../../lib/electron'

export function PromptPanelPage() {
  const electron = getElectronAPI()

  React.useEffect(() => {
    if (!electron) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        electron.window.hide()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [electron])

  return <PromptPanel />
}
