import { type ComponentType, type FC, type ReactNode } from 'react'

export interface MenuItemState {
  name: string
  isActive: boolean
  label?: string
}

export interface MenuItemProps {
  name: string
  component?: ReactNode | ComponentType
  children?: ReactNode
  label?: string
  render?: (state: MenuItemState) => ReactNode
}

export const MenuItem: FC<MenuItemProps> = () => null
