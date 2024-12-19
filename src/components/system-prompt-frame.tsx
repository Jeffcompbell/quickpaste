interface SystemPromptFrameProps {
  className?: string
}

export function SystemPromptFrame({ className }: SystemPromptFrameProps) {
  return (
    <div className={className}>
      <iframe
        src="https://cursor.directory"
        className="w-full h-full border-none"
        title="Cursor Directory"
      />
    </div>
  )
}
