import React from 'react'
import ReactDOM from 'react-dom/client'
import { PromptPanelPage } from './app/prompt-panel'
import { Toaster } from 'react-hot-toast'
import './styles/globals.css'

// 添加日志以跟踪面板初始化
console.log('Panel: Initializing panel window')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="w-screen h-screen">
      <PromptPanelPage />
      <Toaster />
    </div>
  </React.StrictMode>
)
