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

function createTray() {
  // 创建托盘图标
  const icon = join(__dirname, '../resources/tray.png') // 16x16 或 32x32 的图标
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

  // 右键菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏',
      click: () => {
        if (!mainWindow) return
        if (mainWindow.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow.show()
          mainWindow.focus()
        }
      },
    },
    {
      label: '固定窗口',
      type: 'checkbox',
      checked: isAlwaysOnTop,
      click: () => {
        if (!mainWindow) return
        isAlwaysOnTop = !isAlwaysOnTop
        mainWindow.setAlwaysOnTop(isAlwaysOnTop)
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)
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
    frame: false,
    transparent: true,
    alwaysOnTop: isAlwaysOnTop,
    skipTaskbar: false,
    show: false,
    resizable: true,
    minWidth: 300,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
  })

  // 保存窗口状态
  function saveWindowState() {
    if (!mainWindow) return
    const bounds = mainWindow.getBounds()
    const isVisible = mainWindow.isVisible()
    store.set('windowState', { ...bounds, isVisible })
  }

  // 窗口事件监听
  mainWindow.on('close', saveWindowState)
  mainWindow.on('moved', saveWindowState)
  mainWindow.on('resize', saveWindowState)

  // 加载页面
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    // 开发模式下，等待页面加载完成后再显示窗口
    mainWindow.webContents.on('did-finish-load', () => {
      if (!mainWindow) return
      if (windowState.isVisible) {
        mainWindow.show()
      }
    })
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
    if (windowState.isVisible) {
      mainWindow.show()
    }
  }

  // 注册全局快捷键
  globalShortcut.register('CommandOrControl+Shift+V', () => {
    if (!mainWindow) return

    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
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

  // 开发时打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  // 添加点击任务栏图标的事件处理
  app.on('activate', () => {
    if (!mainWindow) return
    if (!mainWindow.isVisible()) {
      const windowState = store.get('windowState')
      if (windowState) {
        const { x, y, width, height } = windowState
        const { width: screenWidth, height: screenHeight } =
          screen.getPrimaryDisplay().workAreaSize
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

  // 修改 dock 点击事件（仅 macOS）
  if (process.platform === 'darwin') {
    app.dock.show() // 显示 dock 图标
    app.on('activate', () => {
      if (!mainWindow) {
        createWindow()
      } else if (!mainWindow.isVisible()) {
        mainWindow.show()
        mainWindow.focus()
      }
    })
  }

  // 设置应用名称
  app.name = 'QuickPaste'

  // 如果是 macOS，设置 dock 图标
  if (process.platform === 'darwin') {
    const dockIcon = join(__dirname, '../resources/icon.png') // 你的图标路径
    app.dock.setIcon(dockIcon)
  }

  if (process.env.NODE_ENV === 'development') {
    app.setName('QuickPaste')
    if (process.platform === 'darwin') {
      const devIcon = join(__dirname, '../resources/icon.png')
      app.dock.setIcon(devIcon)
    }
  }

  // 默认隐藏窗口，通过托盘图标或快捷键显示
  mainWindow.hide()
}

// 在 app.whenReady() 之前添加输入法配置
if (process.platform === 'darwin') {
  // 禁用内置输入法上下文
  app.commandLine.appendSwitch('disable-features', 'IMEInputContextInBrowser')
}

app.whenReady().then(() => {
  createWindow()
  createTray()
})

// 点击其他区域自动隐藏窗口
app.on('browser-window-blur', () => {
  if (mainWindow && !isAlwaysOnTop) {
    // 延迟隐藏窗口，避免与点击事件冲突
    setTimeout(() => {
      if (mainWindow && !mainWindow.isFocused() && !isAlwaysOnTop) {
        mainWindow.hide()
      }
    }, 100)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 注销快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// 禁用硬件加速以避免某些渲染问题
app.disableHardwareAcceleration()

// 添加固定窗口的 IPC 处理
ipcMain.on('window:toggle-pin', () => {
  if (!mainWindow) return
  isAlwaysOnTop = !isAlwaysOnTop
  mainWindow.setAlwaysOnTop(isAlwaysOnTop)
})

// 添加获取窗口固定状态的 IPC 处理
ipcMain.handle('window:get-pin-state', () => {
  return isAlwaysOnTop
})

// 添加 IPC 处理
ipcMain.on('window:show', () => {
  if (!mainWindow) return
  mainWindow.show()
  mainWindow.focus()
  if (isAlwaysOnTop) {
    mainWindow.setAlwaysOnTop(true, 'floating')
  }
})

ipcMain.on('window:hide', () => {
  if (!mainWindow) return
  // 添加延迟以避免输入法问题
  setTimeout(() => {
    if (mainWindow) {
      mainWindow.hide()
    }
  }, 50)
})

// 在应用退出时清理托盘图标
app.on('before-quit', () => {
  if (tray) {
    tray.destroy()
  }
})
