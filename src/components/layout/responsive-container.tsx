import React from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ResponsiveContainer({
  children,
  className,
  ...props
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        "container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}