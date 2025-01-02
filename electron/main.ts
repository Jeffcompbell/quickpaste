import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  clipboard,
  screen,
  Menu,
  IpcMainInvokeEvent,
} from 'electron'
import { join, resolve } from 'path'
import Store from 'electron-store'
import { autoUpdater } from 'electron-updater'

// 声明全局变量
let mainWindow: BrowserWindow | null = null
let promptPanel: BrowserWindow | null = null
const tray: Tray | null = null
let isQuitting = false
const isMac = process.platform === 'darwin'

// 初始化 Store
const store = new Store()

// 判断是否是开发模式
const isDevelopment = process.env.NODE_ENV !== 'production'
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

// 定义存储数据的类型
interface Prompt {
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

interface Category {
  id: string
  name: string
  isSystem?: boolean
  createdAt?: string
}

interface SystemPrompt {
  id: string
  title: string
  content: string
  category?: string
  author?: string
  authorUrl?: string
}

interface SystemPrompts {
  requirement?: SystemPrompt[]
  debug?: SystemPrompt[]
  deployment?: SystemPrompt[]
  summary?: SystemPrompt[]
}

// 获取正确的 preload 脚本路径
function getPreloadPath() {
  // 在开发和生产环境下都使用编译后的 js 文件
  return join(__dirname, 'preload.js')
}

// 初始化默认数据
function initializeDefaultData() {
  try {
    // 从 system-prompts.json 加载系统预设提示词
    const systemPromptsPath = isDevelopment
      ? join(__dirname, '../src/config/system-prompts.json')
      : join(__dirname, '../dist/config/system-prompts.json')

    console.log('Loading system prompts from:', systemPromptsPath)
    let systemPrompts
    try {
      systemPrompts = require(systemPromptsPath)
      console.log('System prompts loaded successfully:', {
        requirement: systemPrompts.requirement?.length || 0,
        debug: systemPrompts.debug?.length || 0,
        deployment: systemPrompts.deployment?.length || 0,
        summary: systemPrompts.summary?.length || 0,
      })
    } catch (error) {
      console.error('Failed to load system prompts:', error)
      systemPrompts = {
        requirement: [],
        debug: [],
        deployment: [],
        summary: [],
      }
    }

    // 获取现有数据
    const existingPrompts = (store.get('prompts') || []) as Prompt[]
    const existingCategories = (store.get('categories') || []) as Category[]
    console.log('Existing data:', {
      promptsCount: existingPrompts.length,
      categoriesCount: existingCategories.length,
    })

    // 处理系统提示词
    const processPrompt = (prompt: SystemPrompt, category: string): Prompt => ({
      ...prompt,
      category,
      type: 'product',
      author: 'System',
      createTime: Date.now(),
      updateTime: Date.now(),
      isSystem: true,
    })

    // 只在没有数据时初始化
    if (existingPrompts.length === 0) {
      // 合并所有分类的系统提示词
      const defaultPrompts = [
        ...(systemPrompts.requirement || []).map((p: SystemPrompt) =>
          processPrompt(p, 'requirement')
        ),
        ...(systemPrompts.debug || []).map((p: SystemPrompt) =>
          processPrompt(p, 'debug')
        ),
        ...(systemPrompts.deployment || []).map((p: SystemPrompt) =>
          processPrompt(p, 'deployment')
        ),
        ...(systemPrompts.summary || []).map((p: SystemPrompt) =>
          processPrompt(p, 'summary')
        ),
      ]

      console.log('Setting default prompts:', defaultPrompts.length)
      store.set('prompts', defaultPrompts)
    } else {
      console.log('Using existing prompts:', existingPrompts.length)
    }

    if (existingCategories.length === 0) {
      const defaultCategories = [
        { id: 'requirement', name: '需求编写', isSystem: true },
        { id: 'debug', name: 'Bug修复', isSystem: true },
        { id: 'deployment', name: 'Git部署', isSystem: true },
        { id: 'summary', name: '总结规范', isSystem: true },
      ]
      console.log('Setting default categories:', defaultCategories.length)
      store.set('categories', defaultCategories)
    } else {
      console.log('Using existing categories:', existingCategories.length)
    }

    // 验证数据是否正确保存
    const savedPrompts = store.get('prompts') as Prompt[] | undefined
    const savedCategories = store.get('categories') as Category[] | undefined
    console.log('Verification - Saved data:', {
      promptsCount: savedPrompts?.length || 0,
      categoriesCount: savedCategories?.length || 0,
    })
  } catch (error) {
    console.error('Failed to initialize data:', error)
  }
}

// 处理面板就绪事件
ipcMain.on('panel:ready', () => {
  console.log('Panel is ready, sending data')

  try {
    // 从 Store 中获取数据
    const prompts = (store.get('prompts') as Prompt[]) || []
    const categories = (store.get('categories') as Category[]) || []

    // 从 system-prompts.json 加载系统预设提示词
    const systemPromptsPath = isDevelopment
      ? join(__dirname, '../src/config/system-prompts.json')
      : join(__dirname, '../dist/config/system-prompts.json')

    let systemPrompts: SystemPrompts = {
      requirement: [],
      debug: [],
      deployment: [],
      summary: [],
    }

    try {
      systemPrompts = require(systemPromptsPath)
      console.log('System prompts loaded successfully:', {
        requirement: systemPrompts.requirement?.length || 0,
        debug: systemPrompts.debug?.length || 0,
        deployment: systemPrompts.deployment?.length || 0,
        summary: systemPrompts.summary?.length || 0,
      })
    } catch (error) {
      console.error('Failed to load system prompts:', error)
    }

    // 处理系统提示词
    const processPrompt = (prompt: SystemPrompt, category: string): Prompt => ({
      ...prompt,
      category,
      type: 'product',
      author: 'System',
      createTime: Date.now(),
      updateTime: Date.now(),
      isSystem: true,
    })

    // 合并系统提示词
    const systemPromptsList = [
      ...(systemPrompts.requirement || []).map(p =>
        processPrompt(p, 'requirement')
      ),
      ...(systemPrompts.debug || []).map(p => processPrompt(p, 'debug')),
      ...(systemPrompts.deployment || []).map(p =>
        processPrompt(p, 'deployment')
      ),
      ...(systemPrompts.summary || []).map(p => processPrompt(p, 'summary')),
    ]

    // 合并系统提示词和用户提示词
    const allPrompts = [...systemPromptsList, ...prompts]

    console.log('Sending prompts data:', {
      systemPromptsCount: systemPromptsList.length,
      userPromptsCount: prompts.length,
      totalPromptsCount: allPrompts.length,
      categoriesCount: categories.length,
    })

    // 发送数据到面板
    if (promptPanel && !promptPanel.isDestroyed()) {
      promptPanel.webContents.send('prompts-data', {
        prompts: allPrompts,
        categories: categories.filter(cat => !cat.isSystem), // 只发送非系统分类
      })
    } else {
      console.error('Panel window is not available')
    }
  } catch (error) {
    console.error('Error sending prompts data:', error)
  }
})

function createPromptPanel() {
  console.log('Creating prompt panel window')
  const preloadPath = getPreloadPath()
  console.log('Using preload path:', preloadPath)

  // 如果已存在且未销毁，则返回现有窗口
  if (promptPanel && !promptPanel.isDestroyed()) {
    console.log('Using existing panel window')
    return promptPanel
  }

  // 获取主屏幕尺寸
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width } = primaryDisplay.workAreaSize

