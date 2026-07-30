// scripts/seed.js
// Creates sample products, users, agents and orders for testing

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // create products
  const products = [
    { name: 'بذر گندم رقم A', price: 100000, category: 'specs', stock: 100 },
    { name: 'بذر جو رقم B', price: 80000, category: 'specs', stock: 50 },
    { name: 'بذر ذرت رقم C', price: 120000, category: 'specs', stock: 30 },
  ];

  for (const p of products) {
    await prisma.product.upsert({ where: { name: p.name }, update: {}, create: p });
  }

  // create users
  const users = [];
  for (let i = 1; i <= 3; i++) {
    const phone = `+98912000000${i}`;
    const u = await prisma.user.upsert({ where: { phone }, update: {}, create: { phone } });
    users.push(u);
  }

  // create agents
  const agent = await prisma.agent.upsert({
    where: { phone: '+989130000001' },
    update: {},
    create: { phone: '+989130000001', agentCode: 'AGENT001', commissionRate: 5, firstName: 'علی', lastName: 'عامل' },
  });

  // create orders for users
  const allProducts = await prisma.product.findMany();

  for (const u of users) {
    const order = await prisma.order.create({
      data: {
        userId: u.id,
        agentId: agent.id,
        status: 'completed',
        total: allProducts[0].price,
        items: {
          create: [
            { productId: allProducts[0].id, quantity: 1, price: allProducts[0].price },
          ],
        },
      },
    });
    console.log('Created order', order.id, 'for user', u.phone);
  }

  console.log('Seed finished');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
