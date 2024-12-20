import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Directory } from '@/types'

interface DirectoryState {
  directories: Directory[]
  addDirectory: (directory: Directory) => void
  updateDirectory: (id: string, updates: Partial<Directory>) => void
  deleteDirectory: (id: string) => void
}

export const useDirectoryStore = create<DirectoryState>()(
  persist(
    (set, get) => ({
      directories: [],

      addDirectory: directory => {
        set({ directories: [...get().directories, directory] })
      },

      updateDirectory: (id, updates) => {
        set({
          directories: get().directories.map(dir =>
            dir.id === id ? { ...dir, ...updates } : dir
          ),
        })
      },

      deleteDirectory: id => {
        set({
          directories: get().directories.filter(dir => dir.id !== id),
        })
      },
    }),
    {
      name: 'directory-storage',
      version: 1,
    }
  )
)
