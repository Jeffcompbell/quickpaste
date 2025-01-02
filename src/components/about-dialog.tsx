import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { getElectronAPI } from '@/lib/electron'
import { CloseIcon } from './icons'
import type { VersionInfo } from '../../electron/types'

interface AboutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    version: '0.1.0',
    commit: 'unknown',
    date: 'unknown',
    electron: 'unknown',
    electronBuildId: 'unknown',
    chromium: 'unknown',
    nodeVersion: 'unknown',
    v8: 'unknown',
    os: 'unknown',
  })

  useEffect(() => {
    const electron = getElectronAPI()
    console.log('About dialog: electron API available:', !!electron)

    if (electron && open) {
      console.log('About dialog: fetching version info...')
      electron.app
        .getVersionInfo()
        .then((info: VersionInfo) => {
          console.log('About dialog: received version info:', info)
          setVersionInfo(info)
        })
        .catch((error: Error) => {
          console.error('Failed to get version info:', error)
        })
    }
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  ProPaste
                </Dialog.Title>
                <div className="mt-1 text-sm text-gray-500">
                  版本 {versionInfo.version}
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
                  <CloseIcon className="w-5 h-5 text-gray-500" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="text-gray-500">提交</div>
                <div className="text-gray-900">{versionInfo.commit}</div>

                <div className="text-gray-500">提交日期</div>
                <div className="text-gray-900">{versionInfo.date}</div>

                <div className="text-gray-500">Electron</div>
                <div className="text-gray-900">{versionInfo.electron}</div>

                <div className="text-gray-500">构建 ID</div>
                <div className="text-gray-900">
                  {versionInfo.electronBuildId}
                </div>

                <div className="text-gray-500">Chromium</div>
                <div className="text-gray-900">{versionInfo.chromium}</div>

                <div className="text-gray-500">Node.js</div>
                <div className="text-gray-900">{versionInfo.nodeVersion}</div>

                <div className="text-gray-500">V8</div>
                <div className="text-gray-900">{versionInfo.v8}</div>

                <div className="text-gray-500">系统</div>
                <div className="text-gray-900">{versionInfo.os}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                  关闭
                </button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
