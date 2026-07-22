// prisma/seed-real-properties.ts
//
// Cria os dois "active listings" reais entregues pelo cliente (1199 CR 542G
// e 5780 CR 569) com dados de preenchimento pendente, e sobe as fotos
// entregues para cada imóvel. O cliente completa preço, tipo, descrição
// etc. depois pelo painel admin.

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const FORMULARIO_DIR = path.join(
  process.cwd(),
  '..',
  '4Rivers Realty Formulario-20260720T135608Z-1-001',
  '4Rivers Realty Formulario'
)

const PENDING = 'PENDENTE — cliente vai preencher'

type ListingSeed = {
  address: string
  photosDir: string
}

const listings: ListingSeed[] = [
  {
    address: '1199 CR 542G',
    photosDir: path.join(FORMULARIO_DIR, 'Active Listing 1199 CR 542G'),
  },
  {
    address: '5780 CR 569',
    photosDir: path.join(FORMULARIO_DIR, 'Active Listing 5780 CR 569'),
  },
]

async function seedListing(listing: ListingSeed) {
  const property = await prisma.property.create({
    data: {
      title: `${listing.address} — ${PENDING}`,
      type: 'RESIDENTIAL',
      priceUsd: 0,
      acreage: 0,
      county: PENDING,
      city: PENDING,
      address: listing.address,
      description: PENDING,
      status: 'ACTIVE',
      source: 'AGENT',
      featured: false,
      showOnPortal: true,
    },
  })

  const destDir = path.join(process.cwd(), 'public', 'uploads', 'properties', property.id)
  fs.mkdirSync(destDir, { recursive: true })

  const files = fs
    .readdirSync(listing.photosDir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort()

  let sortOrder = 0
  for (const file of files) {
    const ext = path.extname(file)
    const destFilename = `${Date.now()}-${sortOrder}${ext}`
    fs.copyFileSync(path.join(listing.photosDir, file), path.join(destDir, destFilename))

    await prisma.propertyImage.create({
      data: {
        propertyId: property.id,
        url: `/uploads/properties/${property.id}/${destFilename}`,
        isCover: sortOrder === 0,
        sortOrder,
      },
    })
    sortOrder++
  }

  console.log(`✅ ${listing.address} — imóvel ${property.id} criado com ${sortOrder} fotos`)
}

async function main() {
  console.log('🌱 Seeding real active listings (1199 CR 542G, 5780 CR 569)...')
  for (const listing of listings) {
    await seedListing(listing)
  }
  console.log('\n🎉 Listagens reais criadas! Preço, tipo, condado e descrição estão marcados como PENDENTE.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
