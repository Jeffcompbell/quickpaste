import { cn } from '@/lib/utils'

const tools = [
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

export function ToolsGrid() {
  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {tools.map(tool => (
        <button
          key={tool.title}
          onClick={() => handleOpenUrl(tool.url)}
          className="group relative flex flex-col p-6 rounded-xl transition-all duration-200 text-left"
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
            backdropFilter: 'blur(8px)',
            boxShadow:
              '0 4px 24px -1px rgba(0, 0, 0, 0.04), 0 0 1px 0 rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{tool.icon}</span>
              <div>
                <h3 className="text-base font-medium text-gray-900 group-hover:text-gray-700">
                  {tool.title}
                </h3>
                <div className="flex gap-2 mt-1">
                  {tool.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">
            {tool.description}
          </p>
          <div
            className="absolute inset-0 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100"
            style={{
              background:
                'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2))',
              boxShadow:
                '0 8px 32px -2px rgba(0, 0, 0, 0.08), 0 0 1px 0 rgba(0, 0, 0, 0.12)',
              transform: 'translateY(-2px)',
            }}
          />
        </button>
      ))}
    </div>
  )
}
