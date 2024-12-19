import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Directory {
  id: string
  name: string
  icon?: string
  order: number
}

interface DirectoryStore {
  directories: Directory[]
  addDirectory: (name: string) => void
  updateDirectory: (id: string, name: string) => void
  deleteDirectory: (id: string) => boolean
  hasContent: (id: string) => boolean
}

export const useDirectoryStore = create<DirectoryStore>()(
  persist(
    (set, get) => ({
      directories: [
        { id: 'default', name: '默认目录', order: 0 },
        { id: 'code', name: '代码片段', order: 1 },
        { id: 'text', name: '文本模板', order: 2 },
      ],

      addDirectory: (name: string) => {
        const id = Date.now().toString()
        const maxOrder = Math.max(...get().directories.map(dir => dir.order), 0)
        set(state => ({
          directories: [
            ...state.directories,
            { id, name, order: maxOrder + 1 },
          ],
        }))
      },

      updateDirectory: (id: string, name: string) => {
        set(state => ({
          directories: state.directories.map(dir =>
            dir.id === id ? { ...dir, name } : dir
          ),
        }))
      },

      deleteDirectory: (id: string) => {
        // 检查是否有内容
        if (get().hasContent(id)) {
          return false
        }

        set(state => ({
          directories: state.directories.filter(dir => dir.id !== id),
        }))
        return true
      },

      hasContent: (directoryId: string) => {
        // TODO: 检查目录下是否有内容
        // 这里需要和 prompt store 集成
        return false
      },
    }),
    {
      name: 'directory-storage',
    }
  )
)
