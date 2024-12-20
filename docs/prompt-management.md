# 提示词管理最佳实践

## 目录结构

```
src/
├── config/
│   ├── directories.ts    # 分类目录配置
│   ├── system-prompts.json    # 提示词数据
│   └── prompts.ts    # 提示词加载逻辑
└── types/
    └── index.ts    # 类型定义
```

## 添加新分类

1. 在 `directories.ts` 中添加分类配置：

```typescript
export const productDirectories: Directory[] = [
  {
    id: 'new-category', // 分类ID，用于关联提示词
    name: '新分类名称', // 显示名称
    type: 'product', // 固定为 'product'
  },
  // ... 其他分类
]
```

2. 在 `system-prompts.json` 中创建对应分类的数组：

```json
{
  "requirement": [...],
  "new-category": []  // 新分类的提示词数组
}
```

3. 在 `prompts.ts` 中加载新分类：

```typescript
export const defaultPrompts: ProductPrompt[] = [
  ...systemPrompts.requirement.map(prompt =>
    processPrompt(prompt as ProductPrompt)
  ),
  ...systemPrompts['new-category'].map(prompt =>
    processPrompt(prompt as ProductPrompt)
  ),
]

// 添加日志
console.log('Loaded prompts:', {
  requirement: systemPrompts.requirement.length,
  'new-category': systemPrompts['new-category'].length,
})
```

## 添加新提示词

1. 在 `system-prompts.json` 中添加提示词：

```json
{
  "category-name": [
    {
      "id": "unique-id", // 唯一ID，建议使用分类前缀
      "title": "提示词标题", // 显示标题
      "content": "提示词内容", // 具体内容
      "directory": "category-name", // 对应的分类ID
      "category": "category-name", // 同上
      "author": "System", // 作者
      "isSystem": true, // 是否为系统预设
      "type": "product" // 固定为 'product'
    }
  ]
}
```

## 提示词类型定义

```typescript
export interface ProductPrompt {
  id: string
  title: string
  content: string
  directory: string
  category: string
  author: string
  authorUrl?: string
  authorAvatar?: string
  isSystem: boolean
  type: 'product'
  createTime: number
  updateTime: number
}
```

## 注意事项

1. ID 命名规范

   - 使用分类前缀，如 `req-001`, `dep-001`
   - 保持 ID 的唯一性

2. 目录关联

   - `directory` 和 `category` 必须与 `directories.ts` 中的 `id` 对应
   - 确保分类在 `directories.ts` 中已定义

3. 内容格式

   - 使用 `\n` 作为换行符
   - 保持内容格式的一致性
   - 避免特殊字符导致的解析错误

4. 加载顺序

   - 在 `prompts.ts` 中按照合理的顺序加载分类
   - 确保所有分类都被正确加载

5. 类型检查
   - 使用 TypeScript 类型定义确保数据结构正确
   - 添加新字段时更新类型定义

## 测试验证

1. 检查分类显示

   - 确认新分类在侧边栏正确显示
   - 验证分类名称和顺序是否正确

2. 检查提示词

   - 确认提示词在对应分类下显示
   - 验证提示词内容是否正确渲染

3. 控制台日志
   - 查看 `console.log` 输出的加载统计
   - 确认提示词数量正确

## 常见问题

1. 分类不显示

   - 检查 `directories.ts` 中的分类定义
   - 确认 `system-prompts.json` 中有对应的分类数组

2. 提示词不显示

   - 检查提示词的 `directory` 和 `category` 是否正确
   - 确认 `prompts.ts` 中已加载该分类

3. 类型错误
   - 确保提示词对象符合 `ProductPrompt` 类型定义
   - 检查必填字段是否完整
