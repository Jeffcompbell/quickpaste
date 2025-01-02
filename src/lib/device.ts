// 生成设备ID
export function generateDeviceId(): string {
  // 使用一些设备特征生成唯一ID
  const platform = window.navigator.platform
  const userAgent = window.navigator.userAgent
  const language = window.navigator.language
  const screenResolution = `${window.screen.width}x${window.screen.height}`
  const timestamp = Date.now()

  // 将这些特征组合并生成哈希
  const str = `${platform}-${userAgent}-${language}-${screenResolution}-${timestamp}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `DEVICE-${Math.abs(hash).toString(16).toUpperCase()}`
}

// 获取操作系统版本
function getOSVersion(): string {
  const userAgent = window.navigator.userAgent
  const platform = window.navigator.platform

  if (platform.startsWith('Mac')) {
    const match = userAgent.match(/Mac OS X ([0-9_]+)/)
    return match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS'
  }

  if (platform.startsWith('Win')) {
    const match = userAgent.match(/Windows NT ([0-9.]+)/)
    return match ? `Windows ${match[1]}` : 'Windows'
  }

  return platform
}

// 获取设备信息
export async function getDeviceInfo() {
  const deviceId = generateDeviceId()
  const platform = window.navigator.platform
  const osVersion = getOSVersion()

  return {
    deviceId,
    deviceName: `${platform} Device`,
    os: osVersion,
    ip: '127.0.0.1', // 实际应用中可能需要通过其他方式获取
    mac: '', // 可选字段
    metadata: {
      appVersion: '1.0.0',
      language: window.navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    },
  }
}
