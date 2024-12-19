import { contextBridge, ipcRenderer } from 'electron'

// 在这里定义暴露给渲染进程的 API
const api = {
  window: {
    minimize: () => {
      console.log('Preload: Sending minimize command')
      ipcRenderer.send('window:minimize')
    },
    maximize: () => {
      console.log('Preload: Sending maximize command')
      ipcRenderer.send('window:maximize')
    },
    restore: () => {
      console.log('Preload: Sending restore command')
      ipcRenderer.send('window:restore')
    },
    close: () => {
      console.log('Preload: Sending close command')
      ipcRenderer.send('window:close')
    },
    hide: () => {
      console.log('Preload: Sending hide command')
      ipcRenderer.send('window:hide')
    },
    show: () => {
      console.log('Preload: Sending show command')
      ipcRenderer.send('window:show')
    },
    togglePin: () => {
      console.log('Preload: Sending toggle-pin command')
      ipcRenderer.send('window:toggle-pin')
    },
    getPinState: () => ipcRenderer.invoke('window:get-pin-state'),
    getMaximizedState: () => ipcRenderer.invoke('window:get-maximized-state'),
  },
}

// 使用 contextBridge 暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electron', api)

// 监听来自主进程的消息
ipcRenderer.on('window:maximized', (_event, isMaximized) => {
  console.log('Preload: Received maximized state:', isMaximized)
  window.postMessage({ type: 'window:maximized', isMaximized }, '*')
})

// 监听来自主进程的固定状态变化
ipcRenderer.on('window:pinned', (_event, isPinned) => {
  console.log('Preload: Received pinned state:', isPinned)
  window.postMessage({ type: 'window:pinned', isPinned }, '*')
})
