'use client'

import React, { useState, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { createWorker } from 'tesseract.js'
import { Camera, Upload, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Binary, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface WaterMeterOCRModalProps {
  isOpen: boolean
  onClose: () => void
  onDetectedValue: (value: number) => void
}

export function WaterMeterOCRModal({ isOpen, onClose, onDetectedValue }: WaterMeterOCRModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [statusText, setStatusText] = useState<string>('')
  const [detectedNumbers, setDetectedNumbers] = useState<number[]>([])
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImageFile(file)
    }
  }

  const processImageFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      setImageSrc(src)
      performOCR(src)
    }
    reader.readAsDataURL(file)
  }

  const performOCR = async (image: string) => {
    setIsScanning(true)
    setProgress(0)
    setStatusText('Initializing OCR engine...')
    setDetectedNumbers([])
    setSelectedNumber(null)

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setStatusText('Analyzing water meter numbers...')
            setProgress(Math.round(m.progress * 100))
          } else if (m.status === 'loading tesseract core') {
            setStatusText('Loading vision engine...')
          } else if (m.status === 'initializing tesseract') {
            setStatusText('Preparing analyzer...')
          }
        },
      })

      // Set parameters to optimize for digits
      await worker.setParameters({
        tessedit_char_whitelist: '012456789',
      })

      const { data: { text } } = await worker.recognize(image)
      await worker.terminate()

      // Extract all sequences of 3 to 8 digits
      const matches = text.match(/\b\d{3,8}\b/g)
      
      if (matches && matches.length > 0) {
        // Convert to numbers and filter duplicates
        const nums = Array.from(new Set(matches.map(n => parseInt(n, 10)))).filter(n => !isNaN(n))
        setDetectedNumbers(nums)
        if (nums.length > 0) {
          // Default select the largest digit sequence (usually the cumulative meter reading)
          const bestCandidate = Math.max(...nums)
          setSelectedNumber(bestCandidate)
          toast.success(`Detected ${nums.length} candidate meter values!`)
        } else {
          toast.warning('No clear meter reading digits detected. Please try a clearer picture.')
        }
      } else {
        // Fallback: extract all digits from whole text
        const digitsOnly = text.replace(/\D/g, '')
        if (digitsOnly.length >= 3) {
          const val = parseInt(digitsOnly.slice(0, 7), 10)
          setDetectedNumbers([val])
          setSelectedNumber(val)
          toast.success('Extracted meter numbers successfully!')
        } else {
          toast.error('Could not auto-detect numeric reading from this image. Try taking a closer photo of the meter dial.')
        }
      }
    } catch (err) {
      console.error('OCR Error:', err)
      toast.error('Error scanning image. Please ensure image is clear.')
    } finally {
      setIsScanning(false)
    }
  }

  const handleApply = () => {
    if (selectedNumber !== null) {
      onDetectedValue(selectedNumber)
      toast.success(`Meter reading updated to ${selectedNumber.toLocaleString()} L!`)
      onClose()
    } else {
      toast.error('Please select or verify a detected number.')
    }
  }

  const handleReset = () => {
    setImageSrc(null)
    setDetectedNumbers([])
    setSelectedNumber(null)
    setProgress(0)
    setIsScanning(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Water Meter OCR Scanner">
      <div className="space-y-5">
        
        {/* Hidden inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {!imageSrc ? (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="h-14 w-14 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Sparkles className="h-7 w-7 animate-pulse text-brand-600" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800 mb-1">
              Capture or Upload Meter Photo
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
              Take a clear picture of the physical water meter dial. Our AI scanner will automatically extract the reading value.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="bg-brand-600 hover:bg-brand-700 text-white gap-2 text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer shadow-sm"
              >
                <Camera className="h-4 w-4" />
                <span>Snap Meter Camera Photo</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer border-slate-200 hover:bg-white"
              >
                <Upload className="h-4 w-4 text-slate-600" />
                <span>Upload from Gallery</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview Container */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-56 flex items-center justify-center group">
              <img
                src={imageSrc}
                alt="Water meter snapshot"
                className={`max-h-56 w-auto object-contain transition-opacity duration-300 ${isScanning ? 'opacity-40' : 'opacity-100'}`}
              />

              {/* Scanning Laser Animation Overlay */}
              {isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs text-white">
                  <div className="w-full max-w-xs space-y-3 text-center">
                    <RefreshCw className="h-8 w-8 text-brand-400 animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold tracking-wide text-white">{statusText}</p>
                      <p className="text-[11px] font-bold text-brand-300">{progress}% Completed</p>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-brand-500 to-indigo-500 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Reset image button */}
              {!isScanning && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg backdrop-blur-md transition-all cursor-pointer flex items-center gap-1 border border-white/10"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retake</span>
                </button>
              )}
            </div>

            {/* Results Section */}
            {!isScanning && (
              <div className="space-y-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Binary className="h-4 w-4 text-brand-600" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Detected Meter Values
                    </span>
                  </div>
                  {detectedNumbers.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      Click to select
                    </span>
                  )}
                </div>

                {detectedNumbers.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {detectedNumbers.map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSelectedNumber(num)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedNumber === num
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 ring-2 ring-brand-500/30 scale-105'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                        }`}
                      >
                        {selectedNumber === num && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                        <span>{num.toLocaleString()} L</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200/60 font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>No clear numbers extracted. Try taking another photo with direct light on the meter numbers.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} className="text-xs font-bold">
            Cancel
          </Button>
          {imageSrc && !isScanning && (
            <Button
              type="button"
              onClick={handleApply}
              disabled={selectedNumber === null}
              className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-5 rounded-xl cursor-pointer shadow-sm"
            >
              Apply {selectedNumber ? `${selectedNumber.toLocaleString()} L` : 'Value'} to Form
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
