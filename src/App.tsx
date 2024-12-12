import { Layout } from './app/layout'
import { PromptList } from './components/prompt-list'
import { PromptDialog } from './components/prompt-dialog'
import { CategoryNav } from './components/category-nav'
import { DirectoryNav } from './components/directory-nav'
import { usePromptStore } from '@/store/prompt'
import { useState } from 'react'

export function App() {
  const { activeCategory, setActiveCategory, isCompact } = usePromptStore()
  const [activeDir, setActiveDir] = useState('default')

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <CategoryNav
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />
        <div className="flex-1 mt-4 min-h-0">
          {activeCategory === 'cursor-chat' ? (
            <div className="flex h-full">
              <DirectoryNav activeDir={activeDir} onChange={setActiveDir} />
              <div className="flex-1 pl-6">
                {!isCompact && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h1 className="text-xl font-semibold">提示词</h1>
                      <PromptDialog />
                    </div>
                    <div className="h-[1px] bg-border/50 mb-4" />
                  </>
                )}
                <div className="h-[calc(100%-5rem)]">
                  <PromptList directory={activeDir} isCompact={isCompact} />
                </div>
              </div>
            </div>
          ) : (
            <>
              {!isCompact && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold">提示词</h1>
                    <PromptDialog />
                  </div>
                  <div className="h-[1px] bg-border/50 mb-4" />
                </>
              )}
              <PromptList isCompact={isCompact} />
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default App
