import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  clipboard,
  screen,
  Menu,
  IpcMainInvokeEvent,
  shell,
  dialog,
} from 'electron'
import { join, resolve } from 'path'
import Store from 'electron-store'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  DirectoryData,
  ApiResponse,
  DeviceInfo,
  ActivationResponse,
} from './types'
import { loadPackageJson } from './utils'
import fetch, { RequestInit } from 'node-fetch'
import { Agent } from 'https'
import { v4 as uuidv4 } from 'uuid'

// 声明全局变量
let mainWindow: BrowserWindow | null = null
let promptPanel: BrowserWindow | null = null
let tray: Tray | null = null
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

// 定义 package.json 的类型
interface PackageJson {
  version: string
  name?: string
  description?: string
  author?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

// 添加自定义错误类型
interface ActivationError extends Error {
  type?: string
  status?: number
  message: string
}

// 添加响应数据类型
interface ActivationResponseData {
  success: boolean
  message: string
  data: {
    activatedAt: string
    expiresAt: string
    device: {
      deviceId: string
      deviceName: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }
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
    let systemPrompts: SystemPrompts
    try {
      const fileContent = readFileSync(systemPromptsPath, 'utf-8')
      systemPrompts = JSON.parse(fileContent)
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
      const fileContent = readFileSync(systemPromptsPath, 'utf-8')
      systemPrompts = JSON.parse(fileContent)
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
  const { workAreaSize } = primaryDisplay
  const x = workAreaSize.width - 400

  promptPanel = new BrowserWindow({
    width: 380,
    height: 600,
    show: false,
    frame: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 10 },
    hasShadow: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    x: x,
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

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    show: false,
    frame: false,
    titleBarStyle: 'customButtonsOnHover',
    trafficLightPosition: { x: 16, y: 10 },
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: preloadPath,
    },
  })

  // 只在开发环境下打开开发者工具
  if (isDevelopment) {
    mainWindow.webContents.openDevTools()
  } else {
    // 生产环境禁用开发者工具
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  // 加载应用
  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
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

// 创建托盘图标
function createTray() {
  const iconPath = isDevelopment
    ? join(__dirname, '../src/assets/tray-mac.png')
    : join(__dirname, '../dist/assets/tray-mac.png')

  tray = new Tray(iconPath)
  tray.setToolTip('ProPaste')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        mainWindow?.show()
      },
    },
    {
      label: '退出',
      click: () => {
        isQuitting = true
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)

  // 点击托盘图标显示主窗口
  tray.on('click', () => {
    mainWindow?.show()
  })
}

// 获取 Git 信息
function getGitInfo() {
  try {
    const commit = execSync('git rev-parse --short HEAD').toString().trim()
    const date = execSync(
      'git log -1 --format=%cd --date=format:"%Y-%m-%d %H:%M:%S"'
    )
      .toString()
      .trim()
    return { commit, date }
  } catch (error) {
    console.error('Failed to get git info:', error)
    return { commit: 'unknown', date: new Date().toLocaleString() }
  }
}

// 设置应用程序关于面板信息
if (isMac) {
  const gitInfo = getGitInfo()
  const versions = process.versions
  const pkgPath = join(__dirname, '../package.json')
  const pkgContent = readFileSync(pkgPath, 'utf-8')
  const pkg = JSON.parse(pkgContent)

  app.setAboutPanelOptions({
    applicationName: 'ProPaste',
    applicationVersion: pkg.version,
    version: `Electron ${versions.electron} (Chromium ${versions.chrome})`,
    copyright: '© 2024 ProPaste',
    credits: `Git commit: ${gitInfo.commit}\nBuild date: ${gitInfo.date}`,
  })
}

// 创建应用菜单
function createApplicationMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'ProPaste',
      submenu: [
        {
          label: '关于 ProPaste',
          role: 'about',
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
      ],
    },
  ]

  console.log('Menu: Creating application menu')
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  console.log('Menu: Application menu created')
}

// 在应用启动时就创建菜单
if (isMac) {
  createApplicationMenu()
}

