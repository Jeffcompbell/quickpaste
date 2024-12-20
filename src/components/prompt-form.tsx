import * as Dialog from '@radix-ui/react-dialog'

export function PromptForm() {
  return (
    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white/95 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200">
      <div className="p-6">
        <Dialog.Title className="text-xl font-semibold text-gray-900">
          新建提示词
        </Dialog.Title>

        <div className="mt-6 space-y-4">
          {/* 标题输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">标题</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded-md"
              placeholder="输入提示词标题"
            />
          </div>

          {/* 内容输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">内容</label>
            <textarea
              className="w-full h-32 px-3 py-2 border border-gray-200 rounded-md resize-none"
              placeholder="输入提示词内容"
            />
          </div>

          {/* 目录选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">目录</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-md">
              <option value="default">默认目录</option>
              {/* 其他目录选项 */}
            </select>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
        <Dialog.Close asChild>
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700">
            取消
          </button>
        </Dialog.Close>
        <button className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90">
          确定
        </button>
      </div>
    </Dialog.Content>
  )
}
