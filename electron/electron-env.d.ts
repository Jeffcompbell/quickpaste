/// <reference types="vite-plugin-electron/electron-env" />

import type { ProductPrompt, Category } from '../src/types'

declare namespace NodeJS {
  interface ProcessEnv {
    VITE_DEV_SERVER_URL: string
    DIST: string
    VITE_PUBLIC: string
  }
}

interface ElectronAPI {
  window: {
    minimize: () => void
    maximize: () => void
    restore: () => void
    close: () => void
    hide: () => void
    show: () => void
    togglePin: () => void
    togglePanel: () => void
    getPinState: () => Promise<boolean>
    getMaximizedState: () => Promise<boolean>
  }
  clipboard: {
    writeText: (text: string) => Promise<void>
    readText: () => Promise<string>
  }
  ipcRenderer: {
    on: (channel: string, callback: (data: unknown) => void) => () => void
    send: (channel: string, data?: unknown) => void
    once: (channel: string, callback: (data: unknown) => void) => void
    removeAllListeners: (channel: string) => void
  }
  panel: {
    ready: () => void
    onData: (
      callback: (data: {
        prompts: ProductPrompt[]
        categories: Category[]
      }) => void
    ) => () => void
  }
  prompt: {
    add: (
      promptData: Omit<ProductPrompt, 'id' | 'createTime' | 'updateTime'>
    ) => Promise<{ success: boolean; data?: ProductPrompt; error?: string }>
    addDirectory: (
      directoryData: Omit<Category, 'id' | 'createdAt'>
    ) => Promise<{ success: boolean; data?: Category; error?: string }>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

export {}
