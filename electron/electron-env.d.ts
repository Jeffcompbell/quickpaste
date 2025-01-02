/// <reference types="vite-plugin-electron/electron-env" />

import type { ProductPrompt, Category } from '../src/types'
import type {
  ElectronAPI as BaseElectronAPI,
  VersionInfo,
  ApiResponse,
} from './types'

declare namespace NodeJS {
  interface ProcessEnv {
    VITE_DEV_SERVER_URL: string
    DIST: string
    VITE_PUBLIC: string
  }
}

export interface ElectronAPI extends Omit<BaseElectronAPI, 'prompt'> {
  prompt: {
    add: (
      promptData: Omit<ProductPrompt, 'id' | 'createTime' | 'updateTime'>
    ) => Promise<{ success: boolean; data?: ProductPrompt; error?: string }>
    addDirectory: (
      directoryData: Omit<Category, 'id' | 'type' | 'order'>
    ) => Promise<{ success: boolean; data?: Category; error?: string }>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI | undefined
  }
}

export {}
