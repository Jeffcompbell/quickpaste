interface Window {
  electron: {
    window: {
      minimize: () => void
      maximize: () => void
      restore: () => void
      close: () => void
      hide: () => void
      show: () => void
      togglePin: () => void
      getPinState: () => Promise<boolean>
      getMaximizedState: () => Promise<boolean>
    }
    clipboard: {
      writeText: (text: string) => void
      readText: () => string
    }
    ping: () => string
  }
}
