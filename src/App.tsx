import { Layout } from './app/layout'
import { PromptList } from './components/prompt-list'
import { PromptDialog } from './components/prompt-dialog'
import { CategorySidebar } from './components/category-sidebar'
import { ToolsGrid } from './components/tools-grid'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function App() {
  const [activeCategory, setActiveCategory] = useState('default')
  const [activeSection, setActiveSection] = useState<'prompts' | 'tools'>(
    'prompts'
  )

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 h-12">
          <h2 className="text-base font-medium text-gray-800">提示词</h2>
          <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
            <button
              onClick={() => setActiveSection('prompts')}
              className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                activeSection === 'prompts'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'hover:bg-background/50 hover:text-foreground'
              )}
            >
              提示词
            </button>
            <button
              onClick={() => setActiveSection('tools')}
              className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                activeSection === 'tools'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'hover:bg-background/50 hover:text-foreground'
              )}
            >
              工具导航
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 flex">
          {activeSection === 'prompts' ? (
            <>
              <CategorySidebar
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
              <div className="flex-1 min-w-0">
                <div
                  className="h-full rounded-2xl p-6 mx-4 mb-4 overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.75))',
                    backdropFilter: 'blur(20px)',
                    boxShadow:
                      '0 4px 24px -1px rgba(0, 0, 0, 0.04), 0 0 1px 0 rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <div className="h-full">
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="text-xl font-medium text-gray-700">
                        快捷提示词
                      </h1>
                      <PromptDialog activeDirectory={activeCategory} />
                    </div>
                    <div className="h-[1px] bg-gradient-to-r from-black/[0.03] via-black/[0.07] to-black/[0.03] mb-6" />
                    <div className="h-[calc(100%-5rem)]">
                      <PromptList category={activeCategory} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 min-w-0">
              <div
                className="h-full rounded-2xl p-6 mx-4 mb-4 overflow-hidden"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.75))',
                  backdropFilter: 'blur(20px)',
                  boxShadow:
                    '0 4px 24px -1px rgba(0, 0, 0, 0.04), 0 0 1px 0 rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                <div className="h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-medium text-gray-700">
                      AI 工具导航
                    </h1>
                  </div>
                  <div className="h-[1px] bg-gradient-to-r from-black/[0.03] via-black/[0.07] to-black/[0.03] mb-6" />
                  <div className="h-[calc(100%-5rem)] overflow-auto">
                    <ToolsGrid />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default App
