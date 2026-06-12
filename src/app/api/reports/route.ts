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

    return NextResponse.json([])
  } catch (error) {
    console.error('Fetch report error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
