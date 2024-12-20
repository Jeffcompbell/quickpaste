import { tools } from '@/config/tools'
import type { Tool } from '@/config/tools'

export function ToolsGrid() {
  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {tools.map((tool: Tool) => (
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
