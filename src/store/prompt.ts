import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProductPrompt } from '@/types'

interface PromptState {
  prompts: ProductPrompt[]
  addPrompt: (prompt: ProductPrompt) => void
  updatePrompt: (prompt: ProductPrompt) => void
  deletePrompt: (id: string) => void
  movePrompt: (id: string, category: string) => void
}

export const usePromptStore = create<PromptState>()(
  persist(
    set => ({
      prompts: [],
      addPrompt: prompt =>
        set(state => ({
          prompts: [...state.prompts, prompt],
        })),
      updatePrompt: prompt =>
        set(state => ({
          prompts: state.prompts.map(p =>
            p.id === prompt.id ? { ...p, ...prompt } : p
          ),
        })),
      deletePrompt: id =>
        set(state => ({
          prompts: state.prompts.filter(p => p.id !== id),
        })),
      movePrompt: (id, category) =>
        set(state => ({
          prompts: state.prompts.map(p =>
            p.id === id ? { ...p, category } : p
          ),
        })),
    }),
    {
      name: 'prompt-storage',
    }
  )
)
