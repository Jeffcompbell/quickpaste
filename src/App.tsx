import { useState, useMemo } from 'react'
import { Layout } from './app/layout'
import { PromptList } from './components/prompt-list'
import { PromptDialog } from './components/prompt-dialog'
import { CategorySidebar } from './components/category-sidebar'
import { ToolsGrid } from './components/tools-grid'
import { cn } from '@/lib/utils'
import { Toaster } from 'react-hot-toast'
import { SearchIcon } from './components/icons'
import { usePromptStore } from './store/prompt'

export function App() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'prompts' | 'tools'>(
    'prompts'
  )
  const [searchQuery, setSearchQuery] = useState('')
  const { prompts } = usePromptStore()

  const filteredPrompts = useMemo(() => {
    let filtered = prompts

    // 如果选择了分类，先过滤分类
    if (activeCategory) {
      filtered = filtered.filter(prompt => prompt.directory === activeCategory)
    }

    // 如果有搜索关键词，再过滤标题和内容
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        prompt =>
          prompt.title.toLowerCase().includes(query) ||
          prompt.content.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [prompts, activeCategory, searchQuery])

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
                        {activeCategory ? '分类提示词' : '全部提示词'}
                      </h1>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="搜索提示词..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-[240px] h-9 pl-9 pr-4 text-sm rounded-md border border-gray-200 bg-white/80 focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors text-gray-900 placeholder:text-gray-400"
                          />
                          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        </div>
                        <PromptDialog
                          activeDirectory={activeCategory ?? 'default'}
                        />
                      </div>
                    </div>
                    <div className="h-[1px] bg-gradient-to-r from-black/[0.03] via-black/[0.07] to-black/[0.03] mb-6" />
                    <div className="h-[calc(100%-5rem)]">
                      <PromptList prompts={filteredPrompts} />
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
      <Toaster />
    </Layout>
  )
}

export default App
