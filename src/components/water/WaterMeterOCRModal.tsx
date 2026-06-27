'use client'

import React, { useState, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createWorker, PSM } from 'tesseract.js'
import { Camera, Upload, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Binary, Edit3, Sliders } from 'lucide-react'
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
  const [manualInputValue, setManualInputValue] = useState<string>('')

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
      performOCRWithPreprocessing(src)
    }
    reader.readAsDataURL(file)
  }

  // Pre-process image on canvas to boost contrast & binarize for meter dial dials
  const preprocessImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(imageSrc)
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Convert to grayscale & contrast enhancement
        const contrast = 1.4 // Contrast boost multiplier
        const intercept = 128 * (1 - contrast)

        for (let i = 0; i < data.length; i += 4) {
          // Grayscale weighting (r * 0.299 + g * 0.587 + b * 0.114)
          let gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
          // Apply contrast adjustment
          gray = contrast * gray + intercept
          // Clamp to 0-255
          gray = Math.max(0, Math.min(255, gray))

          // Simple thresholding for high contrast black/white
          const threshold = 130
          const finalVal = gray > threshold ? 255 : 0

          data[i] = finalVal     // R
          data[i + 1] = finalVal // G
          data[i + 2] = finalVal // B
        }

        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => resolve(imageSrc)
      img.src = imageSrc
    })
  }

  const performOCRWithPreprocessing = async (originalImageSrc: string) => {
    setIsScanning(true)
    setProgress(0)
    setStatusText('Optimizing image contrast for meter dial...')
    setDetectedNumbers([])
    setManualInputValue('')

    try {
      // Step 1: Preprocess image for OCR
      const processedImageSrc = await preprocessImage(originalImageSrc)

      // Step 2: Initialize Tesseract worker
      setStatusText('Initializing OCR vision engine...')
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setStatusText('Extracting digits from water meter dial...')
            setProgress(Math.round(m.progress * 100))
          } else if (m.status === 'loading tesseract core') {
            setStatusText('Loading OCR engine...')
          }
        },
      })

      // Set parameters for digit extraction (fixed missing 3!)
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789',
        tessedit_pageseg_mode: PSM.SINGLE_LINE, // Single line layout for meter counters
      })

      // Run OCR on processed high-contrast image
      const resProcessed = await worker.recognize(processedImageSrc)
      
      // Run fallback OCR on original image to capture raw colors
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO,
      })
      const resOriginal = await worker.recognize(originalImageSrc)
      await worker.terminate()

      const combinedText = `${resProcessed.data.text} ${resOriginal.data.text}`

      // Extract numeric digit sequences (3 to 8 digits)
      const matches = combinedText.match(/\b\d{3,8}\b/g)
      
      let candidateNumbers: number[] = []
      if (matches && matches.length > 0) {
        candidateNumbers = Array.from(new Set(matches.map(n => parseInt(n, 10)))).filter(n => !isNaN(n) && n >= 0)
      } else {
        // Fallback: extract all digits concatenated
        const digitsOnly = combinedText.replace(/\D/g, '')
        if (digitsOnly.length >= 3) {
          candidateNumbers = [parseInt(digitsOnly.slice(0, 7), 10)]
        }
      }

      setDetectedNumbers(candidateNumbers)
      if (candidateNumbers.length > 0) {
        // Pick the largest candidate (cumulative reading) or first candidate
        const bestCandidate = Math.max(...candidateNumbers)
        setManualInputValue(bestCandidate.toString())
        toast.success(`Extracted ${candidateNumbers.length} meter reading candidate(s)!`)
      } else {
        toast.warning('No clear digits auto-detected. You can type or adjust the exact reading below.')
      }
    } catch (err) {
      console.error('OCR Scanning Error:', err)
      toast.error('Error scanning image. Please ensure photo is clear and legible.')
    } finally {
      setIsScanning(false)
    }
  }

  const handleApply = () => {
    const num = parseInt(manualInputValue, 10)
    if (!isNaN(num) && num >= 0) {
      onDetectedValue(num)
      toast.success(`Meter reading updated to ${num.toLocaleString()} L!`)
      onClose()
    } else {
      toast.error('Please enter a valid positive meter reading number.')
    }
  }

  const handleReset = () => {
    setImageSrc(null)
    setDetectedNumbers([])
    setManualInputValue('')
    setProgress(0)
    setIsScanning(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Water Meter OCR Scanner">
      <div className="space-y-5">
        
        {/* Hidden file inputs */}
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
              Capture or Upload Water Meter Photo
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
              Take a clear picture of the physical water meter counter dial. Our enhanced AI scanner will extract the reading digits automatically.
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
                  <span>Retake Photo</span>
                </button>
              )}
            </div>

            {/* Results & Verification Section */}
            {!isScanning && (
              <div className="space-y-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                
                {/* Candidates selection */}
                {detectedNumbers.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Binary className="h-4 w-4 text-brand-600" />
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Detected Candidates
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Click to fill value</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {detectedNumbers.map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setManualInputValue(num.toString())}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            manualInputValue === num.toString()
                              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 ring-2 ring-brand-500/30'
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                          }`}
                        >
                          {manualInputValue === num.toString() && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                          <span>{num.toLocaleString()} L</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Edit Field */}
                <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                    <span>Confirm Meter Reading Value (Litres)</span>
                  </div>
                  <Input
                    id="ocrVerifiedInput"
                    type="number"
                    value={manualInputValue}
                    onChange={(e) => setManualInputValue(e.target.value)}
                    placeholder="e.g. 12500"
                    className="!bg-white !font-black !text-base !py-2.5 !text-slate-900 shadow-xs"
                  />
                  <p className="text-[11px] text-slate-400 font-medium">
                    Verify or adjust the numbers extracted from the water meter dial before applying to the form.
                  </p>
                </div>
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
              disabled={!manualInputValue}
              className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-5 rounded-xl cursor-pointer shadow-sm"
            >
              Apply {manualInputValue ? `${parseInt(manualInputValue, 10).toLocaleString()} L` : 'Value'} to Form
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
