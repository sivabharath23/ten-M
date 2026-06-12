-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('SINGLE', 'MULTIPLE');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "FlatStatus" AS ENUM ('VACANT', 'OCCUPIED');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'VACATED');

-- CreateEnum
CREATE TYPE "RentStatus" AS ENUM ('PENDING', 'PAID', 'PARTIAL', 'OVERDUE');

-- CreateEnum
CREATE TYPE "AdvanceType" AS ENUM ('RECEIVED', 'DEDUCTED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "userType" "UserType" NOT NULL DEFAULT 'SINGLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appraisalPercent" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "waterCostPerLitre" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "lateFeeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lateFeeGraceDays" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL DEFAULT 'RESIDENTIAL',
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flat" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "flatNumber" TEXT NOT NULL,
    "floor" INTEGER NOT NULL DEFAULT 0,
    "bhkType" TEXT NOT NULL DEFAULT '1BHK',
    "baseRent" DOUBLE PRECISION NOT NULL,
    "status" "FlatStatus" NOT NULL DEFAULT 'VACANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "flatId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "idProofType" TEXT,
    "idProofNumber" TEXT,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "currentRent" DOUBLE PRECISION NOT NULL,
    "advanceAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "flatId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "rentAmount" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidOn" TIMESTAMP(3),
    "status" "RentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterRecord" (
    "id" TEXT NOT NULL,
    "flatId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "unitsConsumed" DOUBLE PRECISION NOT NULL,
    "costPerLitre" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "paidOn" TIMESTAMP(3),
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaterRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvanceRecord" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "AdvanceType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdvanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentRevision" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "previousRent" DOUBLE PRECISION NOT NULL,
    "newRent" DOUBLE PRECISION NOT NULL,
    "appraisalPercent" DOUBLE PRECISION NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");

-- CreateIndex
CREATE INDEX "Property_userId_idx" ON "Property"("userId");

-- CreateIndex
CREATE INDEX "Property_status_idx" ON "Property"("status");

-- CreateIndex
CREATE INDEX "Flat_propertyId_idx" ON "Flat"("propertyId");

-- CreateIndex
CREATE INDEX "Flat_status_idx" ON "Flat"("status");

-- CreateIndex
CREATE INDEX "Tenant_flatId_idx" ON "Tenant"("flatId");

-- CreateIndex
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- CreateIndex
CREATE INDEX "RentRecord_tenantId_idx" ON "RentRecord"("tenantId");

-- CreateIndex
CREATE INDEX "RentRecord_month_year_idx" ON "RentRecord"("month", "year");

-- CreateIndex
CREATE INDEX "RentRecord_status_idx" ON "RentRecord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RentRecord_tenantId_month_year_key" ON "RentRecord"("tenantId", "month", "year");

-- CreateIndex
CREATE INDEX "WaterRecord_flatId_idx" ON "WaterRecord"("flatId");

-- CreateIndex
CREATE INDEX "WaterRecord_month_year_idx" ON "WaterRecord"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "WaterRecord_flatId_month_year_key" ON "WaterRecord"("flatId", "month", "year");

-- CreateIndex
CREATE INDEX "AdvanceRecord_tenantId_idx" ON "AdvanceRecord"("tenantId");

-- CreateIndex
CREATE INDEX "RentRevision_tenantId_idx" ON "RentRevision"("tenantId");

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flat" ADD CONSTRAINT "Flat_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "Flat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentRecord" ADD CONSTRAINT "RentRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentRecord" ADD CONSTRAINT "RentRecord_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "Flat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterRecord" ADD CONSTRAINT "WaterRecord_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "Flat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvanceRecord" ADD CONSTRAINT "AdvanceRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentRevision" ADD CONSTRAINT "RentRevision_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
