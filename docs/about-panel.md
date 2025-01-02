# macOS 应用菜单"关于"面板实现

## 问题描述

在 macOS 应用中，点击应用菜单（左上角）中的"关于 ProPaste"选项时，需要显示一个原生的关于面板，展示应用的版本信息等内容。

## 解决方案

### 1. 设置应用菜单

在 `electron/main.ts` 中，我们需要在应用启动时就创建菜单，而不是等到 `app.whenReady()` 之后：

```typescript
// 创建应用菜单
function createApplicationMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'ProPaste',
      submenu: [
        {
          label: '关于 ProPaste',
          role: 'about', // 使用系统原生的 about role
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
    // ... 其他菜单项
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// 在应用启动时就创建菜单
if (isMac) {
  createApplicationMenu()
}
```

### 2. 设置关于面板信息

同样在应用启动时，我们需要设置关于面板的内容：

```typescript
// 获取 Git 信息
function getGitInfo() {
  try {
    const { execSync } = require('child_process')
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
  const pkg = require(join(__dirname, '../package.json'))

  app.setAboutPanelOptions({
    applicationName: 'ProPaste',
    applicationVersion: pkg.version,
    version: `Electron ${versions.electron} (Chromium ${versions.chrome})`,
    copyright: '© 2024 ProPaste',
    credits: `Git commit: ${gitInfo.commit}\nBuild date: ${gitInfo.date}`,
  })
}
```

## 关键点

1. 使用 `role: 'about'` 而不是自定义的 `click` 处理程序
2. 在应用启动时就设置菜单和关于面板信息，不要等到 `app.whenReady()`
3. 使用 `app.setAboutPanelOptions()` 设置关于面板的内容
4. 从 `package.json` 中读取版本号
5. 使用 Git 命令获取提交信息和日期

## 显示内容

关于面板会显示以下信息：

- 应用名称：ProPaste
- 应用版本号（从 package.json 中读取）
- Electron 和 Chromium 版本
- Git 提交信息和构建日期
- 版权信息

## 参考文档

- [Electron Menu API](https://www.electronjs.org/zh/docs/latest/api/menu)
- [Electron app.setAboutPanelOptions](https://www.electronjs.org/zh/docs/latest/api/app#appsetaboutpaneloptionsoptions)
