"use client"

import type React from "react"

import { useState, useEffect, type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ModalFormProps {
  title: string
  description?: string
  isOpen: boolean
  onClose: () => void
  onSubmit: () => Promise<void>
  children: ReactNode
  isSubmitting: boolean
}

export function ModalForm({ title, description, isOpen, onClose, onSubmit, children, isSubmitting }: ModalFormProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  const handleClose = () => {
    if (!isSubmitting) {
      setOpen(false)
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit()
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="py-4">{children}</div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
