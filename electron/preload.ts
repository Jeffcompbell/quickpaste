import { contextBridge, ipcRenderer } from 'electron'
import type {
  PromptData,
  DirectoryData,
  PanelData,
  IpcCallback,
  IpcSubscription,
  IpcHandler,
  ElectronAPI,
  VersionInfo,
} from './types'

// 定义 API
const api: ElectronAPI = {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    restore: () => ipcRenderer.send('window:restore'),
    close: () => ipcRenderer.send('window:close'),
    hide: () => ipcRenderer.send('window:hide'),
    show: () => ipcRenderer.send('window:show'),
    togglePin: () => ipcRenderer.send('window:toggle-pin'),
    togglePanel: () => {
      try {
        ipcRenderer.send('window:toggle-panel')
        console.log('Panel toggle command sent')
      } catch (error) {
        console.error('Error sending toggle panel command:', error)
      }
    },
    getPinState: () => ipcRenderer.invoke('window:get-pin-state'),
    getMaximizedState: () => ipcRenderer.invoke('window:get-maximized-state'),
  },
  clipboard: {
    writeText: (text: string) =>
      ipcRenderer.invoke('clipboard:write-text', text),
    readText: () => ipcRenderer.invoke('clipboard:read-text'),
  },
  ipcRenderer: {
    on: (channel: string, callback: IpcHandler): IpcSubscription => {
      console.log('Preload: Setting up listener for channel:', channel)
      const subscription: IpcCallback = (_, ...args) => callback(...args)
      ipcRenderer.on(channel, subscription)
      return () => {
        console.log('Preload: Removing listener for channel:', channel)
        ipcRenderer.removeListener(channel, subscription)
      }
    },
    send: (channel: string, data?: unknown) => {
      console.log('Preload: Sending message on channel:', channel, data)
      ipcRenderer.send(channel, data)
    },
    once: (channel: string, callback: IpcHandler) => {
      console.log('Preload: Setting up one-time listener for channel:', channel)
      const subscription: IpcCallback = (_, ...args) => callback(...args)
      ipcRenderer.once(channel, subscription)
    },
    removeAllListeners: (channel: string) => {
      console.log('Preload: Removing all listeners for channel:', channel)
      ipcRenderer.removeAllListeners(channel)
    },
  },
  panel: {
    ready: () => {
      console.log('Preload: Sending panel:ready signal')
      ipcRenderer.send('panel:ready')
    },
    onData: (callback: (data: PanelData) => void): IpcSubscription => {
      console.log('Preload: Setting up prompts-data listener')
      const subscription: IpcCallback<PanelData> = (_, data) => {
        console.log('Preload: Received prompts-data:', data)
        callback(data)
      }
      ipcRenderer.on('prompts-data', subscription)
      return () => {
        console.log('Preload: Removing prompts-data listener')
        ipcRenderer.removeListener('prompts-data', subscription)
      }
    },
  },
  prompt: {
    add: (promptData: Omit<PromptData, 'id' | 'createTime' | 'updateTime'>) =>
      ipcRenderer.invoke('add-prompt', promptData),
    addDirectory: (directoryData: Omit<DirectoryData, 'id' | 'createdAt'>) =>
      ipcRenderer.invoke('add-directory', directoryData),
  },
  app: {
    onShowAboutDialog: (callback: () => void): IpcSubscription => {
      console.log('Preload: Setting up show-about-dialog listener')
      const subscription: IpcCallback = event => {
        console.log('Preload: Received show-about-dialog event')
        callback()
      }
      ipcRenderer.on('show-about-dialog', subscription)
      return () => {
        console.log('Preload: Removing show-about-dialog listener')
        ipcRenderer.removeListener('show-about-dialog', subscription)
      }
    },
    getVersionInfo: async () => {
      console.log('Preload: Getting version info...')
      try {
        const info = await ipcRenderer.invoke('app:get-version-info')
        console.log('Preload: Received version info:', info)
        return info
      } catch (error) {
        console.error('Preload: Failed to get version info:', error)
        throw error
      }
    },
  },
}

// 监听ensure-panel-ready事件
ipcRenderer.on('ensure-panel-ready', () => {
  console.log('Preload: Received ensure-panel-ready signal')
  ipcRenderer.send('panel:ready')
})

// 只在 window.electron 未定义时暴露 API
if (!window.electron) {
  contextBridge.exposeInMainWorld('electron', api)
  console.log('=== Electron API exposed successfully ===')
}