// 应用程序准备就绪时的处理
app.whenReady().then(() => {
  console.log('App is ready')
  initializeDefaultData()
  createWindow()
  createTray()

  // macOS 特定的 dock 设置
  if (isMac) {
    app.dock.setMenu(Menu.buildFromTemplate([])) // 使用空菜单而不是 null
  }

  // 注册窗口状态相关的 IPC 处理程序
  ipcMain.handle('window:get-maximized-state', () => {
    return mainWindow?.isMaximized() || false
  })

  ipcMain.handle('window:get-pin-state', () => {
    return mainWindow?.isAlwaysOnTop() || false
  })

  // 注册获取版本信息的处理程序
  ipcMain.handle('app:get-version-info', () => {
    const gitInfo = getGitInfo()
    const versions = process.versions
    const pkg = loadPackageJson()

    console.log('Version info:', {
      version: pkg.version,
      commit: gitInfo.commit,
      date: gitInfo.date,
      electron: versions.electron,
    })

    return {
      version: pkg.version,
      commit: gitInfo.commit,
      date: gitInfo.date,
      electron: versions.electron || 'unknown',
      electronBuildId: versions.electron_build_id || 'unknown',
      chromium: versions.chrome || 'unknown',
      nodeVersion: versions.node || 'unknown',
      v8: versions.v8 || 'unknown',
      os: `${process.platform} ${process.getSystemVersion()}`,
    }
  })

  // 注册窗口控制相关的 IPC 处理程序
  ipcMain.on('window:minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.restore()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.on('window:restore', () => {
    mainWindow?.restore()
  })

  ipcMain.on('window:close', () => {
    mainWindow?.close()
  })

  ipcMain.on('window:hide', () => {
    mainWindow?.hide()
  })

  ipcMain.on('window:show', () => {
    mainWindow?.show()
  })

  ipcMain.on('window:toggle-pin', () => {
    const isPinned = mainWindow?.isAlwaysOnTop() || false
    mainWindow?.setAlwaysOnTop(!isPinned)
  })

  ipcMain.on('window:toggle-panel', () => {
    if (promptPanel && !promptPanel.isDestroyed()) {
      if (promptPanel.isVisible()) {
        promptPanel.hide()
      } else {
        promptPanel.show()
      }
    } else {
      createPromptPanel()
    }
  })
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

// 修改加载 system-prompts.json 的部分
function loadSystemPrompts(systemPromptsPath: string): SystemPrompts {
  try {
    const fileContent = readFileSync(systemPromptsPath, 'utf-8')
    const systemPrompts = JSON.parse(fileContent)
    console.log('System prompts loaded successfully:', {
      requirement: systemPrompts.requirement?.length || 0,
      debug: systemPrompts.debug?.length || 0,
      deployment: systemPrompts.deployment?.length || 0,
      summary: systemPrompts.summary?.length || 0,
    })
    return systemPrompts
  } catch (error) {
    console.error('Failed to load system prompts:', error)
    return {
      requirement: [],
      debug: [],
      deployment: [],
      summary: [],
    }
  }
}

// 添加激活码验证处理程序
ipcMain.handle(
  'app:validate-activation-code',
  async (
    _event: IpcMainInvokeEvent,
    code: string,
    deviceInfo: DeviceInfo
  ): Promise<ActivationResponse> => {
    const API_ENDPOINT = 'https://activecode.vercel.app/api/codes/validate'
    const APP_ID = 'app_fEFqY0K9jA'

    // 最大重试次数
    const MAX_RETRIES = 3
    // 基础延迟时间（毫秒）
    const BASE_DELAY = 1000
    // 超时时间（毫秒）
    const TIMEOUT = 30000 // 30 秒

    async function attemptActivation(
      attempt = 1
    ): Promise<ActivationResponseData> {
      try {
        console.log(`Activation attempt ${attempt} of ${MAX_RETRIES}`)

        const requestBody = {
          code,
          deviceId: deviceInfo.deviceId,
          deviceName: deviceInfo.deviceName,
          os: deviceInfo.os,
          ip: deviceInfo.ip,
          productId: 'app_fEFqY0K9jA',
          metadata: {
            appVersion: deviceInfo.metadata?.appVersion || '1.0.0',
            language: deviceInfo.metadata?.language || 'zh-CN',
          },
        }

        console.log('Request details:', {
          url: API_ENDPOINT,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-App-ID': APP_ID,
          },
          body: requestBody,
        })

        const controller = new AbortController()
        const timeout = setTimeout(() => {
          console.log(`Request timeout after ${TIMEOUT}ms`)
          controller.abort()
        }, TIMEOUT)

        try {
          console.log('Sending request with headers:', {
            'Content-Type': 'application/json',
            'X-App-ID': APP_ID,
          })

          const agent = new Agent({
            rejectUnauthorized: false,
            keepAlive: true,
            timeout: TIMEOUT,
          })

          const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-App-ID': APP_ID,
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal as AbortSignal,
            agent,
            timeout: TIMEOUT,
          } as RequestInit)

          console.log('Request sent successfully')
          console.log('Response headers:', response.headers)

          console.log('Response status:', response.status)
          const data = await response.json()
          console.log('Response data:', data)

          if (!response.ok) {
            let errorMessage = '激活失败'
            switch (response.status) {
              case 400:
                if (data.message.includes('过期')) {
                  errorMessage = '激活码已过期'
                } else if (data.message.includes('限制')) {
                  errorMessage = '激活码已达到最大设备数限制'
                } else if (data.message.includes('已激活')) {
                  errorMessage = '此设备已激活'
                }
                break
              case 404:
                errorMessage = '激活码无效'
                break
              case 500:
                errorMessage = '服务器错误，请稍后重试'
                break
            }
            throw new Error(errorMessage)
          }

          return data
        } finally {
          clearTimeout(timeout)
        }
      } catch (error) {
        const err = error as ActivationError
        console.error(`Activation attempt ${attempt} failed:`, err)
        console.error('Error details:', {
          name: err.name,
          message: err.message,
          type: err.type,
          stack: err.stack,
        })

        // 如果是最后一次尝试，或者是非超时错误，直接抛出
        if (
          attempt >= MAX_RETRIES ||
          (err.name !== 'AbortError' && !err.message.includes('ETIMEDOUT'))
        ) {
          throw err
        }

        // 计算延迟时间（指数退避）
        const delay = BASE_DELAY * Math.pow(2, attempt - 1)
        console.log(`Retrying in ${delay}ms...`)

        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, delay))
        return attemptActivation(attempt + 1)
      }
    }

    return attemptActivation()
  }
)
