interface IpcRendererEvent {
  preventDefault: () => void
  // 添加其他必要的属性
}

interface StoreData {
  [key: string]: unknown
}

export interface ElectronAPI {
  ipcRenderer: {
    invoke(channel: string, data?: unknown): Promise<unknown>
    on(
      channel: string,
      callback: (event: IpcRendererEvent, ...args: unknown[]) => void
    ): void
    send(channel: string, data?: unknown): void
    removeListener(
      channel: string,
      callback: (event: IpcRendererEvent, ...args: unknown[]) => void
    ): void
  }
  store: {
    get(key: string): Promise<unknown>
    set(key: string, value: unknown): Promise<void>
    // ... other store methods
  }
  clipboard: {
    writeText(text: string): Promise<void>
    readText(): Promise<string>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

export {}
