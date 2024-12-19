import { FolderIcon } from '@/components/icons'
import type { Directory } from '@/types'

// 对话提示词的目录
export const cursorDirectories: Directory[] = [
  {
    id: 'default',
    name: '默认目录',
    icon: <FolderIcon className="w-4 h-4" />,
    type: 'cursor',
  },
  {
    id: 'code',
    name: '代码片段',
    icon: <FolderIcon className="w-4 h-4" />,
    type: 'cursor',
  },
  {
    id: 'text',
    name: '文本模板',
    icon: <FolderIcon className="w-4 h-4" />,
    type: 'cursor',
  },
]

// 产品提示词的目录
export const productDirectories: Directory[] = [
  {
    id: 'frontend',
    name: '前端开发',
    icon: <FolderIcon className="w-4 h-4" />,
    type: 'product',
  },
  {
    id: 'backend',
    name: '后端开发',
    icon: <FolderIcon className="w-4 h-4" />,
    type: 'product',
  },
  {
    id: 'mobile',
    name: '移动开发',
    icon: <FolderIcon className="w-4 h-4" />,
    type: 'product',
  },
]
