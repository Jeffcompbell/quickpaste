import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProductPrompt, Category } from '@/types'
import { defaultPrompts } from '@/config/prompts'
import { nanoid } from 'nanoid'
import { toast } from 'react-hot-toast'

// 数据层抽象
interface PromptStorage {
  getPrompts(): Promise<ProductPrompt[]>
  addPrompt(prompt: ProductPrompt): Promise<void>
  updatePrompt(id: string, prompt: Partial<ProductPrompt>): Promise<void>
  deletePrompt(id: string): Promise<void>
  resetPrompts(prompts: ProductPrompt[]): Promise<void>
}

// localStorage 实现
class LocalStoragePromptStorage implements PromptStorage {
  private readonly storageKey = 'prompts-storage'

  async getPrompts(): Promise<ProductPrompt[]> {
    const stored = localStorage.getItem(this.storageKey)
    if (!stored) return defaultPrompts

    try {
      const { state } = JSON.parse(stored)
      const storedPrompts = state.prompts

      // 合并系统提示词和用户提示词
      const systemPrompts = defaultPrompts.filter(p => p.isSystem)
      const userPrompts = storedPrompts.filter(p => !p.isSystem)

      return [...systemPrompts, ...userPrompts] // ✅ 确保系统提示词不会丢失
    } catch {
      return defaultPrompts
    }
  }

  async addPrompt(prompt: ProductPrompt): Promise<void> {
    try {
      const prompts = await this.getPrompts()
      const updatedPrompts = [...prompts, prompt]
      this.savePrompts(updatedPrompts)
    } catch (error) {
      console.error('Failed to add prompt:', error)
      throw error
    }
  }

  async updatePrompt(
    id: string,
    updates: Partial<ProductPrompt>
  ): Promise<void> {
    const prompts = await this.getPrompts()
    const updatedPrompts = prompts.map(prompt =>
      prompt.id === id
        ? { ...prompt, ...updates, updateTime: Date.now() }
        : prompt
    )
    this.savePrompts(updatedPrompts)
  }

  async deletePrompt(id: string): Promise<void> {
    const prompts = await this.getPrompts()
    const updatedPrompts = prompts.filter(prompt =>
      prompt.isSystem ? true : prompt.id !== id
    )
    this.savePrompts(updatedPrompts)
  }

  async resetPrompts(prompts: ProductPrompt[]): Promise<void> {
    this.savePrompts(prompts)
  }

  private savePrompts(prompts: ProductPrompt[]): void {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({ state: { prompts }, version: 1 })
      )
    } catch (error) {
      console.error('Failed to save prompts:', error)
      throw error
    }
  }
}

// 创建存储实例
const storage = new LocalStoragePromptStorage()

// Zustand store
interface PromptState {
  prompts: ProductPrompt[]
  categories: Category[]
  activeCategory: string | null
  addPrompt: (
    prompt: Omit<ProductPrompt, 'id' | 'createTime' | 'updateTime' | 'isSystem'>
  ) => void
  updatePrompt: (prompt: ProductPrompt) => void
  deletePrompt: (id: string) => void
  resetToDefault: () => void
  reorderCategory: (from: number, to: number) => void
  setActiveCategory: (category: string | null) => void
  initializePrompts: () => Promise<void>
}

export const usePromptStore = create<PromptState>()(
  persist(
    (set, get) => ({
      prompts: [],
      categories: [],
      activeCategory: null,
      reorderCategory: (from, to) => {
        set(state => {
          const newCategories = [...state.categories]
          const [removed] = newCategories.splice(from, 1)
          newCategories.splice(to, 0, removed)
          return { categories: newCategories }
        })
      },
      setActiveCategory: category => set({ activeCategory: category }),

      addPrompt: promptData => {
        const newPrompt: ProductPrompt = {
          id: nanoid(),
          ...promptData,
          createTime: Date.now(),
          updateTime: Date.now(),
          isSystem: false,
        }

        // 确保调用 storage
        storage
          .addPrompt(newPrompt)
          .then(() => {
            set({ prompts: [...get().prompts, newPrompt] })
            // 可以添加成功提示
            toast.success('提示词已保存')
          })
          .catch(error => {
            // 添加错误处理
            console.error('Failed to save prompt:', error)
            toast.error('保存失败，请重试')
          })
      },

      updatePrompt: updatedPrompt => {
        storage.updatePrompt(updatedPrompt.id, updatedPrompt)
        set({
          prompts: get().prompts.map(prompt =>
            prompt.id === updatedPrompt.id
              ? { ...updatedPrompt, updateTime: Date.now() }
              : prompt
          ),
        })
      },

      deletePrompt: id => {
        storage.deletePrompt(id)
        set({
          prompts: get().prompts.filter(prompt =>
            prompt.isSystem ? true : prompt.id !== id
          ),
        })
      },

      resetToDefault: () => {
        const userPrompts = get().prompts.filter(p => !p.isSystem)
        const resetPrompts = [...defaultPrompts, ...userPrompts]
        storage.resetPrompts(resetPrompts)
        set({ prompts: resetPrompts })
      },

      initializePrompts: async () => {
        const prompts = await storage.getPrompts()
        set({ prompts })
      },
    }),
    {
      name: 'prompts-storage',
      version: 1,
      onRehydrateStorage: () => state => {
        // 在 store 重新水合后初始化提示词
        if (state) {
          state.initializePrompts()
        }
      },
    }
  )
)

// 立即初始化
usePromptStore.getState().initializePrompts()

// 添加类型定义
const filterPromptsByDirectory = (
  prompts: ProductPrompt[],
  directory: string
) => prompts.filter((p: ProductPrompt) => p.directory === directory)
