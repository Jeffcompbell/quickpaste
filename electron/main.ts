import {
  app,
  BrowserWindow,
  globalShortcut,
  screen,
  ipcMain,
  Tray,
  Menu,
} from 'electron'
import { join } from 'path'
import Store from 'electron-store'

interface WindowState {
  x: number
  y: number
  width: number
  height: number
  isVisible: boolean
}

const store = new Store<{
  windowState: WindowState
}>()

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isAlwaysOnTop = false
const isMac = process.platform === 'darwin'

// 添加一个标志来跟踪应用是否正在退出
let isQuitting = false

// 添加 IPC 事件处理程序
function setupIPCHandlers() {
  ipcMain.on('window:minimize', () => {
    console.log('Main: Received minimize command')
    mainWindow?.minimize()
  })

  ipcMain.on('window:maximize', () => {
    console.log('Main: Received maximize command')
    if (!mainWindow) return

    if (isMac) {
      // macOS 处理方式
      const isFullScreen = mainWindow.isFullScreen()
      if (isFullScreen) {
        mainWindow.setFullScreen(false)
      } else {
        mainWindow.setFullScreen(true)
      }
    } else {
      // Windows 处理方式
      if (mainWindow.isMaximized()) {
        mainWindow.restore()
      } else {
        mainWindow.maximize()
      }
    }
  })

  ipcMain.on('window:restore', () => {
    console.log('Main: Received restore command')
    if (!mainWindow) return

    if (isMac) {
      mainWindow.setFullScreen(false)
    } else {
      mainWindow.restore()
    }
  })

  ipcMain.on('window:close', () => {
    console.log('Main: Received close command')
    if (isMac) {
      app.hide()
    } else {
      mainWindow?.close()
    }
  })

  ipcMain.on('window:hide', () => {
    console.log('Main: Received hide command')
    mainWindow?.hide()
  })

  ipcMain.on('window:show', () => {
    console.log('Main: Received show command')
    if (!mainWindow) return
    mainWindow.show()
    mainWindow.focus()

    if (isAlwaysOnTop) {
      if (isMac) {
        mainWindow.setAlwaysOnTop(true, 'status', 1)
        mainWindow.setVisibleOnAllWorkspaces(true, {
          visibleOnFullScreen: true,
          skipTransformProcessType: true,
        })
      } else {
        mainWindow.setAlwaysOnTop(true, 'status', 1)
      }
    }
  })

  ipcMain.on('window:toggle-pin', () => {
    console.log('Main: Received toggle-pin command')
    if (!mainWindow) return
    isAlwaysOnTop = !isAlwaysOnTop

    if (isAlwaysOnTop) {
      if (isMac) {
        mainWindow.setAlwaysOnTop(true, 'status', 1)
        mainWindow.setVisibleOnAllWorkspaces(true, {
          visibleOnFullScreen: true,
          skipTransformProcessType: true,
        })
        mainWindow.setWindowButtonVisibility(true)
      } else {
        mainWindow.setAlwaysOnTop(true)
      }
    } else {
      mainWindow.setAlwaysOnTop(false)
      if (isMac) {
        mainWindow.setVisibleOnAllWorkspaces(false)
      }
    }
    mainWindow.webContents.send('window:pinned', isAlwaysOnTop)
  })

  ipcMain.handle('window:get-pin-state', () => {
    return isAlwaysOnTop
  })

  ipcMain.handle('window:get-maximized-state', () => {
    if (!mainWindow) return false
    return isMac ? mainWindow.isFullScreen() : mainWindow.isMaximized()
  })
}

function createTray() {
  // 创建托盘图标 - 根据平台选择合适的图标尺寸
  const icon = isMac
    ? join(__dirname, '../resources/tray-mac.png') // 16x16 for macOS
    : join(__dirname, '../resources/tray.png') // 32x32 for Windows

  tray = new Tray(icon)

  // 设置托盘图标的提示文本
  tray.setToolTip('QuickPaste')

  // 点击托盘图标时显示/隐藏主窗口
  tray.on('click', () => {
    if (!mainWindow) return

    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      const { width: screenWidth, height: screenHeight } =
        screen.getPrimaryDisplay().workAreaSize
      const windowState = store.get('windowState')
      if (windowState) {
        const { x, y, width, height } = windowState
        const newX = Math.min(Math.max(0, x), screenWidth - width)
        const newY = Math.min(Math.max(0, y), screenHeight - height)
        mainWindow.setBounds({ x: newX, y: newY, width, height })
      }
      mainWindow.show()
      mainWindow.focus()
      if (isAlwaysOnTop) {
        mainWindow.setAlwaysOnTop(true, 'floating')
      }
    }
  })

  // 禁用右键菜单
  tray.setContextMenu(null)
}

