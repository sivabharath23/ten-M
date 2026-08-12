import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const reportType = searchParams.get('type') || 'rent'
  const month = parseInt(searchParams.get('month') || '')
  const year = parseInt(searchParams.get('year') || '')
  const propertyId = searchParams.get('propertyId')

  try {
    if (reportType === 'rent') {
      const records = await prisma.rentRecord.findMany({
        where: {
          ...(month ? { month } : {}),
          ...(year ? { year } : {}),
          flat: {
            property: {
              userId: user.userId,
              status: 'ACTIVE',
              ...(propertyId && propertyId !== 'all' ? { id: propertyId } : {})
            }
          }
        },
        include: {
          tenant: { select: { name: true } },
          flat: { include: { property: { select: { name: true } } } }
        },
        orderBy: { flat: { flatNumber: 'asc' } }
      })

      const data = records.map(r => ({
        'Flat No.': r.flat.flatNumber,
        'Tenant Name': r.tenant.name,
        'Building Name': r.flat.property.name,
        'Billing Period': `${r.month}/${r.year}`,
        'Rent Due (₹)': r.rentAmount,
        'Rent Collected (₹)': r.paidAmount,
        'Balance Due (₹)': r.rentAmount - r.paidAmount,
        'Payment Status': r.status,
        'Date Collected': r.paidOn ? new Date(r.paidOn).toLocaleDateString() : 'N/A'
      }))
      return NextResponse.json(data)
    }

    if (reportType === 'overdue') {
      const records = await prisma.rentRecord.findMany({
        where: {
          status: 'OVERDUE',
          flat: {
            property: {
              userId: user.userId,
              status: 'ACTIVE',
              ...(propertyId && propertyId !== 'all' ? { id: propertyId } : {})
            }
          }
        },
        include: {
          tenant: { select: { name: true, phone: true } },
          flat: { include: { property: { select: { name: true } } } }
        },
        orderBy: { flat: { flatNumber: 'asc' } }
      })

      const data = records.map(r => ({
        'Flat No.': r.flat.flatNumber,
        'Tenant Name': r.tenant.name,
        'Tenant Phone': r.tenant.phone,
        'Building Name': r.flat.property.name,
        'Billing Period': `${r.month}/${r.year}`,
        'Overdue Amount (₹)': r.rentAmount - r.paidAmount,
        'Notes': r.notes || ''
      }))
      return NextResponse.json(data)
    }

    if (reportType === 'water') {
      const records = await prisma.waterRecord.findMany({
        where: {
          ...(month ? { month } : {}),
          ...(year ? { year } : {}),
          flat: {
            property: {
              userId: user.userId,
              status: 'ACTIVE',
              ...(propertyId && propertyId !== 'all' ? { id: propertyId } : {})
            }
          }
        },
        include: {
          flat: {
            include: {
              property: { select: { name: true } },
              tenants: { where: { status: 'ACTIVE' }, select: { name: true } }
            }
          }
        },
        orderBy: { flat: { flatNumber: 'asc' } }
      })

      const data = records.map(r => ({
        'Flat No.': r.flat.flatNumber,
        'Tenant Name': r.flat.tenants[0]?.name || 'N/A',
        'Building Name': r.flat.property.name,
        'Period': `${r.month}/${r.year}`,
        'Consumption (Litres)': r.unitsConsumed,
        'Rate (₹/Litre)': r.costPerLitre,
        'Total Due (₹)': r.totalCost,
        'Bill Paid': r.isPaid ? 'YES' : 'NO'
      }))
      return NextResponse.json(data)
    }

    if (reportType === 'occupancy') {
      const flats = await prisma.flat.findMany({
        where: {
          property: {
            userId: user.userId,
            status: 'ACTIVE',
            ...(propertyId && propertyId !== 'all' ? { id: propertyId } : {})
          }
        },
        include: {
          property: { select: { name: true } },
          tenants: { where: { status: 'ACTIVE' }, select: { name: true, phone: true } }
        },
        orderBy: { flatNumber: 'asc' }
      })

      const data = flats.map(f => ({
        'Flat No.': f.flatNumber,
        'Building Name': f.property.name,
        'Floor Level': f.floor,
        'Unit Layout': f.bhkType,
        'Base Rent (₹)': f.baseRent,
        'Occupancy State': f.status,
        'Active Tenant': f.tenants[0]?.name || 'N/A',
        'Tenant Phone': f.tenants[0]?.phone || 'N/A'
      }))
      return NextResponse.json(data)
    }

    if (reportType === 'revision') {
      const records = await prisma.rentRevision.findMany({
        where: {
          tenant: {
            flat: {
              property: {
                userId: user.userId,
                status: 'ACTIVE'
              }
            }
          }
        },
        include: {
          tenant: {
            select: {
              name: true,
              flat: {
                select: {
                  flatNumber: true,
                  property: { select: { name: true } }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      const data = records.map(r => ({
        'Tenant Name': r.tenant.name,
        'Flat No.': r.tenant.flat.flatNumber,
        'Building Name': r.tenant.flat.property.name,
        'Hike Applied (%)': r.appraisalPercent,
        'Previous Rent (₹)': r.previousRent,
        'New Rent (₹)': r.newRent,
        'Effective Date': new Date(r.effectiveDate).toLocaleDateString()
      }))
      return NextResponse.json(data)
    }

    if (reportType === 'combined' || reportType === 'rent-water') {
      const rentRecords = await prisma.rentRecord.findMany({
        where: {
          ...(month ? { month } : {}),
          ...(year ? { year } : {}),
          flat: {
            property: {
              userId: user.userId,
              status: 'ACTIVE',
              ...(propertyId && propertyId !== 'all' ? { id: propertyId } : {})
            }
          }
        },
        include: {
          tenant: { select: { name: true, phone: true } },
          flat: { include: { property: { select: { name: true } } } }
        },
        orderBy: { flat: { flatNumber: 'asc' } }
      })

      const waterRecords = await prisma.waterRecord.findMany({
        where: {
          ...(month ? { month } : {}),
          ...(year ? { year } : {}),
          flat: {
            property: {
              userId: user.userId,
              status: 'ACTIVE',
              ...(propertyId && propertyId !== 'all' ? { id: propertyId } : {})
            }
          }
        },
        include: {
          flat: { include: { property: { select: { name: true } } } }
        },
        orderBy: { flat: { flatNumber: 'asc' } }
      })

      const flatMap = new Map<string, any>()

      // Process rent records first
      for (const r of rentRecords) {
        flatMap.set(r.flatId, {
          flatId: r.flatId,
          flatNumber: r.flat.flatNumber,
          propertyName: r.flat.property.name,
          tenantName: r.tenant.name,
          tenantPhone: r.tenant.phone,
          month: r.month,
          year: r.year,
          rentAmount: r.rentAmount,
          rentPaidAmount: r.paidAmount,
          rentStatus: r.status,
          rentPaidOn: r.paidOn ? new Date(r.paidOn).toLocaleDateString() : 'N/A',
          waterReading: 0,
          waterUnits: 0,
          waterCost: 0,
          waterPaid: 'N/A',
          waterPaidOn: 'N/A'
        })
      }

      // Merge water records
      for (const w of waterRecords) {
        const existing = flatMap.get(w.flatId)
        if (existing) {
          existing.waterReading = w.reading
          existing.waterUnits = w.unitsConsumed
          existing.waterCost = w.totalCost
          existing.waterPaid = w.isPaid ? 'YES' : 'NO'
          existing.waterPaidOn = w.paidOn ? new Date(w.paidOn).toLocaleDateString() : 'N/A'
        } else {
          // Fetch active tenant for the flat if not found in rent records
          const activeTenant = await prisma.tenant.findFirst({
            where: { flatId: w.flatId, status: 'ACTIVE' },
            select: { name: true, phone: true }
          })
          flatMap.set(w.flatId, {
            flatId: w.flatId,
            flatNumber: w.flat.flatNumber,
            propertyName: w.flat.property.name,
            tenantName: activeTenant?.name || 'N/A',
            tenantPhone: activeTenant?.phone || 'N/A',
            month: w.month,
            year: w.year,
            rentAmount: 0,
            rentPaidAmount: 0,
            rentStatus: 'N/A',
            rentPaidOn: 'N/A',
            waterReading: w.reading,
            waterUnits: w.unitsConsumed,
            waterCost: w.totalCost,
            waterPaid: w.isPaid ? 'YES' : 'NO',
            waterPaidOn: w.paidOn ? new Date(w.paidOn).toLocaleDateString() : 'N/A'
          })
        }
      }

      const data = Array.from(flatMap.values()).map(item => ({
        'Flat No.': item.flatNumber,
        'Building Name': item.propertyName,
        'Tenant Name': item.tenantName,
        'Tenant Phone': item.tenantPhone,
        'Billing Period': `${item.month}/${item.year}`,
        'Rent Due (₹)': item.rentAmount,
        'Rent Collected (₹)': item.rentPaidAmount,
        'Rent Balance (₹)': item.rentAmount - item.rentPaidAmount,
        'Rent Status': item.rentStatus,
        'Rent Paid On': item.rentPaidOn,
        'Water Reading': item.waterReading,
        'Water Consumed (L)': item.waterUnits,
        'Water Cost (₹)': item.waterCost,
        'Water Paid': item.waterPaid,
        'Water Paid On': item.waterPaidOn,
        'Total Collected (₹)': item.rentPaidAmount + (item.waterPaid === 'YES' ? item.waterCost : 0)
      }))

      return NextResponse.json(data)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('Fetch report error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
