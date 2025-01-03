# 对话框交互问题修复记录

## 问题描述1

在编辑提示词时，存在以下问题：

1. 对话框关闭后，页面上的其他元素无法点击
2. 保存成功时出现两个重复的 toast 提示
3. 控制台显示警告，提示缺少 `Description` 或 `aria-describedby`

## 问题原因

1. 对话框的状态管理不当，导致遮罩层没有正确移除
2. 事件处理和状态更新的时序问题
3. 组件实现过于复杂，包含了不必要的状态管理和动画效果
4. DOM 清理不彻底，导致遮罩层残留
5. Toast 提示在多个组件中重复触发

## 解决方案

### 尝试方案 1：优化状态更新顺序

修改 `handleSubmit` 函数，确保状态更新的顺序正确：

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (isSubmitting || !prompt || !onSave) return

  try {
    setIsSubmitting(true)
    await onSave(editedPrompt)
    // 先重置状态
    setFormState({ title: '', content: '', category: '' })
    setIsSubmitting(false)
    // 最后关闭对话框
    onOpenChange(false)
  } catch (error) {
    console.error('Failed to save prompt:', error)
    toast.error('保存失败，请重试')
    setIsSubmitting(false)
  }
}
```

结果：未能解决问题，页面仍然无法交互。

### 尝试方案 2：使用 Portal 和 cleanup 函数

添加 cleanup 函数来处理对话框的打开/关闭状态：

```typescript
useEffect(() => {
  if (open) {
    document.body.style.overflow = 'hidden'
  }

  return () => {
    document.body.style.overflow = ''
    setFormState({ title: '', content: '', category: '' })
    setIsSubmitting(false)
  }
}, [open])
```

结果：对话框无法正常显示。

### 最终解决方案：主动清理 DOM 和状态

1. 添加专门的 DOM 清理逻辑
2. 使用 `onCloseAutoFocus` 确保对话框关闭后恢复交互
3. 在 `finally` 块中确保状态重置
4. 使用 `Dialog.Close` 组件正确处理关闭
5. 移除重复的 toast 提示

关键代码：

```typescript
// 在 prompt-list.tsx 中移除重复的 toast
const handleEdit = useCallback(
  async (prompt: ProductPrompt) => {
    try {
      await updatePrompt(prompt)
      // 移除这里的 toast，因为在对话框中已经有了
    } catch (error) {
      console.error('Failed to update prompt:', error)
      toast.error('保存失败')
    }
  },
  [updatePrompt]
)

// 在 prompt-edit-dialog.tsx 中保留 toast
try {
  setIsSubmitting(true)
  await onSave(editedPrompt)
  onOpenChange(false)
  toast.success('保存成功') // 只在这里显示成功提示
} catch (error) {
  console.error('Failed to save prompt:', error)
  toast.error('保存失败，请重试')
} finally {
  setIsSubmitting(false)
  setFormState({
    title: '',
    content: '',
    category: '',
  })
}
```

## 经验总结

1. 保持组件实现简单，避免不必要的复杂性
2. 正确使用 Dialog 组件的 API，不要过度封装
3. 确保状态更新的顺序正确
4. 主动清理 DOM 元素和状态
5. 使用 `setTimeout` 确保动画完成后再清理
6. 使用 `onCloseAutoFocus` 处理对话框关闭后的交互恢复
7. 在 `finally` 块中确保状态重置
8. 避免在多个组件中重复触发相同的提示

## 相关文件

- `src/components/prompt-edit-dialog.tsx`
- `src/components/prompt-card.tsx`
- `src/store/prompt.ts`

## 参考资料

- [Radix UI Dialog Documentation](https://www.radix-ui.com/docs/primitives/components/dialog)
- [React State Management Best Practices](https://react.dev/learn/managing-state)
- [DOM Cleanup in React](https://react.dev/learn/synchronizing-with-effects#step-3-add-cleanup-if-needed)
