import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'
import { getElectronAPI } from '@/lib/electron'
import type { VersionInfo } from '@/types/electron'
import { CloseIcon } from './icons'

interface AboutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)

  useEffect(() => {
    const loadVersionInfo = async () => {
      try {
        const electron = getElectronAPI()
        if (!electron) return
        const info = await electron.app.getVersionInfo()
        setVersionInfo(info)
      } catch (error) {
        console.error('Failed to load version info:', error)
      }
    }
    loadVersionInfo()
  }, [])

  if (!versionInfo) return null

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
              关于 {versionInfo.name || 'ProPaste'}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              版本信息
            </Dialog.Description>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">版本</span>
              <span className="text-sm text-muted-foreground">
                {versionInfo.version}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Electron</span>
              <span className="text-sm text-muted-foreground">
                {versionInfo.electron}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Chromium</span>
              <span className="text-sm text-muted-foreground">
                {versionInfo.chromium}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Node.js</span>
              <span className="text-sm text-muted-foreground">
                {versionInfo.nodeVersion}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">V8</span>
              <span className="text-sm text-muted-foreground">
                {versionInfo.v8}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">操作系统</span>
              <span className="text-sm text-muted-foreground">
                {versionInfo.os}
              </span>
            </div>
          </div>
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <CloseIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
