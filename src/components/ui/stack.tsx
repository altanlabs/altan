import * as React from "react"
import { cn } from '@/lib/utils';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  spacing?: number | string
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ 
    direction = 'column', 
    spacing = 2, 
    alignItems, 
    justifyContent,
    children, 
    className = '', 
    ...props 
  }, ref) => {
    // Map direction to Tailwind classes
    const directionClass = {
      'row': 'flex-row',
      'column': 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'column-reverse': 'flex-col-reverse',
    }[direction]

    // Map spacing to Tailwind gap classes
    const gapClass = typeof spacing === 'number' ? `gap-${spacing}` : spacing

    // Map alignment classes
    const alignClass = alignItems ? {
      'start': 'items-start',
      'center': 'items-center',
      'end': 'items-end',
      'stretch': 'items-stretch',
      'baseline': 'items-baseline',
    }[alignItems] : ''

    const justifyClass = justifyContent ? {
      'start': 'justify-start',
      'center': 'justify-center',
      'end': 'justify-end',
      'between': 'justify-between',
      'around': 'justify-around',
      'evenly': 'justify-evenly',
    }[justifyContent] : ''

    return (
      <div 
        ref={ref}
        className={cn('flex', directionClass, gapClass, alignClass, justifyClass, className)} 
        {...props}
      >
        {children}
      </div>
    )
  }
)
Stack.displayName = "Stack"

export { Stack }

