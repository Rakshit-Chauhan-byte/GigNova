import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gignova.com' },
    update: {},
    create: { email: 'admin@gignova.com', password: adminPassword, role: 'ADMIN' },
  });
  console.log('✅ Admin:', admin.email);

  // Student user
  const studentPassword = await bcrypt.hash('Student@123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@gignova.com' },
    update: {},
    create: {
      email: 'student@gignova.com',
      password: studentPassword,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Alex Johnson',
          college: 'MIT',
          degree: 'Computer Science',
          yearOfStudy: '3rd Year',
          skills: JSON.stringify(['React', 'TypeScript', 'Node.js', 'Python']),
          bio: 'Passionate CS student looking for internship opportunities.',
          preferredWorkType: 'remote',
        },
      },
    },
  });
  console.log('✅ Student:', student.email);

  // Business user
  const businessPassword = await bcrypt.hash('Business@123', 12);
  const business = await prisma.user.upsert({
    where: { email: 'business@gignova.com' },
    update: {},
    create: {
      email: 'business@gignova.com',
      password: businessPassword,
      role: 'BUSINESS',
      businessProfile: {
        create: {
          businessName: 'TechCorp Solutions',
          description: 'A leading tech company specializing in web applications.',
          industry: 'Technology',
          location: 'San Francisco, CA',
          verificationStatus: 'VERIFIED',
        },
      },
    },
  });
  console.log('✅ Business:', business.email);

  // Create sample gigs
  const businessProfile = await prisma.businessProfile.findUnique({
    where: { userId: business.id },
  });

  if (businessProfile) {
    const gigData = [
      {
        title: 'Frontend Developer Intern',
        description:
          'We are looking for a talented frontend developer to join our team for a 3-month internship. You will work on building responsive web applications using React and TypeScript.',
        category: 'Development',
        requiredSkills: JSON.stringify(['React', 'TypeScript', 'CSS', 'HTML']),
        compensation: '$2000/month',
        compensationType: 'monthly',
        workType: 'remote',
        duration: '3 months',
        openings: 2,
      },
      {
        title: 'Python Data Analyst',
        description:
          'Join our data team to analyze large datasets and create visualizations. Experience with pandas, numpy, and matplotlib required. This is a great opportunity to work on real-world data problems.',
        category: 'Data Science',
        requiredSkills: JSON.stringify(['Python', 'pandas', 'NumPy', 'SQL']),
        compensation: '$25/hour',
        compensationType: 'hourly',
        workType: 'hybrid',
        location: 'San Francisco, CA',
        duration: '6 months',
        openings: 1,
      },
      {
        title: 'UI/UX Design Project',
        description:
          'We need a creative UI/UX designer to redesign our mobile app. You will create wireframes, prototypes, and final designs using Figma.',
        category: 'Design',
        requiredSkills: JSON.stringify(['Figma', 'UI Design', 'UX Research', 'Prototyping']),
        compensation: '$1500',
        compensationType: 'fixed',
        workType: 'remote',
        duration: '1 month',
        openings: 1,
      },
    ];

    for (const gig of gigData) {
      await prisma.gig.create({
        data: { businessId: businessProfile.id, ...gig },
      });
    }
    console.log('✅ Sample gigs created');
  }

  console.log('\n🎉 Seed complete!\n');
  console.log('Login credentials:');
  console.log('  Admin:    admin@gignova.com    / Admin@123456');
  console.log('  Student:  student@gignova.com  / Student@123');
  console.log('  Business: business@gignova.com / Business@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
