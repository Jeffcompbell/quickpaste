/// <reference types="../../electron/electron-env" />

export function getElectronAPI(): Window['electron'] | undefined {
  if (typeof window !== 'undefined' && window.electron) {
    return window.electron
  }
  return undefined
}
