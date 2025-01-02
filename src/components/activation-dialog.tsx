import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { validateActivationCode } from '@/lib/activation'
import { ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { ContactDialog } from './contact-dialog'

interface ActivationDialogProps {
  open?: boolean
  onActivate?: () => void
}

export function ActivationDialog({ open, onActivate }: ActivationDialogProps) {
  const [activationCode, setActivationCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showContact, setShowContact] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!activationCode.trim()) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await validateActivationCode(activationCode)
      console.log('Activation successful:', response)

      const activationData = {
        status: 'activated',
        deviceId: response.data.device.deviceId,
        activationTime: Date.now(),
        activationCode: activationCode,
      }

      localStorage.setItem('activation_data', JSON.stringify(activationData))
      console.log('Activation data saved successfully')

      toast.success('激活成功')
      setShowWelcome(true)
    } catch (error) {
      console.error('Activation failed:', error)
      setError(error instanceof Error ? error.message : '激活失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog.Root open={open} modal>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/90 backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
            <div className="absolute inset-0 overflow-hidden select-none pointer-events-none">
              <div className="absolute -top-20 left-20 text-[200px] opacity-[0.08] rotate-12">
                ✨
              </div>
              <div className="absolute top-1/3 -right-10 text-[180px] opacity-[0.08] -rotate-12">
                🚀
              </div>
              <div className="absolute bottom-20 left-40 text-[160px] opacity-[0.08] rotate-6">
                💡
              </div>
            </div>
          </Dialog.Overlay>
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border border-white/[0.08] bg-black/80 p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl backdrop-blur-xl">
            <div className="relative">
              {showWelcome ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-8">
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <div className="space-y-3 text-center">
                    <h2 className="text-3xl font-bold text-white">
                      欢迎使用 ProPaste
                    </h2>
                    <p className="text-zinc-400 text-lg">
                      您的智能提示词管理助手，让工作效率倍增
                    </p>
                    <p className="text-red-500 font-medium">
                      祝您 2025 新年快乐！
                    </p>
                  </div>
                  <button
                    onClick={() => onActivate?.()}
                    className="group px-8 py-3 bg-white text-black font-medium rounded-xl hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white/[0.12] flex items-center gap-2"
                  >
                    开始使用
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col space-y-2 text-center">
                    <Dialog.Title className="text-3xl font-bold text-white">
                      激活 ProPaste
                    </Dialog.Title>
                    <Dialog.Description className="text-zinc-400">
                      请输入激活码以继续使用
                    </Dialog.Description>
                  </div>
                  <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={activationCode}
                        onChange={e => setActivationCode(e.target.value)}
                        placeholder="请输入激活码"
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/[0.12] placeholder:text-zinc-500"
                        disabled={isSubmitting}
                      />
                      {error && (
                        <p className="text-sm text-red-500 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-red-500" />
                          {error}
                        </p>
                      )}
                    </div>
                    <div className="space-y-4">
                      <button
                        type="submit"
                        disabled={isSubmitting || !activationCode.trim()}
                        className="group w-full py-3 bg-white text-black font-medium rounded-xl hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white/[0.12] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            正在激活...
                          </>
                        ) : (
                          <>
                            激活
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowContact(true)}
                        className="w-full text-sm text-zinc-400 hover:text-white transition-colors"
                      >
                        点击获取激活码
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <ContactDialog open={showContact} onOpenChange={setShowContact} />
    </>
  )
}
