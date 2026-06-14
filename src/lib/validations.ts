import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  userType: z.enum(['SINGLE', 'MULTIPLE']),
})

export const settingsSchema = z.object({
  appraisalPercent: z.number().min(0, 'Must be 0 or positive').max(100, 'Must not exceed 100%'),
  waterCostPerLitre: z.number().min(0, 'Must be 0 or positive'),
  lateFeeAmount: z.number().min(0, 'Must be 0 or positive'),
  lateFeeGraceDays: z.number().int().min(0, 'Must be 0 or positive'),
  maxFloors: z.number().int().min(1, 'Max floors must be at least 1').max(100, 'Max floors cannot exceed 100'),
})

export const propertySchema = z.object({
  name: z.string().min(2, 'Property name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  type: z.enum(['RESIDENTIAL', 'COMMERCIAL']),
})

export const flatSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  flatNumber: z.string().min(1, 'Flat number is required'),
  floor: z.number().int().min(0, 'Floor must be 0 or higher'),
  bhkType: z.string().min(1, 'BHK/Type is required'),
  baseRent: z.number().positive('Rent must be positive'),
})

export const tenantSchema = z.object({
  flatId: z.string().min(1, 'Flat is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional().or(z.literal('')).refine(
    (val) => !val || /^[0-9+() -]{10,15}$/.test(val),
    { message: 'Invalid phone number' }
  ),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  idProofType: z.string().optional().or(z.literal('')),
  idProofNumber: z.string().optional().or(z.literal('')),
  idProofUrl: z.string().optional().or(z.literal('')),
  joiningDate: z.string().min(1, 'Joining date is required'),
  currentRent: z.number().positive('Rent must be positive'),
  advanceAmount: z.number().min(0, 'Advance must be 0 or positive'),
})

export const waterRecordSchema = z.object({
  flatId: z.string().min(1, 'Flat is required'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  unitsConsumed: z.number().min(0, 'Units consumed must be 0 or higher'),
})

export const advanceRecordSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  type: z.enum(['RECEIVED', 'DEDUCTED', 'REFUNDED']),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
})

export const rentRecordUpdateSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PARTIAL', 'OVERDUE']),
  paidAmount: z.number().min(0, 'Paid amount must be 0 or higher'),
  paidOn: z.string().optional().nullable(),
  paymentMode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})
