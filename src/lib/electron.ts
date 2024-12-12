export function isElectron(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    window.electron &&
    process.env.IS_ELECTRON
  )
}

export function getElectronAPI() {
  if (!isElectron()) {
    return {
      window: {
        minimize: () => {},
        maximize: () => {},
        close: () => {},
        hide: () => {},
        show: () => {},
        togglePin: () => {},
        getPinState: () => Promise.resolve(false),
      },
      clipboard: {
        writeText: (text: string) => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(text)
          }
        },
        readText: () => '',
      },
    }
  }
  return window.electron
}
