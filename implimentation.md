# TenM — Tenant Management Portal
## Full Implementation Plan

> **Stack**: Next.js 14 (App Router) · Tailwind CSS · Prisma ORM · PostgreSQL · JWT (jose + bcryptjs)
> **Theme**: Light, clean, icon-rich UI · Lucide React icons · Skeleton loaders · Optimistic UI

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Folder Structure](#2-folder-structure)
3. [Database Schema](#3-database-schema)
4. [Auth Module (JWT)](#4-auth-module-jwt)
5. [Middleware & Route Protection](#5-middleware--route-protection)
6. [Settings Master](#6-settings-master)
7. [Property Module](#7-property-module)
8. [Flat Module](#8-flat-module)
9. [Tenant Module](#9-tenant-module)
10. [Rent Collection](#10-rent-collection)
11. [Water Billing](#11-water-billing)
12. [Advance History](#12-advance-history)
13. [Rent Appraisal Engine](#13-rent-appraisal-engine)
14. [Dashboard & KPIs](#14-dashboard--kpis)
15. [Reports Module](#15-reports-module)
16. [UI System & Components](#16-ui-system--components)
17. [Performance & Optimization](#17-performance--optimization)
18. [Environment & Deployment](#18-environment--deployment)
19. [Phase-wise Timeline](#19-phase-wise-timeline)

---

## 1. Project Setup

### Initialize project

```bash
npx create-next-app@latest tenm --typescript --tailwind --app --src-dir
cd tenm
npm install prisma @prisma/client
npm install jose bcryptjs
npm install lucide-react
npm install react-hook-form zod @hookform/resolvers
npm install sonner                          # toast notifications
npm install date-fns                        # date helpers
npm install papaparse                       # CSV export
npm install @types/bcryptjs @types/papaparse --save-dev
npx prisma init
```

### Environment variables (`.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tenm"
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
NEXT_PUBLIC_APP_NAME="TenM"
```

### `tailwind.config.ts` — custom brand tokens

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        surface: '#f8f9fa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

---

## 2. Folder Structure

```
tenm/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx               ← sidebar + topbar shell
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx             ← list
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx         ← detail + flats
│   │   │   │       └── edit/page.tsx
│   │   │   ├── flats/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/page.tsx
│   │   │   ├── tenants/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/page.tsx
│   │   │   ├── rent/
│   │   │   │   └── page.tsx
│   │   │   ├── water/
│   │   │   │   └── page.tsx
│   │   │   ├── advance/
│   │   │   │   └── page.tsx
│   │   │   ├── appraisals/
│   │   │   │   └── page.tsx
│   │   │   ├── reports/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/route.ts
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   └── me/route.ts
│   │       ├── properties/
│   │       │   ├── route.ts             ← GET list, POST create
│   │       │   └── [id]/route.ts        ← GET, PUT, DELETE
│   │       ├── flats/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── tenants/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── rent/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── water/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── advance/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── appraisals/
│   │       │   └── route.ts
│   │       ├── settings/
│   │       │   └── route.ts
│   │       └── reports/
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── forms/
│   │   │   ├── PropertyForm.tsx
│   │   │   ├── FlatForm.tsx
│   │   │   ├── TenantForm.tsx
│   │   │   ├── RentForm.tsx
│   │   │   ├── WaterForm.tsx
│   │   │   ├── AdvanceForm.tsx
│   │   │   └── SettingsForm.tsx
│   │   └── charts/
│   │       ├── CollectionBar.tsx        ← SVG bar chart
│   │       └── OccupancyDonut.tsx       ← SVG donut
│   ├── lib/
│   │   ├── prisma.ts                    ← singleton client
│   │   ├── jwt.ts                       ← sign / verify
│   │   ├── auth.ts                      ← getCurrentUser()
│   │   ├── validations.ts               ← zod schemas
│   │   └── utils.ts                     ← helpers, formatters
│   ├── hooks/
│   │   ├── useCurrentUser.ts
│   │   └── useDebounce.ts
│   └── types/
│       └── index.ts
├── middleware.ts
├── prisma/
│   └── schema.prisma
└── .env
```

---

## 3. Database Schema

**`prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String       @id @default(cuid())
  name         String
  email        String       @unique
  password     String
  userType     UserType     @default(SINGLE)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  properties   Property[]
  settings     Settings?
}

enum UserType {
  SINGLE      // manages one property
  MULTIPLE    // manages multiple properties
}

model Settings {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id])
  appraisalPercent      Float    @default(5.0)   // annual rent hike %
  waterCostPerLitre     Float    @default(0.05)  // cost per litre
  lateFeeAmount         Float    @default(0.0)
  lateFeeGraceDays      Int      @default(5)
  updatedAt             DateTime @updatedAt
}

model Property {
  id          String     @id @default(cuid())
  userId      String
  user        User       @relation(fields: [userId], references: [id])
  name        String
  address     String
  city        String
  type        PropertyType @default(RESIDENTIAL)
  status      Status     @default(ACTIVE)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  flats       Flat[]
}

enum PropertyType {
  RESIDENTIAL
  COMMERCIAL
}

enum Status {
  ACTIVE
  INACTIVE
}

model Flat {
  id           String      @id @default(cuid())
  propertyId   String
  property     Property    @relation(fields: [propertyId], references: [id])
  flatNumber   String
  floor        Int         @default(0)
  bhkType      String      @default("1BHK")
  baseRent     Float
  status       FlatStatus  @default(VACANT)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  tenants      Tenant[]
  rentRecords  RentRecord[]
  waterRecords WaterRecord[]
}

enum FlatStatus {
  VACANT
  OCCUPIED
}

model Tenant {
  id              String          @id @default(cuid())
  flatId          String
  flat            Flat            @relation(fields: [flatId], references: [id])
  name            String
  phone           String
  email           String?
  idProofType     String?
  idProofNumber   String?
  joiningDate     DateTime
  currentRent     Float
  advanceAmount   Float           @default(0)
  status          TenantStatus    @default(ACTIVE)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  rentRecords     RentRecord[]
  advanceRecords  AdvanceRecord[]
  rentRevisions   RentRevision[]
}

enum TenantStatus {
  ACTIVE
  VACATED
}

model RentRecord {
  id          String      @id @default(cuid())
  tenantId    String
  tenant      Tenant      @relation(fields: [tenantId], references: [id])
  flatId      String
  flat        Flat        @relation(fields: [flatId], references: [id])
  month       Int
  year        Int
  rentAmount  Float
  paidAmount  Float       @default(0)
  paidOn      DateTime?
  status      RentStatus  @default(PENDING)
  notes       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@unique([tenantId, month, year])
}

enum RentStatus {
  PENDING
  PAID
  PARTIAL
  OVERDUE
}

model WaterRecord {
  id            String   @id @default(cuid())
  flatId        String
  flat          Flat     @relation(fields: [flatId], references: [id])
  month         Int
  year          Int
  unitsConsumed Float    // in litres
  costPerLitre  Float    // snapshot from settings at time of entry
  totalCost     Float    // computed: units * costPerLitre
  paidOn        DateTime?
  isPaid        Boolean  @default(false)
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([flatId, month, year])
}

model AdvanceRecord {
  id          String        @id @default(cuid())
  tenantId    String
  tenant      Tenant        @relation(fields: [tenantId], references: [id])
  type        AdvanceType
  amount      Float
  date        DateTime
  notes       String?
  createdAt   DateTime      @default(now())
}

enum AdvanceType {
  RECEIVED      // advance paid by tenant
  DEDUCTED      // deducted from advance against dues
  REFUNDED      // refunded to tenant on vacating
}

model RentRevision {
  id              String   @id @default(cuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  previousRent    Float
  newRent         Float
  appraisalPercent Float
  effectiveDate   DateTime
  notes           String?
  createdAt       DateTime @default(now())
}
```

### Run migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 4. Auth Module (JWT)

### `src/lib/jwt.ts`

```ts
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export interface TokenPayload {
  userId: string
  email: string
  name: string
  userType: string
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as TokenPayload
}
```

### `src/lib/auth.ts`

```ts
import { cookies } from 'next/headers'
import { verifyToken, TokenPayload } from './jwt'

export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const token = cookies().get('tenm_token')?.value
    if (!token) return null
    return await verifyToken(token)
  } catch {
    return null
  }
}
```

### `src/lib/prisma.ts`

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### `src/app/api/auth/register/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  userType: z.enum(['SINGLE', 'MULTIPLE']),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { name, email, password, userType } = parsed.data

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists)
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, userType },
  })

  // Create default settings for new user
  await prisma.settings.create({
    data: { userId: user.id },
  })

  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
  })

  const res = NextResponse.json({ success: true, userType: user.userType })
  res.cookies.set('tenm_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
```

### `src/app/api/auth/login/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
  })

  const res = NextResponse.json({ success: true })
  res.cookies.set('tenm_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
```

### `src/app/api/auth/logout/route.ts`

```ts
import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set('tenm_token', '', { maxAge: 0, path: '/' })
  return res
}
```

---

## 5. Middleware & Route Protection

### `middleware.ts` (root level)

```ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

const PUBLIC_PATHS = ['/login', '/register', '/api/auth']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))
  if (isPublic) return NextResponse.next()

  const token = req.cookies.get('tenm_token')?.value
  if (!token) return NextResponse.redirect(new URL('/login', req.url))

  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.set('tenm_token', '', { maxAge: 0, path: '/' })
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
```

---

## 6. Settings Master

### Page: `/settings`

UI sections:

- **Rent appraisal** — number input for annual % (e.g. 5%). Tooltip explaining it is applied yearly on tenant anniversary.
- **Water billing** — cost per litre input (e.g. ₹0.05/litre). Changes apply to future bills only.
- **Late fee** — optional flat amount + grace days after due date.

### `src/app/api/settings/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.settings.findUnique({
    where: { userId: user.userId },
  })
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const settings = await prisma.settings.update({
    where: { userId: user.userId },
    data: {
      appraisalPercent: body.appraisalPercent,
      waterCostPerLitre: body.waterCostPerLitre,
      lateFeeAmount: body.lateFeeAmount,
      lateFeeGraceDays: body.lateFeeGraceDays,
    },
  })
  return NextResponse.json(settings)
}
```

---

## 7. Property Module

### Data fields

| Field       | Type           | Notes                         |
|-------------|----------------|-------------------------------|
| name        | string         | e.g. "Green Valley Apartments"|
| address     | string         | full street address           |
| city        | string         |                               |
| type        | RESIDENTIAL / COMMERCIAL |              |
| status      | ACTIVE / INACTIVE |                          |

### API routes

```ts
// GET /api/properties        → list user's properties with flat counts
// POST /api/properties       → create new property
// GET /api/properties/:id    → detail with flats + occupancy
// PUT /api/properties/:id    → update
// DELETE /api/properties/:id → soft-delete (set INACTIVE)
```

### Page: `/properties`

- Grid card view (2 cols on desktop, 1 on mobile)
- Each card shows: property name, address, total flats, occupied count, vacancy badge
- Quick actions: View flats, Edit, Archive
- "Add property" button top-right with `Building2` icon

---

## 8. Flat Module

### Data fields

| Field       | Type             | Notes                         |
|-------------|------------------|-------------------------------|
| flatNumber  | string           | e.g. "101", "A-201"          |
| floor       | number           | 0 = ground                    |
| bhkType     | string           | 1BHK, 2BHK, 3BHK, Studio     |
| baseRent    | number           | in ₹                          |
| status      | VACANT / OCCUPIED |                              |

### Page: `/properties/[id]`

Shows the property detail with a flats table:

- Columns: Flat No., Floor, BHK, Base Rent, Status (badge), Tenant Name, Actions
- Status badge: green = Occupied, gray = Vacant
- Inline "Assign Tenant" button on vacant flats
- Row click → flat detail page

---

## 9. Tenant Module

### Data fields

| Field          | Type     | Notes                                |
|----------------|----------|--------------------------------------|
| name           | string   |                                      |
| phone          | string   |                                      |
| email          | string?  | optional                             |
| idProofType    | string?  | Aadhar / PAN / Passport              |
| idProofNumber  | string?  |                                      |
| joiningDate    | date     | used for appraisal anniversary       |
| currentRent    | number   | may change after appraisals          |
| advanceAmount  | number   | total advance held                   |
| status         | ACTIVE / VACATED |                              |

### Page: `/tenants/[id]`

Sections on the tenant detail page:

1. **Profile** — name, contact, ID, joining date, current rent
2. **Rent history** — table of all months with status badges
3. **Advance ledger** — running balance with timeline
4. **Rent revisions** — history of appraisal-based rent changes
5. **Water bills** — monthly water bill history for the flat
6. **Actions** — Mark Vacated, Apply Appraisal, Add Advance

### On tenant creation

```ts
// When creating a tenant:
// 1. Create Tenant record
// 2. Update Flat.status → OCCUPIED
// 3. Generate RentRecord for current month (PENDING)
```

---

## 10. Rent Collection

### Monthly workflow

Each month, rent records exist per active tenant. Staff updates status per tenant.

### Status transitions

```
PENDING → PAID       (full amount received)
PENDING → PARTIAL    (partial amount received, remainder noted)
PENDING → OVERDUE    (past due date with no payment)
PARTIAL → PAID       (remainder collected)
```

### Page: `/rent`

- Month/Year selector at top (defaults to current month)
- Property filter dropdown
- Table: Tenant, Flat, Property, Rent Due, Paid, Status, Actions
- Bulk action: "Mark all as Paid" for a property
- Color coding: green = Paid, yellow = Partial, red = Overdue, gray = Pending
- Inline edit: click status cell to open quick-update modal

### API: `PUT /api/rent/:id`

```ts
{
  status: 'PAID' | 'PARTIAL' | 'OVERDUE',
  paidAmount: number,
  paidOn: string,   // ISO date
  notes?: string
}
```

### Auto-generate rent records (cron/on-demand)

```ts
// Call at start of each month or on-demand from the UI
// Creates PENDING RentRecord for every ACTIVE tenant
// Skips if record already exists for that month/year
async function generateMonthlyRentRecords(month: number, year: number, userId: string) {
  const properties = await prisma.property.findMany({
    where: { userId, status: 'ACTIVE' },
    include: { flats: { include: { tenants: { where: { status: 'ACTIVE' } } } } }
  })
  for (const property of properties) {
    for (const flat of property.flats) {
      for (const tenant of flat.tenants) {
        await prisma.rentRecord.upsert({
          where: { tenantId_month_year: { tenantId: tenant.id, month, year } },
          create: {
            tenantId: tenant.id,
            flatId: flat.id,
            month, year,
            rentAmount: tenant.currentRent,
            status: 'PENDING'
          },
          update: {},
        })
      }
    }
  }
}
```

---

## 11. Water Billing

### Monthly workflow

1. Enter meter reading (litres consumed) per flat
2. System fetches `waterCostPerLitre` from Settings at time of entry (snapshot)
3. Auto-calculates `totalCost = unitsConsumed × costPerLitre`
4. Mark as paid when collected

### Page: `/water`

- Month/Year + Property filter
- Table: Flat No., Tenant, Units (L), Rate (₹/L), Total Bill, Paid, Status
- Quick-entry form: select flat, enter units → auto-calculates bill
- Edit existing reading (corrects entry before payment)

### API: `POST /api/water`

```ts
// Fetch current settings on server to snapshot the rate
const settings = await prisma.settings.findUnique({ where: { userId } })
const totalCost = body.unitsConsumed * settings.waterCostPerLitre

await prisma.waterRecord.upsert({
  where: { flatId_month_year: { flatId, month, year } },
  create: { flatId, month, year, unitsConsumed, costPerLitre: settings.waterCostPerLitre, totalCost },
  update: { unitsConsumed, totalCost },
})
```

---

## 12. Advance History

### Three entry types

| Type     | Description                                |
|----------|--------------------------------------------|
| RECEIVED | Tenant pays advance (on joining or top-up) |
| DEDUCTED | Deducted against unpaid dues               |
| REFUNDED | Returned to tenant on vacating             |

### Running balance

Calculated client-side from the `AdvanceRecord` list:

```ts
let balance = 0
for (const record of records) {
  if (record.type === 'RECEIVED') balance += record.amount
  if (record.type === 'DEDUCTED') balance -= record.amount
  if (record.type === 'REFUNDED') balance -= record.amount
}
```

### Page: `/advance`

- Tenant search/filter at top
- Per-tenant: timeline view of advance entries with running balance chip
- Color: green = RECEIVED, red = DEDUCTED, blue = REFUNDED
- "Add entry" button opens modal with type, amount, date, notes

---

## 13. Rent Appraisal Engine

### How it works

1. On each tenant's anniversary (joiningDate month/day each year), the system identifies eligible tenants
2. The appraisal % from Settings is applied: `newRent = currentRent × (1 + appraisalPercent / 100)`
3. A `RentRevision` record is created for audit trail
4. The tenant's `currentRent` is updated

### Page: `/appraisals`

- "Due for appraisal" list: tenants whose anniversary falls within the next 30 days
- "Past revisions" table with old rent, new rent, %, date
- Manual override: apply custom % for a specific tenant
- Bulk apply button for all due tenants

### API: `POST /api/appraisals`

```ts
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  const { tenantId, customPercent } = await req.json()

  const settings = await prisma.settings.findUnique({ where: { userId: user.userId } })
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  const percent = customPercent ?? settings.appraisalPercent

  const newRent = Math.round(tenant.currentRent * (1 + percent / 100))

  await prisma.$transaction([
    prisma.rentRevision.create({
      data: {
        tenantId,
        previousRent: tenant.currentRent,
        newRent,
        appraisalPercent: percent,
        effectiveDate: new Date(),
      }
    }),
    prisma.tenant.update({
      where: { id: tenantId },
      data: { currentRent: newRent }
    })
  ])

  return NextResponse.json({ success: true, newRent })
}
```

---

## 14. Dashboard & KPIs

### KPI cards (top row)

| KPI                   | Source                                      |
|-----------------------|---------------------------------------------|
| Total collected (month)| Sum of `paidAmount` for current month RentRecords |
| Pending / Overdue     | Count + sum of PENDING + OVERDUE records    |
| Occupancy rate        | Occupied flats / total flats × 100          |
| Vacant flats          | Count of VACANT flats                       |
| Appraisals due        | Tenants with anniversary in next 30 days    |
| Advance held          | Sum of advance balances across all tenants  |

### Charts

- **Rent collection bar chart** — 6 months of collected vs pending (SVG, no lib needed)
- **Occupancy donut** — occupied vs vacant (SVG)

### Recent activity feed

Latest 10 events: rent payments, new tenants, appraisals applied, advances received.

### Quick actions

- Generate this month's rent records
- View overdue tenants
- Add tenant

---

## 15. Reports Module

### Available reports

| Report                   | Filters                          | Export  |
|--------------------------|----------------------------------|---------|
| Rent collection summary  | Month, Year, Property            | CSV     |
| Overdue tenants          | Property, as-of date             | CSV     |
| Tenant ledger            | Single tenant, date range        | CSV     |
| Advance ledger           | Tenant, date range               | CSV     |
| Water bill summary       | Month, Year, Property            | CSV     |
| Occupancy report         | Property, as-of date             | CSV     |
| Rent revision history    | Tenant, Year                     | CSV     |

### CSV export implementation

```ts
import Papa from 'papaparse'

function exportCSV(data: object[], filename: string) {
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
```

### Page: `/reports`

- Report type selector (tabs)
- Filter panel (month/year/property/tenant depending on report type)
- Preview table in UI before export
- "Export CSV" button with `Download` icon

---

## 16. UI System & Components

### Sidebar navigation

```
TenM logo
─────────────────
Dashboard          (LayoutDashboard)
Properties         (Building2)
Flats              (DoorOpen)
Tenants            (Users)
─────────────────
Rent Collection    (Banknote)
Water Bills        (Droplets)
Advance History    (Wallet)
Appraisals         (TrendingUp)
─────────────────
Reports            (FileBarChart)
Settings           (Settings)
─────────────────
Logout             (LogOut)
```

### Badge component

```tsx
const variants = {
  paid:     'bg-green-100 text-green-800',
  pending:  'bg-gray-100 text-gray-600',
  partial:  'bg-yellow-100 text-yellow-800',
  overdue:  'bg-red-100 text-red-800',
  occupied: 'bg-indigo-100 text-indigo-800',
  vacant:   'bg-gray-100 text-gray-500',
}
```

### Skeleton loader pattern

```tsx
// Each data page uses a loading.tsx alongside page.tsx
// loading.tsx shows skeleton rows matching the page's layout

export default function Loading() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
      ))}
    </div>
  )
}
```

### Toast notifications (sonner)

```tsx
// layout.tsx — add once
import { Toaster } from 'sonner'
<Toaster position="top-right" richColors />

