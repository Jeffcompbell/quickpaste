import { useState } from 'react'
import { PanelLeftIcon } from './icons'
import { QRCodeDialog } from './qr-code-dialog'

export function Header() {
  const [showQRCode, setShowQRCode] = useState(false)

  const handlePanelClick = () => {
    if (!window.electron) return
    window.electron.window.togglePanel()
  }

  return (
    <>
      <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center space-x-4">
          <button
            className="p-2 hover:bg-accent rounded-md"
            onClick={handlePanelClick}
          >
            <PanelLeftIcon className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-semibold">提示词</h1>
        </div>
        <button
          className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors"
          onClick={() => {
            console.log('Opening QR code dialog')
            setShowQRCode(true)
          }}
        >
          反馈问题
        </button>
      </header>

      <QRCodeDialog
        open={showQRCode}
        onClose={() => {
          console.log('Closing QR code dialog')
          setShowQRCode(false)
        }}
      />
    </>
  )
}
