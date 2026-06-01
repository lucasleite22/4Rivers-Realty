// prisma/seed.ts

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding 4Rivers Realty database...')

  // ── Users ──────────────────────────────────

  const adminPass = await hash('admin2024', 12)
  const agentPass = await hash('agent2024', 12)

  const lucas = await prisma.user.upsert({
    where: { email: 'lucas@4riversrealty.com' },
    update: {},
    create: {
      email: 'lucas@4riversrealty.com',
      name: 'Lucas Leite',
      password: adminPass,
      role: 'SUPER_ADMIN',
      active: true,
    },
  })

  const lindoso = await prisma.user.upsert({
    where: { email: 'lindoso@4riversrealty.com' },
    update: {},
    create: {
      email: 'lindoso@4riversrealty.com',
      name: 'Agent Lindoso',
      password: agentPass,
      role: 'AGENT',
      active: true,
    },
  })

  const luan = await prisma.user.upsert({
    where: { email: 'luan@4riversrealty.com' },
    update: {},
    create: {
      email: 'luan@4riversrealty.com',
      name: 'Agent Luan',
      password: agentPass,
      role: 'AGENT',
      active: true,
    },
  })

  console.log('✅ Users created')

  // ── Properties ─────────────────────────────

  const properties = await Promise.all([
    prisma.property.create({
      data: {
        title: 'Stunning 50-Acre Horse Farm with 3 Stables',
        type: 'HORSE_FARM',
        priceUsd: 1_250_000,
        acreage: 50,
        county: 'Marion',
        city: 'Ocala',
        address: '1234 Horse Farm Rd, Ocala, FL 34470',
        description: 'Beautiful horse farm featuring 3 large stables, 2 arenas, and lush pastures. Perfect for equestrian enthusiasts.',
        status: 'ACTIVE',
        featured: true,
        showOnPortal: true,
        stables: 3,
        arenas: 2,
        pastures: 8,
        images: {
          create: [
            { url: '/uploads/placeholder/horse-farm-1.jpg', isCover: true, sortOrder: 0 },
            { url: '/uploads/placeholder/horse-farm-2.jpg', isCover: false, sortOrder: 1 },
          ],
        },
      },
    }),

    prisma.property.create({
      data: {
        title: 'Working Ranch — 200 Acres with River Frontage',
        type: 'RANCH',
        priceUsd: 3_500_000,
        acreage: 200,
        county: 'Alachua',
        city: 'Gainesville',
        address: '9900 River Ranch Blvd, Gainesville, FL 32608',
        description: 'Premier working ranch with river frontage, 5 stock ponds, 4 barns, and miles of fencing. Income-producing cattle operation.',
        status: 'ACTIVE',
        featured: true,
        showOnPortal: true,
        stables: 4,
        arenas: 1,
        pastures: 20,
        images: {
          create: [
            { url: '/uploads/placeholder/ranch-1.jpg', isCover: true, sortOrder: 0 },
          ],
        },
      },
    }),

    prisma.property.create({
      data: {
        title: 'Luxury Equestrian Estate — 25 Acres',
        type: 'HORSE_FARM',
        priceUsd: 875_000,
        acreage: 25,
        county: 'Levy',
        city: 'Williston',
        address: '456 Equestrian Dr, Williston, FL 32696',
        description: 'Elegant 4-bed/3-bath home on 25 pristine acres with a 10-stall center-aisle barn, round pen, and jump arena.',
        status: 'ACTIVE',
        featured: true,
        showOnPortal: true,
        stables: 1,
        arenas: 2,
        pastures: 5,
        images: {
          create: [
            { url: '/uploads/placeholder/estate-1.jpg', isCover: true, sortOrder: 0 },
          ],
        },
      },
    }),

    prisma.property.create({
      data: {
        title: 'Residential Farmhouse on 10 Acres',
        type: 'RESIDENTIAL',
        priceUsd: 495_000,
        acreage: 10,
        county: 'Marion',
        city: 'Reddick',
        address: '789 Farmhouse Ln, Reddick, FL 32686',
        description: 'Charming 3-bed/2-bath farmhouse with updated kitchen, large front porch, and 10 fenced acres. Perfect starter farm.',
        status: 'ACTIVE',
        featured: true,
        showOnPortal: true,
        images: {
          create: [
            { url: '/uploads/placeholder/residential-1.jpg', isCover: true, sortOrder: 0 },
          ],
        },
      },
    }),

    prisma.property.create({
      data: {
        title: 'Prime Commercial Land — 5 Acres Highway Frontage',
        type: 'COMMERCIAL',
        priceUsd: 650_000,
        acreage: 5,
        county: 'Marion',
        city: 'Ocala',
        address: 'Lot 12, US-27, Ocala, FL 34471',
        description: 'High-visibility commercial lot on US-27 with 400ft of highway frontage. Zoned B-2. Ideal for retail, storage, or agribusiness.',
        status: 'ACTIVE',
        featured: false,
        showOnPortal: true,
        images: {
          create: [
            { url: '/uploads/placeholder/commercial-1.jpg', isCover: true, sortOrder: 0 },
          ],
        },
      },
    }),

    prisma.property.create({
      data: {
        title: 'Raw Land — 75 Acres Timber & Pasture',
        type: 'LAND',
        priceUsd: 375_000,
        acreage: 75,
        county: 'Putnam',
        city: 'Palatka',
        address: 'TR 14, County Rd 315, Palatka, FL 32177',
        description: 'Diverse 75-acre parcel with mature pine timber, open pasture, and small pond. Road frontage on paved county road.',
        status: 'ACTIVE',
        featured: true,
        showOnPortal: true,
        images: {
          create: [
            { url: '/uploads/placeholder/land-1.jpg', isCover: true, sortOrder: 0 },
          ],
        },
      },
    }),
  ])

  console.log(`✅ ${properties.length} properties created`)

  // ── Leads ──────────────────────────────────

  const leadsData = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(352) 555-0101',
      type: 'BUYER' as const,
      origin: 'WEBSITE' as const,
      propertyInterest: 'Horse farm with stables',
      budgetUsd: 1_500_000,
      acreageDesired: 40,
      countyPreferred: 'Marion',
      status: 'SHOWING' as const,
      assignedToId: lindoso.id,
      lastContactAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Michael Torres',
      email: 'mtorres@gmail.com',
      phone: '(386) 555-0202',
      type: 'BUYER' as const,
      origin: 'ZILLOW' as const,
      propertyInterest: 'Working ranch',
      budgetUsd: 4_000_000,
      acreageDesired: 150,
      countyPreferred: 'Alachua',
      status: 'OFFER_MADE' as const,
      assignedToId: lucas.id,
      lastContactAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Emily Chen',
      email: 'emily.chen@corp.com',
      phone: '(407) 555-0303',
      type: 'INVESTOR' as const,
      origin: 'REFERRAL' as const,
      propertyInterest: 'Agricultural land investment',
      budgetUsd: 2_000_000,
      status: 'CONTACTED' as const,
      assignedToId: luan.id,
      lastContactAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Robert Williams',
      email: 'rwilliams@yahoo.com',
      phone: '(352) 555-0404',
      type: 'SELLER' as const,
      origin: 'INSTAGRAM' as const,
      propertyInterest: 'Selling 30-acre farm in Marion County',
      status: 'NEW_LEAD' as const,
      assignedToId: lindoso.id,
      lastContactAt: null,
    },
    {
      name: 'Jennifer Davis',
      email: 'jdavis@outlook.com',
      phone: '(904) 555-0505',
      type: 'BUYER' as const,
      origin: 'REALTOR_COM' as const,
      propertyInterest: 'Residential farmhouse',
      budgetUsd: 550_000,
      acreageDesired: 10,
      countyPreferred: 'Marion',
      status: 'CONTACTED' as const,
      assignedToId: luan.id,
      lastContactAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // overdue
    },
    {
      name: 'Carlos Mendez',
      email: 'cmendez@business.com',
      phone: '(305) 555-0606',
      type: 'INVESTOR' as const,
      origin: 'OTHER' as const,
      propertyInterest: 'Commercial land near highway',
      budgetUsd: 800_000,
      status: 'UNDER_CONTRACT' as const,
      assignedToId: lucas.id,
      lastContactAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Amanda Foster',
      email: 'afoster@email.com',
      type: 'BUYER' as const,
      origin: 'WEBSITE' as const,
      propertyInterest: 'Equestrian estate',
      budgetUsd: 900_000,
      status: 'CLOSED_WON' as const,
      assignedToId: lindoso.id,
      lastContactAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'David Park',
      email: 'dpark@gmail.com',
      phone: '(321) 555-0808',
      type: 'BUYER' as const,
      origin: 'ZILLOW' as const,
      propertyInterest: 'Timber land in Putnam County',
      budgetUsd: 400_000,
      status: 'NEW_LEAD' as const,
      assignedToId: null,
      lastContactAt: null,
    },
  ]

  const createdLeads = await Promise.all(
    leadsData.map((lead) =>
      prisma.lead.create({
        data: {
          ...lead,
          budgetUsd: lead.budgetUsd ?? null,
          acreageDesired: lead.acreageDesired ?? null,
        },
      })
    )
  )

  console.log(`✅ ${createdLeads.length} leads created`)

  // ── Lead Activities ────────────────────────

  const activities = [
    {
      leadId: createdLeads[0].id,
      userId: lindoso.id,
      type: 'CALL' as const,
      notes: 'Initial call — discussed horse farm requirements. Interested in Marion County properties.',
      activityDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      leadId: createdLeads[0].id,
      userId: lindoso.id,
      type: 'SHOWING' as const,
      notes: 'Showed the 50-acre horse farm on Horse Farm Rd. Client very interested.',
      activityDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      leadId: createdLeads[1].id,
      userId: lucas.id,
      type: 'EMAIL' as const,
      notes: 'Sent listing package for the 200-acre ranch. Client requested financials.',
      activityDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      leadId: createdLeads[1].id,
      userId: lucas.id,
      type: 'OFFER' as const,
      notes: 'Client submitted offer at $3.2M. Counter-offer pending.',
      activityDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      leadId: createdLeads[2].id,
      userId: luan.id,
      type: 'CALL' as const,
      notes: 'Discussed investment goals. Looking for 50+ acres with timber value.',
      activityDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      leadId: createdLeads[5].id,
      userId: lucas.id,
      type: 'NOTE' as const,
      notes: 'Contract signed for 5-acre commercial lot. Closing scheduled in 30 days.',
      activityDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      leadId: createdLeads[6].id,
      userId: lindoso.id,
      type: 'NOTE' as const,
      notes: 'Deal closed. Client purchased equestrian estate on Equestrian Dr. Total: $862,500.',
      activityDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ]

  await Promise.all(activities.map((a) => prisma.leadActivity.create({ data: a })))
  console.log(`✅ ${activities.length} activities created`)

  // ── Dashboard Events ───────────────────────

  await prisma.dashboardEvent.createMany({
    data: [
      { type: 'LEAD_CREATED', entityId: createdLeads[0].id, entityType: 'Lead', metadata: { name: 'Sarah Johnson' }, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { type: 'SHOWING_SCHEDULED', entityId: createdLeads[0].id, entityType: 'Lead', userId: lindoso.id, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { type: 'OFFER_MADE', entityId: createdLeads[1].id, entityType: 'Lead', userId: lucas.id, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { type: 'DEAL_CLOSED', entityId: createdLeads[6].id, entityType: 'Lead', userId: lindoso.id, metadata: { leadName: 'Amanda Foster' }, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    ],
  })

  console.log('✅ Dashboard events created')
  console.log('\n🎉 Seed complete!\n')
  console.log('Login credentials:')
  console.log('  Admin: lucas@4riversrealty.com / admin2024')
  console.log('  Agent: lindoso@4riversrealty.com / agent2024')
  console.log('  Agent: luan@4riversrealty.com / agent2024')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
