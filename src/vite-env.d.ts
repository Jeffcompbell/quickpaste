/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly IS_ELECTRON: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