// Usage
import { toast } from 'sonner'
toast.success('Rent marked as paid')
toast.error('Failed to update. Try again.')
```

### Form validation pattern (react-hook-form + zod)

```tsx
const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  currentRent: z.number().positive('Rent must be positive'),
})

const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
  resolver: zodResolver(schema),
})
```

---

## 17. Performance & Optimization

### Next.js App Router patterns

- Use **React Suspense** + `loading.tsx` for every page route
- Use **Server Components** for read-heavy pages (tenant list, reports)
- Use **Client Components** only for forms and interactive elements
- Use `useTransition` for optimistic UI updates

### Database indexes (add to schema)

```prisma
@@index([userId])           // on Property
@@index([propertyId])       // on Flat
@@index([flatId])           // on Tenant, WaterRecord
@@index([tenantId])         // on RentRecord, AdvanceRecord
@@index([month, year])      // on RentRecord, WaterRecord
@@index([status])           // on Tenant, Flat, RentRecord
```

### Image & asset optimization

- Use `next/image` for any uploaded ID proof thumbnails
- Lazy-load report tables with `loading="lazy"` on rows beyond fold

### API response optimization

- Always `select` only needed fields from Prisma (avoid returning password hash)
- Paginate large lists (tenants, records) with cursor-based pagination: `take: 20, cursor: { id: lastId }`

### Caching strategy

```ts
// Server Components: use Next.js fetch cache
const data = await fetch('/api/settings', { next: { revalidate: 300 } }) // 5 min

