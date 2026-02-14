require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Testing Prisma Connection...');
  try {
    const leads = await prisma.lead.findMany();
    console.log('Success! Leads found:', leads.length);
    console.log(JSON.stringify(leads, null, 2));
  } catch (error) {
    console.error('Error fetching leads:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
