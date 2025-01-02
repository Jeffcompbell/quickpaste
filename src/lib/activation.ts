import { getDeviceInfo } from './device'
import { ActivationResponse } from '../../electron/types'

export class ActivationError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ActivationError'
  }
}

export async function validateActivationCode(
  code: string
): Promise<ActivationResponse> {
  console.log('Starting activation process with code:', code)

  const deviceInfo = await getDeviceInfo()
  console.log('Got device info:', deviceInfo)

  const API_ENDPOINT = 'https://activecode.vercel.app/api/codes/validate'
  const APP_ID = 'app_fEFqY0K9jA'

  const requestBody = {
    code,
    deviceId: deviceInfo.deviceId,
    deviceName: deviceInfo.deviceName,
    os: deviceInfo.os,
    ip: deviceInfo.ip,
    productId: APP_ID,
    appId: APP_ID,
    metadata: {
      appVersion: deviceInfo.metadata?.appVersion || '1.0.0',
      language: deviceInfo.metadata?.language || 'zh-CN',
    },
  }

  console.log('Sending request:', {
    url: API_ENDPOINT,
    body: requestBody,
  })

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

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
      throw new ActivationError(errorMessage, response.status)
    }

    return data as ActivationResponse
  } catch (error) {
    console.error('Request failed:', error)
    if (error instanceof ActivationError) {
      throw error
    }
    throw new ActivationError(
      error instanceof Error ? error.message : '网络错误，请检查网络连接',
      0
    )
  }
}
