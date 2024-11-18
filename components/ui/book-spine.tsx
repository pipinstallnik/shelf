//this is a nikworld custom component

import * as React from "react"

import { cn } from "@/lib/utils"

const BookSpine = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-foreground text-background shadow p-2  uppercase",
      className
    )}
    {...props}
  />
))
BookSpine.displayName = "BookSpine"

const BookSpineHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-row gap-2 h-[48px] w-[350px] justify-between line-clamp-2", className)}
    {...props}
  />
))
BookSpineHeader.displayName = "BookSpineHeader"

const BookSpineTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-2xl max-w-[300px] leading-none tracking-tight text-ellipsis", className)}
    {...props}
  />
))
BookSpineTitle.displayName = "BookSpineTitle"

const BookSpineDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xl max-w-[240px] text-center leading-none tracking-tight text-wrap text-background", className)}
    {...props}
  />
))
BookSpineDescription.displayName = "BookSpineDescription"

const BookSpineContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
BookSpineContent.displayName = "BookSpineContent"

const BookSpineFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
BookSpineFooter.displayName = "BookSpineFooter"

export { BookSpine, BookSpineHeader, BookSpineFooter, BookSpineTitle, BookSpineDescription, BookSpineContent }
