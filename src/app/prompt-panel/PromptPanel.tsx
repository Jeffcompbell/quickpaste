import React, { useEffect, useState } from 'react'
import { usePromptStore } from '../../store/prompt'
import { cn } from '../../lib/utils'
import { toast } from 'react-hot-toast'
import { PromptCard } from '../../components/prompt-card'
import { getElectronAPI } from '../../lib/electron'
import { TitleBar } from '../../components/title-bar'

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
    <div className="w-full h-full bg-white shadow-xl rounded-lg overflow-hidden flex flex-col">
      {/* 使用 TitleBar 组件 */}
      <TitleBar />

      {/* 搜索栏 */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索提示词..."
            className="w-full px-3 py-1.5 pr-8 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

      <div className="flex flex-1 h-0">
        {/* 左侧分类列表 */}
        <div className="w-32 p-3 border-r border-gray-100/80 overflow-y-auto">
          {/* 全部分类 */}
          <div
            key="all"
            className={cn(
              'px-3 py-2 mb-1 rounded-lg text-sm cursor-pointer',
              'transition-colors duration-200',
              'hover:bg-gray-100/80',
              activeCategory === 'all'
                ? 'bg-gray-100/80 text-gray-900 font-medium'
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
                  'px-3 py-2 mb-1 rounded-lg text-sm cursor-pointer',
                  'transition-colors duration-200',
                  'hover:bg-gray-100/80',
                  activeCategory === category.id
                    ? 'bg-gray-100/80 text-gray-900 font-medium'
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
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="h-[72px] bg-gray-100/80 rounded-lg animate-pulse"
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
  )
}
