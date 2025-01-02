import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProductPrompt, Category } from '@/types'
import { defaultPrompts, systemCategories } from '@/config/prompts'
import { nanoid } from 'nanoid'
import { toast } from 'react-hot-toast'

// 数据层抽象
interface PromptStorage {
  getPrompts(): Promise<ProductPrompt[]>
  addPrompt(prompt: ProductPrompt): Promise<void>
  updatePrompt(id: string, prompt: Partial<ProductPrompt>): Promise<void>
  deletePrompt(id: string): Promise<void>
  resetPrompts(prompts: ProductPrompt[]): Promise<void>
  getCategories(): Promise<Category[]>
}

// localStorage 实现
export class LocalStoragePromptStorage implements PromptStorage {
  private readonly storageKey = 'prompts-storage'
  private cachedState: {
    prompts: ProductPrompt[]
    categories: Category[]
  } | null = null

  private async getCachedState() {
    if (this.cachedState) {
      return this.cachedState
    }

    const stored = localStorage.getItem(this.storageKey)
    if (!stored) {
      this.cachedState = {
        prompts: [],
        categories: [],
      }
      return this.cachedState
    }

    try {
      const { state } = JSON.parse(stored)
      this.cachedState = {
        prompts: state.prompts || [],
        categories: state.categories || [],
      }
      return this.cachedState
    } catch (error) {
      console.error(
        'LocalStoragePromptStorage: Error parsing stored data:',
        error
      )
      this.cachedState = {
        prompts: [],
        categories: [],
      }
      return this.cachedState
    }
  }

  async getPrompts(): Promise<ProductPrompt[]> {
    console.log('LocalStoragePromptStorage: Getting prompts')
    const state = await this.getCachedState()

    // 合并系统提示词和用户提示词
    const userPrompts = state.prompts.filter(p => !p.isSystem)
    console.log(
      'LocalStoragePromptStorage: System prompts count:',
      defaultPrompts.length
    )
    console.log(
      'LocalStoragePromptStorage: User prompts count:',
      userPrompts.length
    )

    // 始终返回系统提示词和用户提示词的组合
    return [...defaultPrompts, ...userPrompts]
  }

  async getCategories(): Promise<Category[]> {
    console.log('LocalStoragePromptStorage: Getting categories')
    const state = await this.getCachedState()
    const userCategories = state.categories.filter(cat => !cat.isSystem)

    // 合并系统分类和用户分类
    return [...systemCategories, ...userCategories]
  }

  // 添加公共方法来保存提示词
  async savePrompts(
    prompts: ProductPrompt[],
    categories: Category[]
  ): Promise<void> {
    await this.saveState({ prompts, categories })
  }

  private async saveState(state: {
    prompts: ProductPrompt[]
    categories: Category[]
  }): Promise<void> {
    console.log('LocalStoragePromptStorage: Saving state')
    try {
      // 只保存用户的提示词和分类
      const userPrompts = state.prompts.filter(p => !p.isSystem)
      const userCategories = state.categories.filter(c => !c.isSystem)

      // Update cache
      this.cachedState = {
        prompts: userPrompts,
        categories: userCategories,
      }

      // Then persist to localStorage
      const dataToStore = {
        state: this.cachedState,
        version: 1,
        timestamp: Date.now(),
      }

      localStorage.setItem(this.storageKey, JSON.stringify(dataToStore))
      console.log('LocalStoragePromptStorage: State saved successfully')
    } catch (error) {
      console.error('LocalStoragePromptStorage: Error saving state:', error)
      throw error
    }
  }

  async addPrompt(prompt: ProductPrompt): Promise<void> {
    console.log('LocalStoragePromptStorage: Adding prompt:', prompt)
    try {
      const prompts = await this.getPrompts()
      const categories = await this.getCategories()
      await this.saveState({
        prompts: [...prompts, prompt],
        categories,
      })
    } catch (error) {
      console.error('LocalStoragePromptStorage: Error adding prompt:', error)
      throw error
    }
  }

  async updatePrompt(
    id: string,
    updates: Partial<ProductPrompt>
  ): Promise<void> {
    console.log('LocalStoragePromptStorage: Updating prompt:', { id, updates })
    try {
      const state = await this.getCachedState()

      // Update prompts in cached state
      const updatedPrompts = state.prompts.map(prompt =>
        prompt.id === id
          ? { ...prompt, ...updates, updateTime: Date.now() }
          : { ...prompt }
      )

      // Save state
      await this.saveState({
        prompts: updatedPrompts,
        categories: state.categories,
      })
    } catch (error) {
      console.error('LocalStoragePromptStorage: Error updating prompt:', error)
      throw error
    }
  }

  async deletePrompt(id: string): Promise<void> {
    console.log('LocalStoragePromptStorage: Deleting prompt:', id)
    try {
      const prompts = await this.getPrompts()
      const categories = await this.getCategories()
      const updatedPrompts = prompts.filter(prompt =>
        prompt.isSystem ? true : prompt.id !== id
      )
      await this.saveState({ prompts: updatedPrompts, categories })
    } catch (error) {
      console.error('LocalStoragePromptStorage: Error deleting prompt:', error)
      throw error
    }
  }

