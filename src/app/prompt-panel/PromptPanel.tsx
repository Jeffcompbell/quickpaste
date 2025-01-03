import React, { useEffect, useState } from 'react'
import { usePromptStore } from '../../store/prompt'
import { cn } from '../../lib/utils'
import { toast } from 'react-hot-toast'
import { PromptCard } from '../../components/prompt-card'
import { getElectronAPI } from '../../lib/electron'

export function PromptPanel() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const prompts = usePromptStore(state => state.prompts)
  const categories = usePromptStore(state => state.categories)
  const initializePrompts = usePromptStore(state => state.initializePrompts)
  const electron = getElectronAPI()

  // 初始化数据
  useEffect(() => {
    // 初始化提示词数据
    initializePrompts().then(() => {
      setIsLoading(false)
    })
  }, [initializePrompts])

  // 日志记录
  useEffect(() => {
    console.log('Panel: Component mounted', {
      electronAvailable: !!electron,
      isLoading,
      promptsAvailable: !!prompts,
      promptsLength: prompts?.length,
      categoriesLength: categories.length,
    })
  }, [electron, categories.length, prompts, isLoading])

  // 根据当前选中的分类和搜索词过滤提示词
  const filteredPrompts = React.useMemo(() => {
    if (!prompts) {
      console.log('No prompts available')
      return []
    }

    let filtered = prompts

    // 先按分类过滤
    if (activeCategory !== 'all') {
      filtered = filtered.filter(prompt => prompt.category === activeCategory)
    }

    // 再按搜索词过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        prompt =>
          prompt.title.toLowerCase().includes(query) ||
          prompt.content.toLowerCase().includes(query)
      )
    }

    console.log('Filtering prompts:', {
      activeCategory,
      searchQuery,
      totalPrompts: prompts.length,
      filteredCount: filtered.length,
      categories: categories.map(c => `${c.id}:${c.name}`).join(', '),
    })

    return filtered
  }, [prompts, activeCategory, categories, searchQuery])

  // 处理提示词复制
  const handleCopy = async (content: string) => {
    const electron = getElectronAPI()
    if (!electron?.ipcRenderer) {
      try {
        await navigator.clipboard.writeText(content)
        toast.success('已复制到剪贴板')
      } catch (error) {
        console.error('Failed to copy:', error)
        toast.error('复制失败')
      }
      return
    }

    try {
      await electron.clipboard.writeText(content)
      toast.success('已复制到剪贴板')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('复制失败')
    }
  }

  return (
    <div className="w-full h-full bg-[#fafafa] flex flex-col">
      {/* 标题栏 */}
      <div
        className="h-10 shrink-0 flex items-center bg-white px-3 relative border-b border-gray-200"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-gray-600 select-none">
            ProPaste
          </span>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="p-3 shrink-0 bg-white border-b border-gray-200">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索提示词..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50/80 rounded-lg border border-gray-200/80 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧分类列表 */}
        <div className="w-[100px] p-1.5 bg-white border-r border-gray-200">
          {/* 全部分类 */}
          <div
            key="all"
            className={cn(
              'px-2 py-1 mb-0.5 rounded-md text-sm cursor-pointer truncate',
              'transition-colors duration-200',
              'hover:bg-[#fafafa]',
              activeCategory === 'all'
                ? 'bg-[#fafafa] text-gray-900 font-medium'
                : 'text-gray-600'
            )}
            onClick={() => setActiveCategory('all')}
          >
            全部
            <span className="ml-1 text-xs text-gray-400">
              {prompts?.length || 0}
            </span>
          </div>

          {/* 其他分类 */}
          {categories
            .filter(category => category.id !== 'all')
            .map(category => (
              <div
                key={category.id}
                className={cn(
                  'px-2 py-1 mb-0.5 rounded-md text-sm cursor-pointer truncate',
                  'transition-colors duration-200',
                  'hover:bg-[#fafafa]',
                  activeCategory === category.id
                    ? 'bg-[#fafafa] text-gray-900 font-medium'
                    : 'text-gray-600'
                )}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
                <span className="ml-1 text-xs text-gray-400">
                  {prompts.filter(p => p.category === category.id).length}
                </span>
              </div>
            ))}
        </div>

        {/* 右侧提示词列表 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 max-w-[720px] mx-auto">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="h-[60px] bg-white rounded-lg animate-pulse shadow-sm"
                  />
                ))}
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                  />
                </svg>
                <div className="text-sm">
                  {searchQuery ? '未找到匹配的提示词' : '该分类下暂无提示词'}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPrompts.map(prompt => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onCopy={handleCopy}
                    categoryName={
                      categories.find(c => c.id === prompt.category)?.name
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
