interface Window {
  electron: {
    window: {
      minimize: () => void
      maximize: () => void
      close: () => void
      hide: () => void
      togglePin: () => void
      getPinState: () => Promise<boolean>
    }
    clipboard: {
      writeText: (text: string) => void
      readText: () => string
    }
    ping: () => string
  }
}