  async resetPrompts(prompts: ProductPrompt[]): Promise<void> {
    console.log('LocalStoragePromptStorage: Resetting prompts')
    try {
      const categories = await this.getCategories()
      await this.saveState({ prompts, categories })
    } catch (error) {
      console.error(
        'LocalStoragePromptStorage: Error resetting prompts:',
        error
      )
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
  isCompact: boolean
  addPrompt: (
    prompt: Omit<ProductPrompt, 'id' | 'createTime' | 'updateTime' | 'isSystem'>
  ) => void
  updatePrompt: (prompt: ProductPrompt) => void
  deletePrompt: (id: string) => void
  resetToDefault: () => void
  reorderCategory: (from: number, to: number) => void
  setActiveCategory: (category: string | null) => void
  initializePrompts: () => Promise<void>
  addCategory: (category: Category) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  isLoading: boolean
}

// 添加类型定义
export interface Prompt {
  id: string
  title: string
  content: string
  category: string
  createTime: number
  updateTime: number
}

export const usePromptStore = create<PromptState>()(
  persist(
    (set, get) => ({
      prompts: [],
      categories: [],
      activeCategory: null,
      isCompact: false,
      isLoading: true,

      initializePrompts: async () => {
        set({ isLoading: true })
        try {
          const [prompts, categories] = await Promise.all([
            storage.getPrompts(),
            storage.getCategories(),
          ])
          set({ prompts, categories, isLoading: false })
        } catch (error) {
          console.error('Failed to initialize prompts:', error)
          set({ isLoading: false })
        }
      },

      addPrompt: promptData => {
        const newPrompt: ProductPrompt = {
          id: nanoid(),
          ...promptData,
          createTime: Date.now(),
          updateTime: Date.now(),
          isSystem: false,
        }

        set(state => {
          const newPrompts = [...state.prompts, newPrompt]
          // 使用公共方法保存
          storage.savePrompts(newPrompts, state.categories)
          return { prompts: newPrompts }
        })
      },

      reorderCategory: (from, to) => {
        set(state => {
          const newCategories = [...state.categories]
          const [removed] = newCategories.splice(from, 1)
          newCategories.splice(to, 0, removed)
          return { categories: newCategories }
        })
      },

      setActiveCategory: category => set({ activeCategory: category }),

      updatePrompt: async prompt => {
        try {
          set({ isLoading: true })
          await storage.updatePrompt(prompt.id, prompt)
          set(state => ({
            prompts: state.prompts.map(p => (p.id === prompt.id ? prompt : p)),
          }))
          console.log('Store: Successfully updated prompt')
          toast.success('保存成功', {
            duration: 1500,
            position: 'top-center',
          })
        } catch (error) {
          console.error('Store: Failed to update prompt:', error)
          toast.error('保存失败')
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      deletePrompt: async id => {
        try {
          await storage.deletePrompt(id)
          set({
            prompts: get().prompts.filter(prompt => prompt.id !== id),
          })
        } catch (error) {
          console.error('Failed to delete prompt:', error)
          toast.error('删除失败，请重试')
        }
      },

      resetToDefault: async () => {
        try {
          // 保留用户自定义的提示词
          const userPrompts = get().prompts.filter(p => !p.isSystem)
          // 合并默认提示词和用户提示词
          const resetPrompts = [...defaultPrompts, ...userPrompts]
          // 保存到存储
          await storage.resetPrompts(resetPrompts)
          set({ prompts: resetPrompts })
        } catch (error) {
          console.error('Failed to reset prompts:', error)
          toast.error('重置失败，请重试')
        }
      },

      addCategory: (category: Category) => {
        // 确保新增的分类有 custom- 前缀
        const newCategory = {
          ...category,
          id: category.id.startsWith('custom-')
            ? category.id
            : `custom-${Date.now()}`,
          isSystem: false,
        }

        set(state => ({
          categories: [...state.categories, newCategory],
        }))
      },

      updateCategory: (id: string, updates: Partial<Category>) => {
        set(state => ({
          categories: state.categories.map(cat =>
            cat.id === id ? { ...cat, ...updates } : cat
          ),
        }))
      },

      deleteCategory: (id: string) => {
        // 检查是否是系统分类
        const category = get().categories.find(cat => cat.id === id)
        if (category?.isSystem) {
          toast.error('系统分类不能删除')
          return
        }

        // 检查分类下是否有提示词
        const hasPrompts = get().prompts.some(prompt => prompt.category === id)
        if (hasPrompts) {
          toast.error('该分类下存在提示词，不能删除')
          return
        }

        // 显示确认弹窗
        if (
          !window.confirm(
            '确定要删除这个分类吗？该分类下的提示词将被移动到默认分类。'
          )
        ) {
          return
        }

        set(state => ({
          categories: state.categories.filter(cat => cat.id !== id),
          // 将该分类下的提示词移动到默认分类
          prompts: state.prompts.map(prompt =>
            prompt.category === id
              ? { ...prompt, category: 'requirement' }
              : prompt
          ),
        }))

        // 保存更新后的提示词到存储
        storage.resetPrompts(get().prompts).catch(error => {
          console.error('Failed to save prompts:', error)
          toast.error('保存失败，请重试')
        })

        toast.success('分类已删除')
      },
    }),
    {
      name: 'prompt-storage',
      onRehydrateStorage: () => state => {
        state?.initializePrompts()
      },
    }
  )
)
