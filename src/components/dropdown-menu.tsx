import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { ReactNode } from 'react'

interface DropdownMenuProps {
  children: ReactNode
  trigger: ReactNode
}

export function DropdownMenuRoot({ children, trigger }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className="min-w-[160px] bg-[#1C1C1E] backdrop-blur-xl border border-[#3A3A3C] rounded-lg p-1 shadow-lg"
          sideOffset={4}
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}

interface DropdownMenuItemProps {
  children: ReactNode
  onSelect?: () => void
}

export function DropdownMenuItem({
  children,
  onSelect,
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className="flex items-center px-3 py-2 text-[13px] rounded-md text-[#FAFAFA] hover:bg-[#3A3A3C] focus:bg-[#3A3A3C] cursor-default select-none outline-none data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
      onSelect={onSelect}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  )
}
