import { contextBridge, ipcRenderer, clipboard } from 'electron'
import type { ElectronAPI } from './electron-env'

// 在这里定义暴露给渲染进程的 API
const api: ElectronAPI = {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    hide: () => ipcRenderer.send('window:hide'),
    show: () => ipcRenderer.send('window:show'),
    togglePin: () => ipcRenderer.send('window:toggle-pin'),
    getPinState: () => ipcRenderer.invoke('window:get-pin-state'),
  },
  clipboard: {
    writeText: text => clipboard.writeText(text),
    readText: () => clipboard.readText(),
  },
}

// 使用 contextBridge 暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electron', api)
