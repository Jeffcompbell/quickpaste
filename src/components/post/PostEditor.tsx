import { useState } from 'react'
import type { Category } from '@/types'
import CategorySelector from '../category/CategorySelector'

export function PostEditor() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category.name)
    setShowCategoryModal(false)
  }

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">分类</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={selectedCategory}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="选择分类"
          />
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            选择
          </button>
        </div>
      </div>

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-96">
            <CategorySelector
              onSelect={handleCategorySelect}
              onClose={() => setShowCategoryModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
