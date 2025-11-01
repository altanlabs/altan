import * as React from "react"
import { cn } from '@/lib/utils';

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  component?: React.ElementType
}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ component: Component = 'div', className = '', children, ...props }, ref) => {
    return (
      <Component 
        ref={ref}
        className={cn(className)} 
        {...props}
      >
        {children}
      </Component>
    )
  }
)
Box.displayName = "Box"

export { Box }

