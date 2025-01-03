import React from 'react'

interface QRCodeDialogProps {
  open: boolean
  onClose: () => void
}

export function QRCodeDialog({ open, onClose }: QRCodeDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-[9999] bg-white p-4 rounded-lg shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <img
          src="/QRCode.JPG"
          alt="微信二维码"
          className="w-48 h-48 object-cover rounded-lg"
          onLoad={() => console.log('QR code image loaded successfully')}
          onError={e => {
            console.error('Failed to load QR code image:', e)
            const img = e.target as HTMLImageElement
            console.log('Attempted image path:', img.src)
          }}
        />
      </div>
    </div>
  )
}
