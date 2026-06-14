import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { subMonths, differenceInMonths } from 'date-fns'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const now = new Date()
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const month = parseInt(searchParams.get('month') || '') || (prevDate.getMonth() + 1)
  const year = parseInt(searchParams.get('year') || '') || prevDate.getFullYear()

  try {
    // 1. Fetch properties & flats summary
    const properties = await prisma.property.findMany({
      where: { userId: user.userId, status: 'ACTIVE' },
      include: {
        flats: {
          select: { status: true }
        }
      }
    })

    let totalFlats = 0
    let occupiedFlats = 0
    for (const prop of properties) {
      totalFlats += prop.flats.length
      occupiedFlats += prop.flats.filter(f => f.status === 'OCCUPIED').length
    }
    const vacantFlats = totalFlats - occupiedFlats
    const occupancyRate = totalFlats > 0 ? Math.round((occupiedFlats / totalFlats) * 100) : 0

    // 2. Fetch selected month's rent records for KPI
    const currentMonthRentRecords = await prisma.rentRecord.findMany({
      where: {
        month,
        year,
        flat: {
          property: {
            userId: user.userId,
            status: 'ACTIVE'
          }
        }
      }
    })

    let totalCollected = 0
    let pendingDues = 0
    for (const rec of currentMonthRentRecords) {
      totalCollected += rec.paidAmount
      pendingDues += Math.max(0, rec.rentAmount - rec.paidAmount)
    }

    // 3. Fetch total advance deposit held
    const activeTenants = await prisma.tenant.findMany({
      where: {
        status: 'ACTIVE',
        flat: {
          property: {
            userId: user.userId,
            status: 'ACTIVE'
          }
        }
      },
      include: {
        rentRevisions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    const advanceHeld = activeTenants.reduce((sum, t) => sum + t.advanceAmount, 0)

    // 4. Appraisals due soon (next 30 days)
    const appraisalsDue = activeTenants.filter(tenant => {
      const monthsSinceJoining = differenceInMonths(now, tenant.joiningDate)
      if (monthsSinceJoining < 11) return false

      const latestRevision = tenant.rentRevisions[0]
      if (latestRevision) {
        const monthsSinceRevision = differenceInMonths(now, latestRevision.effectiveDate)
        return monthsSinceRevision >= 11
      }
      return true
    }).length

    // 5. Build 6 months of collection data for bar chart
    const monthYears = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i)
      monthYears.push({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        date
      })
    }

    const records = await prisma.rentRecord.findMany({
      where: {
        OR: monthYears.map(my => ({ month: my.month, year: my.year })),
        flat: {
          property: {
            userId: user.userId,
            status: 'ACTIVE'
          }
        }
      }
    })

    const collection6m = monthYears.map(({ month: m, year: y, date }) => {
      const matchingRecords = records.filter(r => r.month === m && r.year === y)
      let collected = 0
      let pending = 0
      for (const r of matchingRecords) {
        collected += r.paidAmount
        pending += Math.max(0, r.rentAmount - r.paidAmount)
      }

      return {
        label: `${date.toLocaleString('default', { month: 'short' })} ${y.toString().slice(2)}`,
        collected,
        pending
      }
    })

    // 6. Fetch recent events (activity feed)
    const recentRent = await prisma.rentRecord.findMany({
      where: {
        status: { in: ['PAID', 'PARTIAL'] },
        flat: { property: { userId: user.userId } }
      },
      include: {
        tenant: { select: { name: true } },
        flat: { select: { flatNumber: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    })

    const recentTenants = await prisma.tenant.findMany({
      where: {
        flat: { property: { userId: user.userId } }
      },
      include: {
        flat: { select: { flatNumber: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const recentRevisions = await prisma.rentRevision.findMany({
      where: {
        tenant: { flat: { property: { userId: user.userId } } }
      },
      include: {
        tenant: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const recentAdvances = await prisma.advanceRecord.findMany({
      where: {
        tenant: { flat: { property: { userId: user.userId } } }
      },
      include: {
        tenant: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const activities: any[] = []
    
    recentRent.forEach(r => {
      activities.push({
        type: 'rent',
        title: 'Rent payment collected',
        description: `Collected ₹${r.paidAmount.toLocaleString()} for Unit ${r.flat.flatNumber} (${r.tenant.name})`,
        date: r.updatedAt
      })
    })

    recentTenants.forEach(t => {
      activities.push({
        type: 'tenant',
        title: 'New tenant registered',
        description: `${t.name} moved into Unit ${t.flat.flatNumber} with base rent ₹${t.currentRent.toLocaleString()}`,
        date: t.createdAt
      })
    })

    recentRevisions.forEach(rev => {
      activities.push({
        type: 'appraisal',
        title: 'Rent appraisal revision',
        description: `Hiked rent by +${rev.appraisalPercent}% to ₹${rev.newRent.toLocaleString()} for ${rev.tenant.name}`,
        date: rev.createdAt
      })
    })

    recentAdvances.forEach(adv => {
      activities.push({
        type: 'advance',
        title: `Advance deposit ${adv.type.toLowerCase()}`,
        description: `Logged ₹${adv.amount.toLocaleString()} advance transaction for ${adv.tenant.name}`,
        date: adv.createdAt
      })
    })

    const sortedActivities = activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)

    return NextResponse.json({
      kpis: {
        totalCollected,
        pendingDues,
        occupancyRate,
        vacantFlats,
        appraisalsDue,
        advanceHeld
      },
      charts: {
        collection6m,
        occupancy: {
          occupied: occupiedFlats,
          vacant: vacantFlats
        }
      },
      activities: sortedActivities
    })
  } catch (error) {
    console.error('Fetch dashboard details error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
