import type { Directory } from '@/types'

export const productDirectories: Directory[] = [
  {
    id: 'requirement',
    name: '需求编写与分析',
    type: 'product',
  },
  {
    id: 'debug',
    name: 'Bug修复与调试',
    type: 'product',
  },
  {
    id: 'deployment',
    name: 'Git与部署上线',
    type: 'product',
  },
  {
    id: 'summary',
    name: '总结与规范文档',
    type: 'product',
  },
]

export const cursorDirectories = productDirectories
