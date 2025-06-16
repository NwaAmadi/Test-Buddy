import React from "react"
import { Button } from "@/components/ui/button"

interface ModalProps {
  title: string
  description: string
  onClose?: () => void
}

export const Modal: React.FC<ModalProps> = ({ title, description, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{description}</p>
        {onClose && (
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}