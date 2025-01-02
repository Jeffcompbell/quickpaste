// 基础类型定义
export interface PromptData {
  id: string
  title: string
  content: string
  category: string
  type: 'product'
  author: string
  authorUrl?: string
  isSystem?: boolean
  createTime: number
  updateTime: number
}

export interface DirectoryData {
  id: string
  name: string
  isSystem?: boolean
  createdAt?: string
}

export interface PanelData {
  prompts: PromptData[]
  categories: DirectoryData[]
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// IPC 类型定义
export interface IpcEvent extends Electron.IpcRendererEvent {
  preventDefault: () => void
}

export type IpcCallback<T = unknown> = (event: IpcEvent, ...args: T[]) => void
export type IpcSubscription = () => void
export type IpcHandler<T = unknown> = (...args: T[]) => void

export interface VersionInfo {
  name?: string
  version: string
  electron: string
  chromium: string
  nodeVersion: string
  v8: string
  os: string
}

export interface DeviceInfo {
  deviceId: string
  deviceName: string
  os: string
  ip: string
  mac?: string
  metadata?: {
    appVersion: string
    language: string
    screenResolution: string
  }
}

export interface ActivationResponse {
  message: string
  data: {
    device: {
      deviceId: string
      deviceName: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }
}

// Electron API 类型定义
export interface ElectronAPI {
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
    on: (channel: string, callback: IpcHandler) => IpcSubscription
    send: (channel: string, data?: unknown) => void
    once: (channel: string, callback: IpcHandler) => void
    removeAllListeners: (channel: string) => void
  }
  panel: {
    ready: () => void
    onData: (callback: (data: PanelData) => void) => IpcSubscription
  }
  prompt: {
    add: (
      promptData: Omit<PromptData, 'id' | 'createTime' | 'updateTime'>
    ) => Promise<ApiResponse<PromptData>>
    addDirectory: (
      directoryData: Omit<DirectoryData, 'id' | 'createdAt'>
    ) => Promise<ApiResponse<DirectoryData>>
  }
  app: {
    onShowAboutDialog: (callback: () => void) => IpcSubscription
    getVersionInfo: () => Promise<VersionInfo>
    validateActivationCode: (
      code: string,
      deviceInfo: DeviceInfo
    ) => Promise<ActivationResponse>
    platform: NodeJS.Platform
  }
}
