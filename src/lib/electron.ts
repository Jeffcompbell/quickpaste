import type { ElectronAPI } from '../../electron/electron-env'

export function getElectronAPI(): ElectronAPI {
  if (!window.electron) {
    throw new Error('Electron API not available')
  }

  return window.electron
}
