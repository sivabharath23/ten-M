import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { differenceInMonths } from 'date-fns'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'due'

  try {
    if (type === 'due') {
      // Find tenants whose joiningDate is >= 11 months ago and latest rentRevision is >= 11 months ago (or has no revisions)
      const tenants = await prisma.tenant.findMany({
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
          flat: {
            include: {
              property: {
                select: { name: true }
              }
            }
          },
          rentRevisions: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })

      const now = new Date()
      const dueTenants = tenants.filter(tenant => {
        const monthsSinceJoining = differenceInMonths(now, tenant.joiningDate)
        if (monthsSinceJoining < 11) return false

        const latestRevision = tenant.rentRevisions[0]
        if (latestRevision) {
          const monthsSinceRevision = differenceInMonths(now, latestRevision.effectiveDate)
          return monthsSinceRevision >= 11
        }

        return true
      })

      return NextResponse.json(dueTenants)
    } else {
      // Fetch past revisions
      const revisions = await prisma.rentRevision.findMany({
        where: {
          tenant: {
            flat: {
              property: {
                userId: user.userId
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

      return NextResponse.json(revisions)
    }
  } catch (error) {
    console.error('Fetch appraisals error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { tenantId, customPercent } = await req.json()
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 })
    }

    const settings = await prisma.settings.findUnique({
      where: { userId: user.userId }
    })
    const basePercent = settings?.appraisalPercent ?? 5.0
    const percent = customPercent !== undefined ? parseFloat(customPercent) : basePercent

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        flat: {
          include: {
            property: {
              select: { userId: true }
            }
          }
        }
      }
    })

    if (!tenant || tenant.flat.property.userId !== user.userId) {
      return NextResponse.json({ error: 'Tenant not found or invalid permissions' }, { status: 400 })
    }

    const newRent = Math.round(tenant.currentRent * (1 + percent / 100))

    const result = await prisma.$transaction([
      prisma.rentRevision.create({
        data: {
          tenantId,
          previousRent: tenant.currentRent,
          newRent,
          appraisalPercent: percent,
          effectiveDate: new Date()
        }
      }),
      prisma.tenant.update({
        where: { id: tenantId },
        data: { currentRent: newRent }
      })
    ])

    return NextResponse.json({ success: true, revision: result[0], newRent })
  } catch (error) {
    console.error('Apply appraisal error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
