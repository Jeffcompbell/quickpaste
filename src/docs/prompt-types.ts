/**
 * 提示词数据结构定义
 */

/**
 * 系统提示词分类
 */
export type SystemCategory = 'requirement' | 'debug' | 'deployment' | 'summary'

/**
 * 提示词分类
 */
export type Category = SystemCategory | string

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

  /** 作者 */
  author: string

  /** 作者 URL */
  authorUrl?: string

  /** 是否为系统提示词 */
  isSystem?: boolean

  /** 创建时间 */
  createdAt: number

  /** 更新时间 */
  updatedAt: number
}
