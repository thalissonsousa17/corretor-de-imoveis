const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const fotos = await prisma.foto.findMany({
    take: 20
  })
  console.log('--- FOTOS ---')
  fotos.forEach(f => {
    console.log(`ID: ${f.id} | URL: "${f.url}"`)
  })
  
  const profiles = await prisma.corretorProfile.findMany({
    take: 5
  })
  console.log('\n--- PROFILES ---')
  profiles.forEach(p => {
    console.log(`Slug: ${p.slug} | Avatar: "${p.avatarUrl}" | Banner: "${p.bannerUrl}" | Logo: "${p.logoUrl}"`)
  })
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