function createWindow() {
  const defaultState: WindowState = {
    width: 400,
    height: 500,
    x: 0,
    y: 0,
    isVisible: false,
  }

  // 获取上次窗口状态
  let windowState = store.get('windowState', defaultState)

  // 确保窗口位置在可视区域内
  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize
  const { x, y, width, height } = windowState

  // 检查窗口是否完全在屏幕外
  if (x < 0 || x > screenWidth || y < 0 || y > screenHeight) {
    windowState = {
      ...windowState,
      x: Math.round(screenWidth / 2 - width / 2),
      y: Math.round(screenHeight / 2 - height / 2),
    }
  }

  mainWindow = new BrowserWindow({
    ...windowState,
    frame: !isMac,
    transparent: true,
    alwaysOnTop: isAlwaysOnTop,
    skipTaskbar: false,
    show: false,
    resizable: true,
    minWidth: 300,
    minHeight: 400,
    maximizable: true,
    fullscreenable: true,
    hasShadow: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    ...(isMac
      ? {
          titleBarStyle: 'hiddenInset',
          trafficLightPosition: { x: 20, y: 18 },
          vibrancy: 'window',
          visualEffectState: 'active',
        }
      : {}),
  })

  // 监听窗口状态变化
  if (isMac) {
    mainWindow.on('enter-full-screen', () => {
      console.log('Main: Window entered full screen')
      mainWindow?.webContents.send('window:maximized', true)
    })

    mainWindow.on('leave-full-screen', () => {
      console.log('Main: Window left full screen')
      mainWindow?.webContents.send('window:maximized', false)
    })

    // macOS 下点击关闭按钮时隐藏窗口而不是关闭
    mainWindow.on('close', event => {
      if (!isQuitting) {
        event.preventDefault()
        mainWindow?.hide()
        return false
      }
      return true
    })
  } else {
    mainWindow.on('maximize', () => {
      console.log('Main: Window maximized')
      mainWindow?.webContents.send('window:maximized', true)
    })

    mainWindow.on('unmaximize', () => {
      console.log('Main: Window unmaximized')
      mainWindow?.webContents.send('window:maximized', false)
    })
  }

  mainWindow.on('minimize', () => {
    console.log('Main: Window minimized')
  })

  // 加载页面
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  // 开发时打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  // 保存窗口状态
  function saveWindowState() {
    if (!mainWindow) return
    const bounds = mainWindow.getBounds()
    const isVisible = mainWindow.isVisible()
    store.set('windowState', { ...bounds, isVisible })
  }

  mainWindow.on('close', saveWindowState)
  mainWindow.on('moved', saveWindowState)
  mainWindow.on('resize', saveWindowState)

  // 显示窗口
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  return mainWindow
}

// 在 app.whenReady() 之前添加输入法配置
if (isMac) {
  app.commandLine.appendSwitch('disable-features', 'IMEInputContextInBrowser')
}

app.whenReady().then(() => {
  setupIPCHandlers()
  createWindow()
  createTray()

  // 处理 macOS 下点击 dock 图标的行为
  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    } else {
      mainWindow.show()
      mainWindow.focus()
      if (isMac) {
        app.dock.show() // 显示 dock 图标
      }
    }
  })
})

// 在应用退出前设置退出标志
app.on('before-quit', () => {
  isQuitting = true
})

// 点击其他区域自动隐藏窗口
app.on('browser-window-blur', () => {
  if (mainWindow && !isAlwaysOnTop) {
    setTimeout(() => {
      if (mainWindow && !mainWindow.isFocused() && !isAlwaysOnTop) {
        mainWindow.hide()
      }
    }, 100)
  }
})

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

// 注销快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// 禁用硬件加速以避免某些渲染问题
app.disableHardwareAcceleration()

// 在应用退出时清理托盘图标
app.on('before-quit', () => {
  if (tray) {
    tray.destroy()
  }
})

// 处理 dock 右键菜单中的退出选项
if (isMac) {
  app.dock.setMenu(
    Menu.buildFromTemplate([
      {
        label: '退出',
        click: () => {
          isQuitting = true
          app.quit()
        },
      },
    ])
  )
}
