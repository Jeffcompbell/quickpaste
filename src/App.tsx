import { useEffect, useState, memo, useMemo } from 'react'
import { Layout } from './app/layout'
import { CategorySidebar } from './components/category-sidebar'
import { PromptList } from './components/prompt-list'
import { Toaster } from 'react-hot-toast'
import { usePromptStore } from './store/prompt'
import { useSearchStore } from './store/search'
import { Header } from './components/header'
import { PromptDialog } from './components/prompt-dialog'
import { AboutDialog } from './components/about-dialog'
import { ActivationDialog } from './components/activation-dialog'
import { SearchIcon } from './components/icons'

// 分离标题组件
const CategoryTitle = memo(function CategoryTitle() {
  const activeCategory = usePromptStore(state => state.activeCategory)
  const categories = usePromptStore(state => state.categories)
  const isLoading = usePromptStore(state => state.isLoading)

  const title = useMemo(() => {
    if (!activeCategory) return '全部提示词'
    const category = categories.find(c => c.id === activeCategory)
    return category ? category.name : '全部提示词'
  }, [categories, activeCategory])

  return (
    <h2 className="text-lg font-semibold">
      {title}
      {isLoading && (
        <span className="ml-2 text-sm text-gray-500">加载中...</span>
      )}
    </h2>
  )
})

// 分离提示词列表容器组件
const PromptListContainer = memo(function PromptListContainer() {
  const activeCategory = usePromptStore(state => state.activeCategory)
  const prompts = usePromptStore(state => state.prompts)
  const searchQuery = useSearchStore(state => state.searchQuery)

  const filteredPrompts = useMemo(() => {
    let filtered = prompts

    // 按分类过滤
    if (activeCategory) {
      filtered = filtered.filter(prompt => prompt.category === activeCategory)
    }

    // 按搜索词过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        prompt =>
          prompt.title.toLowerCase().includes(query) ||
          prompt.content.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [prompts, activeCategory, searchQuery])

  return <PromptList prompts={filteredPrompts} />
})

export function App() {
  const [isActivated, setIsActivated] = useState(false)
  const prompts = usePromptStore(state => state.prompts)
  const categories = usePromptStore(state => state.categories)
  const initializePrompts = usePromptStore(state => state.initializePrompts)
  const [showAbout, setShowAbout] = useState(false)

  const searchQuery = useSearchStore(state => state.searchQuery)
  const setSearchQuery = useSearchStore(state => state.setSearchQuery)

  // 检查激活状态
  useEffect(() => {
    const activationData = localStorage.getItem('activation_data')
    if (activationData) {
      try {
        const data = JSON.parse(activationData)
        if (data.status === 'activated') {
          setIsActivated(true)
        }
      } catch (error) {
        console.error('Failed to parse activation data:', error)
      }
    }
  }, [])

  // 在组件挂载时初始化提示词
  useEffect(() => {
    console.log('App: Initializing prompts')
    initializePrompts()
  }, [initializePrompts])

  // 监听 show-about-dialog 事件
  useEffect(() => {
    const electron = window.electron
    console.log(
      'App: Setting up show-about-dialog listener, electron available:',
      !!electron
    )

    if (!electron) {
      console.log('App: Electron API not available')
      return
    }

    try {
      const unsubscribe = electron.app.onShowAboutDialog(() => {
        console.log('App: Received show-about-dialog event, showing dialog')
        setShowAbout(true)
      })

      return () => {
        console.log('App: Cleaning up show-about-dialog listener')
        unsubscribe?.()
      }
    } catch (error) {
      console.error('App: Error setting up show-about-dialog listener:', error)
    }
  }, [])

  // IPC 监听
  useEffect(() => {
    const electron = window.electron
    if (!electron) return

    const handleGetPrompts = () => {
      const data = {
        prompts: prompts,
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          isSystem: cat.isSystem,
        })),
      }
      electron.ipcRenderer.send('prompts-data', data)
    }

    // 初始化时发送一次数据
    handleGetPrompts()

    // 设置监听器
    const cleanup = electron.ipcRenderer.on('get-prompts', handleGetPrompts)

    return () => {
      cleanup?.()
    }
  }, [prompts, categories])

  const handleActivate = () => {
    setIsActivated(true)
  }

  if (!isActivated) {
    return (
      <>
        <ActivationDialog open={true} onActivate={handleActivate} />
        <Toaster />
      </>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <CategorySidebar />
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4">
              <CategoryTitle />
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="search"
                    placeholder="搜索提示词..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-sm border rounded-md w-64 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  />
                </div>
                <PromptDialog />
              </div>
            </div>
            <div className="flex-1 overflow-auto px-6">
              <PromptListContainer />
            </div>
          </div>
        </div>
      </div>
      <Toaster />
      <AboutDialog open={showAbout} onOpenChange={setShowAbout} />
    </Layout>
  )
}
