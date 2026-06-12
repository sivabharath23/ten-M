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
  let headerIcon: React.ReactNode = undefined
  if (type === 'danger') {
    headerIcon = <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
  } else if (type === 'warning') {
    headerIcon = <AlertCircle className="h-5 w-5 text-warning-600 shrink-0" />
  } else if (type === 'info') {
    headerIcon = <Info className="h-5 w-5 text-blue-500 shrink-0" />
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={headerIcon}
      footer={
        <>
          <Button
            variant="cancel"
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
      <div className="space-y-2 py-1">
        <p className="text-sm font-semibold text-slate-700 leading-relaxed">{message}</p>
        {type === 'danger' && (
          <p className="text-xs text-slate-400 font-medium">This action cannot be undone.</p>
        )}
      </div>
    </Modal>
  )
}

