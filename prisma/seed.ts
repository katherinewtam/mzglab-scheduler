import { PrismaClient, Role, ReservationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const passwordHash = await bcrypt.hash('password123', 10);

  const kathy = await prisma.user.upsert({
    where: { email: 'kathy@mzglab.caltech.edu' },
    update: {},
    create: {
      name: 'Kathy',
      email: 'kathy@mzglab.caltech.edu',
      passwordHash,
      role: Role.USER,
    },
  });

  const yuqi = await prisma.user.upsert({
    where: { email: 'yuqi@mzglab.caltech.edu' },
    update: {},
    create: {
      name: 'Yuqi',
      email: 'yuqi@mzglab.caltech.edu',
      passwordHash,
      role: Role.USER,
    },
  });

  const damla = await prisma.user.upsert({
    where: { email: 'damla@mzglab.caltech.edu' },
    update: {},
    create: {
      name: 'Damla',
      email: 'damla@mzglab.caltech.edu',
      passwordHash,
      role: Role.USER,
    },
  });

  const breanna = await prisma.user.upsert({
    where: { email: 'breanna@mzglab.caltech.edu' },
    update: {},
    create: {
      name: 'Breanna',
      email: 'breanna@mzglab.caltech.edu',
      passwordHash,
      role: Role.USER,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@mzglab.caltech.edu' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@mzglab.caltech.edu',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // Create resources
  const spinningDisk = await prisma.resource.upsert({
    where: { slug: '3i-spinning-disk' },
    update: {},
    create: {
      name: '3i Spinning Disk',
      slug: '3i-spinning-disk',
      description: '3i Spinning disk confocal microscope',
      instructions: 'User must be trained before using the system.',
      requiresTraining: true,
      bookingIncrementMinutes: 15,
      minimumBookingMinutes: 30,
      maximumBookingMinutes: 1440,
      color: '#dbeafe',
    },
  });

  const imarisProcessing = await prisma.resource.upsert({
    where: { slug: 'imaris-processing' },
    update: {},
    create: {
      name: 'Imaris Processing',
      slug: 'imaris-processing',
      description: 'Image-processing workstation',
      instructions: 'Contact lab administrator for software licensing information.',
      requiresTraining: false,
      bookingIncrementMinutes: 30,
      minimumBookingMinutes: 60,
      maximumBookingMinutes: 480,
      color: '#fef3c7',
    },
  });

  const leicaSP8 = await prisma.resource.upsert({
    where: { slug: 'leica-sp8' },
    update: {},
    create: {
      name: 'Leica SP8',
      slug: 'leica-sp8',
      description: 'Leica SP8 confocal microscope',
      instructions: 'Users must complete microscope training before independent use.',
      requiresTraining: true,
      bookingIncrementMinutes: 15,
      minimumBookingMinutes: 30,
      maximumBookingMinutes: 1440,
      color: '#dcfce7',
    },
  });

  const macPro = await prisma.resource.upsert({
    where: { slug: 'mac-pro' },
    update: {},
    create: {
      name: 'Mac Pro',
      slug: 'mac-pro',
      description: 'Analysis workstation',
      instructions: 'High-performance computing workstation for image analysis.',
      requiresTraining: false,
      bookingIncrementMinutes: 30,
      minimumBookingMinutes: 60,
      maximumBookingMinutes: 480,
      color: '#e0e7ff',
    },
  });

  const zeiss980 = await prisma.resource.upsert({
    where: { slug: 'zeiss-980' },
    update: {},
    create: {
      name: 'Zeiss 980',
      slug: 'zeiss-980',
      description: 'Zeiss 980 confocal microscope',
      instructions: 'Advanced confocal system. Training required before use.',
      requiresTraining: true,
      bookingIncrementMinutes: 15,
      minimumBookingMinutes: 30,
      maximumBookingMinutes: 1440,
      color: '#fce7f3',
    },
  });

  // Grant training permissions
  await prisma.trainingPermission.upsert({
    where: {
      userId_resourceId: {
        userId: kathy.id,
        resourceId: spinningDisk.id,
      },
    },
    update: {},
    create: {
      userId: kathy.id,
      resourceId: spinningDisk.id,
      trained: true,
      trainedAt: new Date(),
      approvedBy: admin.id,
    },
  });

  await prisma.trainingPermission.upsert({
    where: {
      userId_resourceId: {
        userId: kathy.id,
        resourceId: leicaSP8.id,
      },
    },
    update: {},
    create: {
      userId: kathy.id,
      resourceId: leicaSP8.id,
      trained: true,
      trainedAt: new Date(),
      approvedBy: admin.id,
    },
  });

  await prisma.trainingPermission.upsert({
    where: {
      userId_resourceId: {
        userId: yuqi.id,
        resourceId: spinningDisk.id,
      },
    },
    update: {},
    create: {
      userId: yuqi.id,
      resourceId: spinningDisk.id,
      trained: true,
      trainedAt: new Date(),
      approvedBy: admin.id,
    },
  });

  await prisma.trainingPermission.upsert({
    where: {
      userId_resourceId: {
        userId: damla.id,
        resourceId: leicaSP8.id,
      },
    },
    update: {},
    create: {
      userId: damla.id,
      resourceId: leicaSP8.id,
      trained: true,
      trainedAt: new Date(),
      approvedBy: admin.id,
    },
  });

  // Create sample reservations
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get the current week's Monday
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + daysToMonday);

  // Kathy's reservation on Wednesday
  const wednesday = new Date(monday);
  wednesday.setDate(monday.getDate() + 2);
  await prisma.reservation.create({
    data: {
      userId: kathy.id,
      resourceId: spinningDisk.id,
      startTime: new Date(wednesday.getFullYear(), wednesday.getMonth(), wednesday.getDate(), 14, 0),
      endTime: new Date(wednesday.getFullYear(), wednesday.getMonth(), wednesday.getDate(), 17, 0),
      reservationType: ReservationType.STANDARD,
      description: 'Mouse embryo live imaging',
    },
  });

  // Yuqi's overnight reservation (Monday evening to Tuesday morning)
  const tuesday = new Date(monday);
  tuesday.setDate(monday.getDate() + 1);
  await prisma.reservation.create({
    data: {
      userId: yuqi.id,
      resourceId: spinningDisk.id,
      startTime: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 14, 0),
      endTime: new Date(tuesday.getFullYear(), tuesday.getMonth(), tuesday.getDate(), 9, 0),
      reservationType: ReservationType.LONG_TERM,
      description: '2-cell embryo live imaging',
    },
  });

  // Damla's overnight reservation (Wednesday evening to Thursday morning)
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  await prisma.reservation.create({
    data: {
      userId: damla.id,
      resourceId: leicaSP8.id,
      startTime: new Date(wednesday.getFullYear(), wednesday.getMonth(), wednesday.getDate(), 16, 0),
      endTime: new Date(thursday.getFullYear(), thursday.getMonth(), thursday.getDate(), 9, 0),
      reservationType: ReservationType.LONG_TERM,
      description: 'Time-lapse imaging',
    },
  });

  // Breanna's Friday afternoon reservation
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  await prisma.reservation.create({
    data: {
      userId: breanna.id,
      resourceId: macPro.id,
      startTime: new Date(friday.getFullYear(), friday.getMonth(), friday.getDate(), 10, 0),
      endTime: new Date(friday.getFullYear(), friday.getMonth(), friday.getDate(), 14, 0),
      reservationType: ReservationType.STANDARD,
      description: 'Image analysis',
    },
  });

  console.log('Database seeded successfully!');
  console.log('\nSample login credentials:');
  console.log('Email: kathy@mzglab.caltech.edu');
  console.log('Email: yuqi@mzglab.caltech.edu');
  console.log('Email: admin@mzglab.caltech.edu');
  console.log('Password (all users): password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
