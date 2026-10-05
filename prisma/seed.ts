import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CivicConnect database...');

  // 1. Clear existing data
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.issueSupport.deleteMany();
  await prisma.issueStatusHistory.deleteMany();
  await prisma.issueImage.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.category.deleteMany();
  await prisma.ward.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash default password
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Eleanor Vance (Admin)',
      email: 'admin@civicconnect.gov',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const auth1 = await prisma.user.create({
    data: {
      name: 'Officer Marcus Wright',
      email: 'marcus@civicconnect.gov',
      passwordHash: defaultPasswordHash,
      role: 'AUTHORITY',
      department: 'Public Works & Roads',
      status: 'ACTIVE',
    },
  });

  const auth2 = await prisma.user.create({
    data: {
      name: 'Inspector Sarah Chen',
      email: 'sarah@civicconnect.gov',
      passwordHash: defaultPasswordHash,
      role: 'AUTHORITY',
      department: 'Water & Utilities',
      status: 'ACTIVE',
    },
  });

  const citizens = [];
  const citizenNames = [
    'Alice Johnson',
    'Bob Smith',
    'Charlie Davis',
    'Diana Prince',
    'Ethan Hunt',
    'Fiona Gallagher',
    'George Clark',
    'Hannah Abbott',
  ];

  for (let i = 0; i < citizenNames.length; i++) {
    const c = await prisma.user.create({
      data: {
        name: citizenNames[i],
        email: `citizen${i + 1}@example.com`,
        passwordHash: defaultPasswordHash,
        role: 'CITIZEN',
        status: 'ACTIVE',
      },
    });
    citizens.push(c);
  }

  // 4. Create Wards
  const wardCentral = await prisma.ward.create({
    data: { name: 'Central District Ward 1', code: 'WARD-01' },
  });
  const wardNorth = await prisma.ward.create({
    data: { name: 'North River Ward 2', code: 'WARD-02' },
  });
  const wardSouth = await prisma.ward.create({
    data: { name: 'South Bay Ward 3', code: 'WARD-03' },
  });
  const wardEast = await prisma.ward.create({
    data: { name: 'Eastside Heights Ward 4', code: 'WARD-04' },
  });

  const wards = [wardCentral, wardNorth, wardSouth, wardEast];

  // 5. Create Categories
  const categoryData = [
    { name: 'Pothole', description: 'Road potholes causing traffic hazard or vehicle damage', icon: 'Construction' },
    { name: 'Road Damage', description: 'Cracks, erosion, unpaved or damaged asphalt', icon: 'AlertTriangle' },
    { name: 'Streetlight', description: 'Broken, non-functional, or flickering street lights', icon: 'Lightbulb' },
    { name: 'Garbage/Waste', description: 'Overflowing dumpsters, illegal dumping, littering', icon: 'Trash2' },
    { name: 'Water Leakage', description: 'Burst pipes, main water leak, wasting clean water', icon: 'Droplets' },
    { name: 'Drainage', description: 'Clogged storm drains, stagnant water, flooding', icon: 'Waves' },
    { name: 'Traffic Signal', description: 'Malfunctioning lights, missing signs, damaged signals', icon: 'ShieldAlert' },
    { name: 'Fallen Tree', description: 'Fallen trees or hazard branches blocking roads', icon: 'Trees' },
    { name: 'Public Toilet', description: 'Public sanitation issue, unhygienic facilities', icon: 'Bath' },
    { name: 'Other', description: 'General civic complaints and maintenance items', icon: 'HelpCircle' },
  ];

  const categories = [];
  for (const cat of categoryData) {
    const createdCat = await prisma.category.create({ data: cat });
    categories.push(createdCat);
  }

  // Base coordinates around downtown San Francisco / Metro area
  const baseLat = 37.7749;
  const baseLng = -122.4194;

  // 6. Create ~20 Sample Issues across lifecycle statuses & severities
  const sampleIssues = [
    {
      title: 'Massive Pothole on 5th & Market St',
      description: 'Severe 8-inch deep pothole right in the middle lane causing tire punctures during rush hour.',
      category: categories[0], // Pothole
      severity: 'CRITICAL',
      status: 'VERIFIED',
      priorityScore: 88,
      ward: wardCentral,
      reporter: citizens[0],
      assignedTo: auth1,
      offsetLat: 0.005,
      offsetLng: -0.003,
      address: '501 Market St, San Francisco, CA',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Flickering Streetlight Near Elementary School',
      description: 'Streetlight turns off completely at night making the pedestrian crosswalk pitch dark.',
      category: categories[2], // Streetlight
      severity: 'HIGH',
      status: 'ASSIGNED',
      priorityScore: 65,
      ward: wardNorth,
      reporter: citizens[1],
      assignedTo: auth1,
      offsetLat: 0.012,
      offsetLng: 0.008,
      address: '1200 North River Ave, San Francisco, CA',
      imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Overflowing Trash Bins at Community Park',
      description: 'Weekend garbage bins haven not been collected. Trash spreading into children play area.',
      category: categories[3], // Garbage
      severity: 'MEDIUM',
      status: 'IN_PROGRESS',
      priorityScore: 48,
      ward: wardSouth,
      reporter: citizens[2],
      assignedTo: auth2,
      offsetLat: -0.015,
      offsetLng: -0.01,
      address: '740 South Park Blvd, San Francisco, CA',
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Water Pipe Burst Flooding Sidewalk',
      description: 'Clean drinking water spewing out from underground valve box near bus stop.',
      category: categories[4], // Water Leakage
      severity: 'CRITICAL',
      status: 'RESOLVED',
      priorityScore: 82,
      ward: wardEast,
      reporter: citizens[3],
      assignedTo: auth2,
      offsetLat: 0.002,
      offsetLng: 0.015,
      address: '310 Eastside Ave, San Francisco, CA',
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800&auto=format&fit=crop&q=80',
      beforeImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800&auto=format&fit=crop&q=80',
      afterImage: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80',
      resolutionNote: 'Main line shutoff valve replaced by municipal water crew.',
    },
    {
      title: 'Blocked Storm Drain Causing Standing Water',
      description: 'Leaves and debris blocking drain inlet. Heavy rain causes 4-inch deep puddle on road.',
      category: categories[5], // Drainage
      severity: 'HIGH',
      status: 'CLOSED',
      priorityScore: 70,
      ward: wardCentral,
      reporter: citizens[4],
      assignedTo: auth1,
      offsetLat: -0.008,
      offsetLng: 0.005,
      address: '890 Mission St, San Francisco, CA',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      beforeImage: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      afterImage: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80',
      resolutionNote: 'Drain vacuumed out and clear flow restored.',
    },
    {
      title: 'Traffic Signal Red Light Blinking Erratic',
      description: 'Traffic light stuck on blinking red in all four directions creating intersection chaos.',
      category: categories[6], // Traffic Signal
      severity: 'CRITICAL',
      status: 'UNDER_REVIEW',
      priorityScore: 78,
      ward: wardNorth,
      reporter: citizens[5],
      assignedTo: null,
      offsetLat: 0.018,
      offsetLng: -0.005,
      address: 'Van Ness & Geary, San Francisco, CA',
      imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df515122519?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Large Oak Tree Branch Hanging Over Power Lines',
      description: 'Storm damaged large branch resting on overhead electrical distribution lines.',
      category: categories[7], // Fallen Tree
      severity: 'HIGH',
      status: 'SUBMITTED',
      priorityScore: 62,
      ward: wardSouth,
      reporter: citizens[6],
      assignedTo: null,
      offsetLat: -0.022,
      offsetLng: -0.018,
      address: '1450 Portola Dr, San Francisco, CA',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Vandalized Public Restroom Door',
      description: 'Lock broken on public park toilet facility, door hanging off hinges.',
      category: categories[8], // Public Toilet
      severity: 'LOW',
      status: 'SUBMITTED',
      priorityScore: 22,
      ward: wardEast,
      reporter: citizens[7],
      assignedTo: null,
      offsetLat: 0.008,
      offsetLng: 0.022,
      address: 'Front St Plaza, San Francisco, CA',
      imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Deep Asphalt Crack Expanding across Highway Ramp',
      description: '2-inch wide longitudinal crack growing across the main freeway entrance ramp.',
      category: categories[1], // Road Damage
      severity: 'MEDIUM',
      status: 'REJECTED',
      priorityScore: 30,
      ward: wardCentral,
      reporter: citizens[0],
      assignedTo: auth1,
      offsetLat: -0.003,
      offsetLng: -0.012,
      address: 'Hwy 101 Onramp, San Francisco, CA',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Broken Glass & Litter on Bicycle Lane',
      description: 'Shattered glass bottle littering 50 feet of dedicated bike lane.',
      category: categories[3], // Garbage
      severity: 'MEDIUM',
      status: 'REOPENED',
      priorityScore: 54,
      ward: wardNorth,
      reporter: citizens[1],
      assignedTo: auth1,
      offsetLat: 0.009,
      offsetLng: 0.002,
      address: '220 Polk St, San Francisco, CA',
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
    },
  ];

  // Add more generated issues to reach ~20 items
  for (let i = 11; i <= 20; i++) {
    const cat = categories[i % categories.length];
    const ward = wards[i % wards.length];
    const reporter = citizens[i % citizens.length];
    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const statuses = ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    const severity = severities[i % severities.length];
    const status = statuses[i % statuses.length];

    sampleIssues.push({
      title: `${cat.name} Report #${i} on Avenue ${i}`,
      description: `Civic issue regarding ${cat.name.toLowerCase()} reported by citizen requiring attention.`,
      category: cat,
      severity,
      status,
      priorityScore: Math.floor(Math.random() * 80) + 15,
      ward,
      reporter,
      assignedTo: i % 2 === 0 ? auth1 : auth2,
      offsetLat: (Math.random() - 0.5) * 0.05,
      offsetLng: (Math.random() - 0.5) * 0.05,
      address: `${100 * i} Civic Way, San Francisco, CA`,
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    });
  }

  for (const item of sampleIssues) {
    const createdIssue = await prisma.issue.create({
      data: {
        title: item.title,
        description: item.description,
        categoryId: item.category.id,
        severity: item.severity,
        status: item.status,
        priorityScore: item.priorityScore,
        lat: baseLat + item.offsetLat,
        lng: baseLng + item.offsetLng,
        address: item.address,
        wardId: item.ward.id,
        reporterId: item.reporter.id,
        assignedToId: item.assignedTo ? item.assignedTo.id : null,
        beforeImage: item.beforeImage || null,
        afterImage: item.afterImage || null,
        resolutionNote: item.resolutionNote || null,
        images: {
          create: item.imageUrl ? [{ url: item.imageUrl }] : [],
        },
      },
    });

    // Create initial status history entry
    await prisma.issueStatusHistory.create({
      data: {
        issueId: createdIssue.id,
        actorId: item.reporter.id,
        fromStatus: 'SUBMITTED',
        toStatus: item.status,
        note: `Issue initially created as ${item.status}`,
      },
    });

    // Add 2-4 supports for each issue
    const supportCount = Math.floor(Math.random() * 5) + 1;
    for (let s = 0; s < supportCount; s++) {
      const supporter = citizens[s % citizens.length];
      if (supporter.id !== item.reporter.id) {
        try {
          await prisma.issueSupport.create({
            data: {
              issueId: createdIssue.id,
              userId: supporter.id,
            },
          });
        } catch (e) {
          // ignore unique constraint in seed
        }
      }
    }

    // Add a sample comment
    await prisma.comment.create({
      data: {
        issueId: createdIssue.id,
        authorId: item.reporter.id,
        text: 'Thank you for looking into this issue! It has been affecting our neighborhood for days.',
      },
    });

    // Add a notification for reporter
    await prisma.notification.create({
      data: {
        userId: item.reporter.id,
        message: `Your issue "${item.title}" is currently status: ${item.status}`,
        link: `/issues/${createdIssue.id}`,
        read: false,
      },
    });
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
