import { useEffect } from 'react'
import { getElectronAPI } from '../lib/electron'
import { Header } from './header'

export function TitleBar() {
  const electron = getElectronAPI()

  useEffect(() => {
    // 初始化窗口状态
    async function initWindowState() {
      if (electron?.window) {
        await electron.window.getMaximizedState()
      }
    }

    initWindowState()
  }, [electron])

  return (
    <div className="flex items-center">
      <Header />
    </div>
  )
}
