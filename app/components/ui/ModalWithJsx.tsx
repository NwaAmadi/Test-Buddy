"use client"

import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ModalWithJSXProps {
  title: string
  description: ReactNode
  footer?: ReactNode
  open?: boolean
  onForceClose?: () => void // 👈 new prop
}

export const ModalWithJSX = ({
  title,
  description,
  footer,
  open = true,
  onForceClose,
}: ModalWithJSXProps) => {
  const router = useRouter()

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onForceClose?.() ?? router.push("/student/dashboard")
        }
      }}
    >
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
