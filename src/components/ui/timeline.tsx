import * as React from "react"
import { cn } from '@/lib/utils';

const Timeline = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative space-y-4", className)}
    {...props}
  />
))
Timeline.displayName = "Timeline"

const TimelineItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative flex gap-4", className)}
    {...props}
  />
))
TimelineItem.displayName = "TimelineItem"

const TimelineOppositeContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-[0.2] text-right", className)}
    {...props}
  />
))
TimelineOppositeContent.displayName = "TimelineOppositeContent"

const TimelineSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col items-center relative", className)}
    {...props}
  />
))
TimelineSeparator.displayName = "TimelineSeparator"

interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: 'default' | 'primary' | 'secondary' | 'warning' | 'grey'
}

const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, color = 'default', children, ...props }, ref) => {
    const colorClasses = {
      default: "bg-gray-400 text-gray-900",
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      warning: "bg-amber-500 text-white",
      grey: "bg-gray-300 text-gray-700"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center rounded-full w-8 h-8 z-10",
          colorClasses[color],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TimelineDot.displayName = "TimelineDot"

const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-0.5 bg-border flex-1 min-h-4 mt-1",
      className
    )}
    {...props}
  />
))
TimelineConnector.displayName = "TimelineConnector"

const TimelineContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 pb-8", className)}
    {...props}
  />
))
TimelineContent.displayName = "TimelineContent"

export {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
}

