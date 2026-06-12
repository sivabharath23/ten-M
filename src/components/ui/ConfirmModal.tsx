'use client'

import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={type === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        {type === 'danger' && (
          <div className="h-10 w-10 rounded-full bg-danger-50 border border-danger-100 flex items-center justify-center text-danger-500 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
        )}
        {type === 'warning' && (
          <div className="h-10 w-10 rounded-full bg-warning-50 border border-warning-100 flex items-center justify-center text-warning-700 shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
        )}
        {type === 'info' && (
          <div className="h-10 w-10 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
            <Info className="h-5 w-5" />
          </div>
        )}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800">{message}</p>
          <p className="text-xs text-slate-400">This action cannot be undone.</p>
        </div>
      </div>
    </Modal>
  )
}