  promptPanel = new BrowserWindow({
    width: 380,
    height: 600,
    show: false,
    frame: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    hasShadow: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    x: width - 400,
    y: 100,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: preloadPath,
      devTools: true,
    },
    type: isMac ? 'panel' : 'toolbar',
    alwaysOnTop: true,
    focusable: true,
  })

  // 加载面板页面
  if (VITE_DEV_SERVER_URL) {
    console.log('Loading panel from dev server:', VITE_DEV_SERVER_URL)
    promptPanel.loadURL(
      `${VITE_DEV_SERVER_URL}src/app/prompt-panel/prompt-panel.html`
    )
  } else {
    console.log('Loading panel from production build')
    promptPanel.loadFile(
      resolve(__dirname, '../dist/src/app/prompt-panel/prompt-panel.html')
    )
  }

  // 开发时自动打开开发者工具
  if (isDevelopment) {
    promptPanel.webContents.openDevTools({ mode: 'detach' })
  }

  // 监听窗口准备就绪事件
  promptPanel.once('ready-to-show', () => {
    console.log('Panel window ready to show')
    if (promptPanel) {
      promptPanel.show()
    }
  })

  return promptPanel
}

// Handle toggle panel command
ipcMain.on('window:toggle-panel', () => {
  console.log('Received window:toggle-panel command')

  try {
    if (promptPanel && !promptPanel.isDestroyed()) {
      console.log('Panel exists, current visibility:', promptPanel.isVisible())
      if (promptPanel.isVisible()) {
        promptPanel.hide()
        console.log('Panel hidden')
      } else {
        promptPanel.show()
        promptPanel.focus() // 确保窗口获得焦点
        console.log('Panel shown')
      }
    } else {
      console.log('Creating new panel')
      const panel = createPromptPanel()
      if (panel) {
        panel.show()
        panel.focus() // 确保窗口获得焦点
        console.log('New panel created and shown')
      }
    }
  } catch (error) {
    console.error('Error handling panel toggle:', error)
  }
})

