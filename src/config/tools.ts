export interface Tool {
  title: string
  description: string
  url: string
  icon: string
  tags: string[]
}

export const tools: Tool[] = [
  {
    title: 'ChatGPT',
    description: 'OpenAI 开发的大型语言模型，提供智能对话服务',
    url: 'https://chat.openai.com',
    icon: '🤖',
    tags: ['AI对话', '写作助手'],
  },
  {
    title: 'Midjourney',
    description: 'AI 艺术创作工具，将文字转换为精美图像',
    url: 'https://www.midjourney.com',
    icon: '🎨',
    tags: ['AI绘画', '设计'],
  },
  {
    title: 'Claude',
    description: 'Anthropic 开发的 AI 助手，擅长分析和写作',
    url: 'https://claude.ai',
    icon: '📝',
    tags: ['AI对话', '分析'],
  },
  {
    title: 'Stable Diffusion',
    description: '开源的 AI 图像生成模型，支持本地部署',
    url: 'https://stability.ai',
    icon: '🖼️',
    tags: ['AI绘画', '开源'],
  },
  {
    title: 'Gemini',
    description: 'Google 最新的多模态 AI 模型',
    url: 'https://gemini.google.com',
    icon: '🌟',
    tags: ['AI对话', '多模态'],
  },
  {
    title: 'Copilot',
    description: 'GitHub 的 AI 编程助手，提供代码建议',
    url: 'https://github.com/features/copilot',
    icon: '👨‍💻',
    tags: ['编程', 'AI助手'],
  },
  {
    title: 'Runway',
    description: 'AI 视频编辑和生成工具',
    url: 'https://runway.ml',
    icon: '🎥',
    tags: ['视频编辑', 'AI生成'],
  },
  {
    title: 'Hugging Face',
    description: 'AI 模型和数据集共享平台',
    url: 'https://huggingface.co',
    icon: '🤗',
    tags: ['AI模型', '开源'],
  },
  {
    title: 'Perplexity AI',
    description: 'AI 驱动的智能搜索引擎',
    url: 'https://www.perplexity.ai',
    icon: '🔍',
    tags: ['搜索', 'AI助手'],
  },
  {
    title: 'Cursor',
    description: 'AI 驱动的新一代代码编辑器',
    url: 'https://cursor.sh',
    icon: '⌨️',
    tags: ['编程', 'IDE'],
  },
]
