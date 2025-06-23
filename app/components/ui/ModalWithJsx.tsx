"use client"

import { ReactNode } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface ModalWithJSXProps {
  title: string
  description: ReactNode
  footer?: ReactNode
  open?: boolean
  onClose?: () => void
}

export const ModalWithJSX = ({
  title,
  description,
  footer,
  open = true,
  onClose,
}: ModalWithJSXProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">{description}</div>
          </DialogDescription>
        </DialogHeader>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}
