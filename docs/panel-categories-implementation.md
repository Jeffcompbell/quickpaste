# Panel 系统分类和自定义分类的实现

## 1. 数据结构设计

### 1.1 系统预设分类

```typescript
// 系统预设分类名称映射
const SYSTEM_CATEGORIES: Record<string, string> = {
  all: '全部', // 特殊分类：显示所有提示词
  requirement: '需求编写',
  debug: 'Bug修复',
  deployment: 'Git部署',
  summary: '总结规范',
}
```

### 1.2 分类数据结构

```typescript
interface Category {
  id: string
  name: string
  isSystem?: boolean // 用于区分系统分类和自定义分类
  createdAt?: string
}
```

### 1.2 提示词数据结构

```typescript
interface ProductPrompt {
  id: string
  title: string
  content: string
  category: string
  type: 'product'
  author: string
  authorUrl?: string
  isSystem?: boolean // 用于区分系统提示词和用户提示词
  createTime: number
  updateTime: number
}
```

## 2. 存储层实现

### 2.1 LocalStorage 存储

- 使用 `LocalStoragePromptStorage` 类管理本地存储
- 只存储用户自定义的提示词和分类
- 系统预设数据从配置文件加载

```typescript
class LocalStoragePromptStorage {
  private readonly storageKey = 'prompts-storage'

  async getPrompts(): Promise<ProductPrompt[]> {
    const state = await this.getCachedState()
    const userPrompts = state.prompts.filter(p => !p.isSystem)
    // 合并系统提示词和用户提示词
    return [...defaultPrompts, ...userPrompts]
  }

  async getCategories(): Promise<Category[]> {
    const state = await this.getCachedState()
    const userCategories = state.categories.filter(cat => !cat.isSystem)
    // 合并系统分类和用户分类
    return [...systemCategories, ...userCategories]
  }
}
```

## 3. 状态管理实现

### 3.1 Zustand Store

- 使用 Zustand 管理全局状态
- 实现数据的持久化
- 提供分类和提示词的 CRUD 操作

```typescript
interface PromptState {
  prompts: ProductPrompt[]
  categories: Category[]
  activeCategory: string | null
  isLoading: boolean
  // ... 其他状态和方法
}

const usePromptStore = create<PromptState>()(
  persist(
    (set, get) => ({
      // ... store implementation
    }),
    {
      name: 'prompt-storage',
      onRehydrateStorage: () => state => {
        state?.initializePrompts()
      },
    }
  )
)
```

## 4. 面板组件实现

### 4.1 分类列表

```typescript
// PromptPanel.tsx
const categories = usePromptStore(state => state.categories)
const [activeCategory, setActiveCategory] = useState('all') // 默认选中"全部"分类

return (
  <div className="w-32 p-3 border-r border-gray-100/80 overflow-y-auto">
    {categories.map(category => (
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
        {/* 显示分类下的提示词数量，"全部"分类显示所有提示词数量 */}
        {category.id !== 'all' && (
          <span className="ml-1 text-xs text-gray-400">
            {prompts.filter(p => p.category === category.id).length}
          </span>
        )}
      </div>
    ))}
  </div>
)
```

### 4.2 提示词过滤

```typescript
const filteredPrompts = React.useMemo(() => {
  if (!prompts) return []

  let filtered = prompts

  // "all" 分类显示所有提示词，其他分类按分类过滤
  if (activeCategory !== 'all') {
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
```

## 5. 数据初始化流程

1. 组件挂载时调用 `initializePrompts`
2. 从 localStorage 加载用户数据
3. 合并系统预设和用户数据，确保"全部"分类始终存在且排在第一位
4. 更新 store 状态
5. 渲染面板内容，默认选中"全部"分类

## 6. 权限控制

### 6.1 系统分类保护

- 系统分类不允许编辑或删除
- 系统提示词不允许编辑或删除

```typescript
const handleDelete = (id: string) => {
  const category = categories.find(cat => cat.id === id)
  if (category?.isSystem) {
    toast.error('系统分类不能删除')
    return
  }
  // ... 删除逻辑
}
```

## 7. 注意事项

1. 系统预设数据和用户数据分开存储
2. 只有用户数据需要持久化到 localStorage
3. 合并数据时需要保持正确的顺序（系统数据优先）
4. "全部"分类是特殊分类，始终存在且排在第一位
5. "全部"分类不显示提示词数量，其他分类显示该分类下的提示词数量
6. 操作时需要判断是否为系统数据
7. 确保数据更新时同步更新存储和状态
