//this is a nikworld custom component

import * as React from "react"

import { cn } from "@/lib/utils"

const BookFace = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-foreground text-background shadow place-content-center justify-items-center uppercase",
      className
    )}
    {...props}
  />
))
BookFace.displayName = "BookFace"

const BookFaceHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
BookFaceHeader.displayName = "BookFaceHeader"

const BookFaceTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-2xl max-w-[240px] leading-none tracking-tight text-wrap h-[200px]", className)}
    {...props}
  />
))
BookFaceTitle.displayName = "BookFaceTitle"

const BookFaceDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xl max-w-[240px] text-center leading-none tracking-tight text-wrap text-background", className)}
    {...props}
  />
))
BookFaceDescription.displayName = "BookFaceDescription"

const BookFaceContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
BookFaceContent.displayName = "BookFaceContent"

const BookFaceFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
BookFaceFooter.displayName = "BookFaceFooter"

export { BookFace, BookFaceHeader, BookFaceFooter, BookFaceTitle, BookFaceDescription, BookFaceContent }
