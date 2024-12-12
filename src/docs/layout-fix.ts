/**
 * 布局问题分析与解决方案
 *
 * 问题描述：
 * 1. 窗口大小改变时布局错乱
 * 2. 滚动区域重叠导致滚动行为异常
 * 3. 默认样式与 Tailwind 样式冲突
 *
 * 主要原因：
 * 1. Flex 布局嵌套时未正确处理高度传递
 * 2. 多个滚动容器嵌套导致滚动冲突
 * 3. Vite 默认样式与 Tailwind 样式冲突
 */

/**
 * 解决方案 1: 正确的布局结构
 * - 使用 flex-col 和 h-full 确保高度正确传递
 * - 使用 min-h-0 解决 flex 子项无法滚动的问题
 * - 使用 flex-1 确保内容区域自适应填充
 */
interface LayoutStructure {
  root: 'h-screen flex flex-col'
  main: 'flex-1 p-4 overflow-y-auto'
  content: {
    wrapper: 'flex flex-col h-full'
    nav: 'flex space-x-1'
    body: 'flex-1 mt-4 min-h-0' // min-h-0 很重要
  }
}

/**
 * 解决方案 2: 单一滚动容器
 * - 将滚动限制在单一容器内
 * - 避免嵌套的滚动容器
 */
interface ScrollContainer {
  parent: 'h-full overflow-y-auto'
  content: 'space-y-2 pr-2' // 内容间距，不处理滚动
}

/**
 * 解决方案 3: 清理样式冲突
 * - 移除 Vite 默认样式
 * - 只保留必要的 Tailwind 配置
 * - 使用 CSS 变量管理主题
 */
interface ThemeVariables {
  colors: {
    background: 'hsl(var(--background))'
    foreground: 'hsl(var(--foreground))'
    border: 'hsl(var(--border))'
    muted: 'hsl(var(--muted))'
    accent: 'hsl(var(--accent))'
  }
}

/**
 * 最佳实践
 * 1. 布局结构：
 *    - 使用语义化的 HTML 结构
 *    - 正确嵌套 flex 容器
 *    - 合理使用高度和溢出控制
 *
 * 2. 滚动处理：
 *    - 避免多个滚动容器嵌套
 *    - 使用 min-h-0 确保 flex 子项可以滚动
 *    - 为滚动容器添加适当的内边距
 *
 * 3. 样式管理：
 *    - 使用 Tailwind 的主题系统
 *    - 通过 CSS 变量管理颜色
 *    - 移除不必要的默认样式
 */

/**
 * 关键样式类说明：
 *
 * h-screen: 100vh，占满视口高度
 * flex-col: 纵向 flex 布局
 * flex-1: 占用剩余空间
 * min-h-0: 允许 flex 子项收缩到 0
 * overflow-y-auto: 垂直方向可滚动
 * space-y-2: 子元素间距
 * pr-2: 右内边距，为滚动条留空间
 */
