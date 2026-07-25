// این فایل رو توی ریشه‌ی پروژه (کنار package.json) به اسم create-content-admin.js ذخیره کن
// چون این پروژه از آداپتور pg برای اتصال به Neon استفاده می‌کنه، همون روش رو اینجا هم رعایت کردیم

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const DATABASE_URL = "postgresql://neondb_owner:npg_GmHp68reIcgq@ep-misty-shape-asllqu5n.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require";

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "empratoor110@gmail.com";
  const plainPassword = "3184640";

  const hashed = await bcrypt.hash(plainPassword, 10);

  const existing = await prisma.contentAdmin.findUnique({ where: { email } });
  if (existing) {
    console.log("این ایمیل قبلاً ثبت شده. حسابی ساخته نشد.");
    return;
  }

  await prisma.contentAdmin.create({
    data: { email, password: hashed },
  });

  console.log("حساب مدیر محتوا با موفقیت ساخته شد ✅");
  console.log("ایمیل:", email);
}

main()
  .catch((e) => console.error("خطا:", e))
  .finally(() => prisma.$disconnect());