// 处理窗口显示/隐藏命令
ipcMain.on('window:show', () => {
  console.log('Received window:show command')
  mainWindow?.show()
  if (mainWindow?.isMinimized()) {
    mainWindow.restore()
  }
})

ipcMain.on('window:hide', () => {
  console.log('Received window:hide command')
  mainWindow?.hide()
})

ipcMain.on('window:minimize', () => {
  console.log('Received window:minimize command')
  mainWindow?.minimize()
})

// 处理 dock 点击事件
app.on('activate', () => {
  console.log('App activated via dock click')
  if (mainWindow === null) {
    console.log('Main window is null, creating new window')
    createWindow()
  } else {
    console.log('Showing existing main window')
    mainWindow.show()
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
  }
})

// 创建主窗口
function createWindow() {
  const preloadPath = getPreloadPath()
  console.log('Main window using preload path:', preloadPath)

  // 获取主屏幕尺寸
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  mainWindow = new BrowserWindow({
    width: Math.min(1440, width * 0.8),
    height: Math.min(900, height * 0.8),
    minWidth: 800,
    minHeight: 600,
    show: false,
    frame: false,
    titleBarStyle: 'customButtonsOnHover',
    trafficLightPosition: { x: 20, y: 16 },
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: preloadPath,
    },
  })

  // 获取正确的主窗口 HTML 路径
  if (isDevelopment && VITE_DEV_SERVER_URL) {
    console.log('Loading from dev server:', VITE_DEV_SERVER_URL)
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    const mainPath = join(__dirname, '../dist/index.html')
    console.log('Loading from file:', mainPath)
    mainWindow.loadFile(mainPath)
  }

  // 在开发模式下打开开发者工具
  if (isDevelopment) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  mainWindow.once('ready-to-show', () => {
    console.log('Main window ready to show')
    mainWindow?.show()
  })

  mainWindow.on('close', event => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })
}

// 应用程序准备就绪时的处理
app.whenReady().then(() => {
  console.log('App is ready')
  initializeDefaultData()
  createWindow()

  // macOS 特定的 dock 设置
  if (isMac) {
    app.dock.setMenu(Menu.buildFromTemplate([])) // 使用空菜单而不是 null
  }
})

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

// 处理应用程序退出
app.on('before-quit', () => {
  console.log('App is quitting')
  isQuitting = true
})

// 添加提示词
ipcMain.handle(
  'add-prompt',
  async (
    event: IpcMainInvokeEvent,
    promptData: Omit<Prompt, 'id' | 'createTime' | 'updateTime'>
  ) => {
    try {
      const prompts = (store.get('prompts') || []) as Prompt[]
      const newPrompt: Prompt = {
        id: Date.now().toString(),
        ...promptData,
        createTime: Date.now(),
        updateTime: Date.now(),
      }

      store.set('prompts', [...prompts, newPrompt])

      // 更新面板数据
      promptPanel?.webContents.send('prompts-data', {
        prompts: store.get('prompts') || [],
        categories: store.get('categories') || [],
      })

      return { success: true, prompt: newPrompt }
    } catch (error) {
      console.error('Failed to add prompt:', error)
      return { success: false, error: 'Failed to add prompt' }
    }
  }
)

// 添加分类
ipcMain.handle(
  'add-directory',
  async (
    event: IpcMainInvokeEvent,
    directoryData: Omit<Category, 'id' | 'createdAt'>
  ) => {
    try {
      const categories = (store.get('categories') || []) as Category[]
      const newCategory: Category = {
        id: Date.now().toString(),
        ...directoryData,
        createdAt: new Date().toISOString(),
      }

      store.set('categories', [...categories, newCategory])

      // 更新面板数据
      promptPanel?.webContents.send('prompts-data', {
        prompts: store.get('prompts') || [],
        categories: store.get('categories') || [],
      })

      return { success: true, category: newCategory }
    } catch (error) {
      console.error('Failed to add category:', error)
      return { success: false, error: 'Failed to add category' }
    }
  }
)

// 添加剪贴板处理程序
ipcMain.handle(
  'clipboard:write-text',
  async (_event: IpcMainInvokeEvent, text: string) => {
    try {
      clipboard.writeText(text)
      return true
    } catch (error) {
      console.error('Failed to write to clipboard:', error)
      throw error
    }
  }
)

ipcMain.handle('clipboard:read-text', async () => {
  try {
    return clipboard.readText()
  } catch (error) {
    console.error('Failed to read from clipboard:', error)
    throw error
  }
})
