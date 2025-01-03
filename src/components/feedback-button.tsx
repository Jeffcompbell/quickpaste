import React from 'react'

interface FeedbackButtonProps {
  onClick: () => void
}

export function FeedbackButton({ onClick }: FeedbackButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('FeedbackButton: handleClick')
    onClick()
  }

  return (
    <div
      className="window-no-drag"
      style={{ pointerEvents: 'auto' }}
      onClick={handleClick}
    >
      <button
        type="button"
        className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      >
        反馈问题
      </button>
    </div>
  )
}
