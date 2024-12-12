/**
 * 提示词数据结构定义
 */

/**
 * 提示词分类
 */
export type Category = 'cursor-chat' | 'cursor-product' | 'system-prompt'

/**
 * 提示词目录
 */
export type Directory = 'default' | 'custom'

/**
 * 提示词接口定义
 */
export interface Prompt {
  /** 唯一标识符 */
  id: string

  /** 提示词标题 */
  title: string

  /** 提示词内容 */
  content: string

  /** 所属分类 */
  category: Category

  /** 所属目录 */
  directory?: Directory

  /** 排序顺序 */
  order: number

  /** 创建时间 */
  createdAt: number

  /** 更新时间 */
  updatedAt: number
}

/**
 * 示例提示词数据
 */
const examplePrompt: Prompt = {
  id: crypto.randomUUID(),
  title: '代码审查',
  content: '请帮我审查以下代码，指出潜在的问题和改进建议...',
  category: 'cursor-chat',
  directory: 'default',
  order: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

/**
 * 新建提示词函数参数
 */
export interface CreatePromptInput {
  title: string
  content: string
  category: Category
  directory?: Directory
}

/**
 * 更新提示词函数参数
 */
export interface UpdatePromptInput {
  id: string
  title?: string
  content?: string
  category?: Category
  directory?: Directory
}

/**
 * Store 操作示例：
 *
 * // 新建提示词
 * const newPrompt = addPrompt({
 *   title: '代码审查',
 *   content: '请帮我审查以下代码...',
 *   category: 'cursor-chat'
 * })
 *
 * // 更新提示词
 * updatePrompt({
 *   id: 'prompt-id',
 *   title: '更新后的标题'
 * })
 *
 * // 删除提示词
 * deletePrompt('prompt-id')
 *
 * // 重新排序
 * reorderPrompt('prompt-id-1', 'prompt-id-2', 'cursor-chat')
 */