// Client: use SWR or React Query for frequently-polled pages
import useSWR from 'swr'
const { data, isLoading } = useSWR('/api/rent?month=6&year=2026', fetcher)
```

---

## 18. Environment & Deployment

### Local development

```bash
# Start PostgreSQL (via Docker)
docker run --name tenm-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=tenm -p 5432:5432 -d postgres:15

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

### Production checklist

- Set `NODE_ENV=production` (enables secure cookies)
- Use a strong random `JWT_SECRET` (min 64 chars): `openssl rand -hex 32`
- Enable connection pooling with `PgBouncer` or Prisma Accelerate for serverless
- Add `DATABASE_URL` with `?connection_limit=5` for serverless environments
- Deploy to Vercel (zero-config Next.js) or a VPS with PM2

### Recommended hosting stack

| Service       | Provider                        |
|---------------|---------------------------------|
| App hosting   | Vercel (free tier available)    |
| Database      | Supabase / Neon / Railway       |
| File storage  | Cloudinary (for ID proof uploads)|

---

## 19. Phase-wise Timeline

### Phase 1 — Foundation (Days 1–5)

- [ ] Project init, Tailwind config, folder structure
- [ ] Prisma schema + migrations
- [ ] `lib/jwt.ts`, `lib/auth.ts`, `lib/prisma.ts`
- [ ] Auth API routes (register, login, logout, me)
- [ ] Middleware (JWT verification)
- [ ] Register page (with SINGLE/MULTIPLE selector)
- [ ] Login page
- [ ] Dashboard shell (sidebar + topbar layout)

