import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo organization
  const organization = await prisma.organization.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Organization',
      subdomain: 'demo',
    },
  });

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@ivrbuilder.com' },
    update: {},
    create: {
      email: 'demo@ivrbuilder.com',
      passwordHash,
      name: 'Demo User',
      organizationId: organization.id,
      role: 'ADMIN',
    },
  });

  console.log('✅ Seeding completed!');
  console.log('📧 Demo user: demo@ivrbuilder.com');
  console.log('🔑 Password: demo123456');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

