import type { ButtonHTMLAttributes } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

// ... 其他代码保持不变 ...
