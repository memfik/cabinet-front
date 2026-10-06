"use client"

import * as React from "react"
import {Dialog as DialogPrimitive} from "@base-ui/react/dialog"

import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {XIcon} from "lucide-react"

function Dialog({...props}: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({...props}: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({...props}: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({...props}: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({className, ...props}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 isolate z-50 bg-black/25 duration-100 supports-backdrop-filter:backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          // на мобилке (<640px) все диалоги разворачиваются на весь экран
          "bg-popover/75 text-popover-foreground ring-foreground/10 bg-linear-to-b from-white/50 to-transparent shadow-2xl backdrop-blur-2xl dark:from-white/10 backdrop-saturate-150 dark:ring-white/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 rounded-3xl p-6 text-sm ring-1 duration-100 outline-none sm:max-w-sm max-sm:top-0 max-sm:left-0 max-sm:flex max-sm:h-dvh max-sm:max-h-dvh max-sm:w-screen max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:flex-col max-sm:overflow-y-auto max-sm:rounded-none",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={<Button variant="ghost" className="text-muted-foreground hover:text-foreground absolute top-4 right-4 rounded-full" size="icon-sm" />}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({className, ...props}: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        // кнопки в футере диалога всегда крупные: 40px на десктопе, 48px на мобилке
        "bg-foreground/5 -mx-6 -mb-6 flex flex-col-reverse gap-2 rounded-b-3xl border-t border-foreground/10 px-6 py-4 sm:flex-row sm:justify-end max-sm:mt-auto max-sm:rounded-b-none max-sm:pb-[calc(1rem+env(safe-area-inset-bottom))] [&>button]:h-10 [&>button]:rounded-xl [&>button]:px-5 [&>button]:text-sm max-sm:[&>button]:h-12 max-sm:[&>button]:text-[15px]",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && <DialogPrimitive.Close render={<Button variant="outline" />}>Close</DialogPrimitive.Close>}
    </div>
  )
}

function DialogTitle({className, ...props}: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-heading text-xl leading-tight font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function DialogDescription({className, ...props}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-muted-foreground *:[a]:hover:text-foreground text-sm *:[a]:underline *:[a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
