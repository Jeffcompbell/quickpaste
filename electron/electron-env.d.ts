/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    VITE_DEV_SERVER_URL: string
    DIST: string
    VITE_PUBLIC: string
  }
}

export interface ElectronAPI {
  window: {
    minimize: () => void
    maximize: () => void
    restore: () => void
    close: () => void
    hide: () => void
    show: () => void
    togglePin: () => void
    getPinState: () => Promise<boolean>
    getMaximizedState: () => Promise<boolean>
  }
  clipboard: {
    writeText: (text: string) => void
    readText: () => string
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

export {}
