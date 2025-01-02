import * as Dialog from '@radix-ui/react-dialog'
import { X, MessageCircle, Mail } from 'lucide-react'

interface ContactDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border border-zinc-800 bg-zinc-900/95 p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl">
          <div className="relative">
            <div className="absolute -left-20 -top-20 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <Dialog.Title className="text-3xl font-bold text-white">
                  联系作者
                </Dialog.Title>
                <Dialog.Close className="rounded-lg p-1.5 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-white/20">
                  <X className="w-5 h-5 text-zinc-400" />
                </Dialog.Close>
              </div>
              <div className="mt-8 space-y-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-48 h-48 bg-zinc-800/50 border border-zinc-700/50 rounded-xl overflow-hidden">
                    <img
                      src="/QRCode.JPG"
                      alt="微信二维码"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-zinc-400 text-sm">
                    扫描二维码添加作者微信
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-zinc-400" />
                      <span className="text-zinc-400">微信号</span>
                    </div>
                    <span className="text-white font-medium">curisaas</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-zinc-400" />
                      <span className="text-zinc-400">邮箱</span>
                    </div>
                    <span className="text-white font-medium">
                      service@curisaas.com
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