### Phase 2 — Core CRUD (Days 6–12)

- [ ] Property list, create, edit, archive pages + API
- [ ] Flat list, create, edit pages + API
- [ ] Tenant create, detail, edit, vacate pages + API
- [ ] Settings page + API (appraisal %, water rate)

### Phase 3 — Financial modules (Days 13–18)

- [ ] Rent collection page (monthly view, status update)
- [ ] Generate monthly rent records (API + UI button)
- [ ] Water billing entry + calculation
- [ ] Advance history timeline + entry form
- [ ] Appraisal engine + due-soon list

### Phase 4 — Reports & polish (Days 19–25)

- [ ] Dashboard KPI cards + SVG charts
- [ ] All 7 report types with CSV export
- [ ] Skeleton loaders on all pages
- [ ] Toast notifications throughout
- [ ] Empty states with helpful CTAs
- [ ] Mobile responsiveness (bottom nav, responsive tables)
- [ ] Final QA pass + performance review

---

## Quick Reference — API Endpoints

| Method | Path                        | Description                         |
|--------|-----------------------------|-------------------------------------|
| POST   | `/api/auth/register`        | Create account + set JWT cookie     |
| POST   | `/api/auth/login`           | Authenticate + set JWT cookie       |
| POST   | `/api/auth/logout`          | Clear JWT cookie                    |
| GET    | `/api/auth/me`              | Get current user from token         |
| GET    | `/api/settings`             | Get user settings                   |
| PUT    | `/api/settings`             | Update appraisal %, water rate      |
| GET    | `/api/properties`           | List all properties (with counts)   |
| POST   | `/api/properties`           | Create property                     |
| GET    | `/api/properties/:id`       | Property detail + flats             |
| PUT    | `/api/properties/:id`       | Update property                     |
| GET    | `/api/flats`                | List flats (with ?propertyId filter)|
| POST   | `/api/flats`                | Create flat                         |
| PUT    | `/api/flats/:id`            | Update flat                         |
| GET    | `/api/tenants`              | List tenants (filterable)           |
| POST   | `/api/tenants`              | Create tenant (marks flat occupied) |
| GET    | `/api/tenants/:id`          | Tenant detail with all records      |
| PUT    | `/api/tenants/:id`          | Update tenant / mark vacated        |
| GET    | `/api/rent`                 | List rent records (month+year+prop) |
| POST   | `/api/rent/generate`        | Generate monthly records            |
| PUT    | `/api/rent/:id`             | Update payment status               |
| GET    | `/api/water`                | List water records                  |
| POST   | `/api/water`                | Create/update water reading         |
| GET    | `/api/advance`              | List advance records by tenant      |
| POST   | `/api/advance`              | Add advance entry                   |
| POST   | `/api/appraisals`           | Apply appraisal to tenant           |
| GET    | `/api/appraisals/due`       | Tenants due for appraisal           |
| GET    | `/api/reports`              | Generate report data (with filters) |

---

*Document version: 1.0 — TenM Implementation Plan*
*Stack: Next.js 14 · Tailwind CSS · Prisma · PostgreSQL · JWT*