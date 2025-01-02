// /**
//  * Electron 子窗口实现指南
//  *
//  * 本文档记录了 Electron 子窗口的实现过程、常见问题和解决方案
//  */

// /**
//  * 1. 数据流程
//  *
//  * Panel Window -> Main Process -> Main Window -> Main Process -> Panel Window
//  *
//  * panel:ready -> get-prompts -> prompts-data -> prompts-data
//  */

// /**
//  * 2. 关键代码实现
//  */

// // 2.1 Main Process 中创建子窗口
// interface PanelWindowConfig {
//   width: number
//   height: number
//   webPreferences: {
//     nodeIntegration: boolean
//     contextIsolation: boolean
//     preload: string
//   }
// }

// function createPanelWindow() {
//   const config: PanelWindowConfig = {
//     width: 800,
//     height: 600,
//     webPreferences: {
//       nodeIntegration: false,
//       contextIsolation: true,
//       preload: join(__dirname, 'preload.js'),
//     },
//   }

//   const panelWindow = new BrowserWindow(config)

//   // 加载面板页面
//   if (process.env.VITE_DEV_SERVER_URL) {
//     panelWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}/panel.html`)
//   } else {
//     panelWindow.loadFile(join(process.env.DIST, 'panel.html'))
//   }

//   return panelWindow
// }

// // 2.2 Main Process 中的事件处理
// function setupPanelHandlers() {
//   // 监听面板就绪事件
//   ipcMain.on('panel:ready', event => {
//     if (mainWindow && !mainWindow.isDestroyed()) {
//       mainWindow.webContents.send('get-prompts')

//       ipcMain.once('prompts-data', (_, data) => {
//         if (panelWindow && !panelWindow.isDestroyed()) {
//           panelWindow.webContents.send('prompts-data', data)
//         }
//       })
//     }
//   })
// }

// // 2.3 Preload Script 中的 API 定义
// interface ElectronAPI {
//   on: (
//     channel: string,
//     callback: (data: unknown) => void
//   ) => (() => void) | undefined
//   send: (channel: string, data?: unknown) => void
// }

// const api: ElectronAPI = {
//   on: (channel, callback) => {
//     const validChannels = ['prompts-data', 'get-prompts']
//     if (validChannels.includes(channel)) {
//       const subscription = (_: unknown, data: unknown) => callback(data)
//       ipcRenderer.on(channel, subscription)
//       return () => ipcRenderer.removeListener(channel, subscription)
//     }
//   },
//   send: (channel, data) => {
//     const validChannels = ['panel:ready', 'prompts-data']
//     if (validChannels.includes(channel)) {
//       ipcRenderer.send(channel, data)
//     }
//   },
// }

// /**
//  * 3. 常见问题和解决方案
//  */

// interface CommonIssue {
//   problem: string
//   cause: string
//   solution: string
// }

// const commonIssues: CommonIssue[] = [
//   {
//     problem: '子窗口白屏',
//     cause: 'preload 脚本未正确加载或 API 未正确暴露',
//     solution: `
//       1. 检查 preload 脚本路径是否正确
//       2. 确保 contextIsolation 已启用
//       3. 验证 API 是否正确暴露到 window 对象
//       4. 添加详细的日志输出跟踪问题
//     `,
//   },
//   {
//     problem: '数据未正确显示',
//     cause: '数据流通信链断开或数据格式不匹配',
//     solution: `
//       1. 检查所有事件监听器是否正确设置
//       2. 验证数据格式和类型是否匹配
//       3. 确保窗口存在且未被销毁
//       4. 添加数据流日志跟踪
//     `,
//   },
//   {
//     problem: '内存泄漏',
//     cause: '事件监听器未正确清理',
//     solution: `
//       1. 使用 cleanup 函数清理事件监听器
//       2. 使用 once 监听一次性事件
//       3. 在窗口关闭时移除所有监听器
//       4. 监控内存使用情况
//     `,
//   },
//   {
//     problem: 'CSP 错误',
//     cause: '内容安全策略配置不正确',
//     solution: `
//       1. 正确配置 CSP meta 标签
//       2. 允许必要的脚本和样式源
//       3. 在开发模式下适当放宽限制
//       4. 使用 webRequest 动态设置 CSP
//     `,
//   },
// ]

// /**
//  * 4. 调试技巧
//  */

// interface DebugTip {
//   category: string
//   tips: string[]
// }

// const debugTips: DebugTip[] = [
//   {
//     category: '日志输出',
//     tips: [
//       '在关键节点添加详细的日志输出',
//       '使用不同的日志级别（info, warn, error）',
//       '记录数据流的完整过程',
//       '使用 console.trace() 跟踪调用栈',
//     ],
//   },
//   {
//     category: '开发者工具',
//     tips: [
//       '使用 openDevTools() 打开开发者工具',
//       '监控 Network 面板检查请求',
//       '使用 Console 面板查看日志',
//       '使用 Elements 面板检查 DOM',
//     ],
//   },
//   {
//     category: '错误处理',
//     tips: [
//       '实现全局错误处理器',
//       '捕获并记录未处理的 Promise 异常',
//       '添加详细的错误信息',
//       '实现错误恢复机制',
//     ],
//   },
// ]

// /**
//  * 5. 最佳实践
//  */

// interface BestPractice {
//   title: string
//   description: string
//   example: string
// }

// const bestPractices: BestPractice[] = [
//   {
//     title: '类型安全',
//     description: '使用 TypeScript 确保类型安全',
//     example: `
//       interface PanelData {
//         prompts: Prompt[]
//         directories: Directory[]
//       }

//       function validateData(data: unknown): data is PanelData {
//         return (
//           typeof data === 'object' &&
//           data !== null &&
//           'prompts' in data &&
//           'directories' in data
//         )
//       }
//     `,
//   },
//   {
//     title: '事件管理',
//     description: '集中管理事件通道和监听器',
//     example: `
//       const CHANNELS = {
//         PANEL_READY: 'panel:ready',
//         GET_PROMPTS: 'get-prompts',
//         PROMPTS_DATA: 'prompts-data'
//       } as const
//     `,
//   },
//   {
//     title: '错误处理',
//     description: '实现完整的错误处理机制',
//     example: `
//       try {
//         const data = await getData()
//         if (!validateData(data)) {
//           throw new Error('Invalid data format')
//         }
//         processData(data)
//       } catch (error) {
//         console.error('Failed to process data:', error)
//         showErrorMessage(error)
//       }
//     `,
//   },
// ]

// export {
//   type CommonIssue,
//   type DebugTip,
//   type BestPractice,
//   commonIssues,
//   debugTips,
//   bestPractices,
// }
