import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calculateSmartMatchScore } from '../src/services/matching.service';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding GigNova SmartMatch realistic demonstration data...');

  const passwordHash = await bcrypt.hash('Demo@12345', 10);

  // 1. Create Demo Businesses
  const biz1User = await prisma.user.upsert({
    where: { email: 'demo-biz-cloud@demo.gignova.com' },
    update: {},
    create: {
      email: 'demo-biz-cloud@demo.gignova.com',
      password: passwordHash,
      role: 'BUSINESS',
      businessProfile: {
        create: {
          businessName: 'CloudScale Technologies',
          description:
            'Enterprise cloud software company specializing in distributed systems, modern web platforms, and automated developer tooling.',
          industry: 'Cloud Software & SaaS',
          businessEmail: 'recruiting@cloudscale.demo',
          contactPhone: '+91 98101 23456',
          website: 'https://cloudscale.demo.gignova.com',
          location: 'New Delhi, India',
          verificationStatus: 'VERIFIED',
        },
      },
    },
    include: { businessProfile: true },
  });

  const biz2User = await prisma.user.upsert({
    where: { email: 'demo-biz-design@demo.gignova.com' },
    update: {},
    create: {
      email: 'demo-biz-design@demo.gignova.com',
      password: passwordHash,
      role: 'BUSINESS',
      businessProfile: {
        create: {
          businessName: 'PixelCraft Digital Studio',
          description:
            'Award-winning product design and modern frontend engineering studio serving global tech startups.',
          industry: 'Product Design & Mobile',
          businessEmail: 'careers@pixelcraft.demo',
          contactPhone: '+91 98712 34567',
          website: 'https://pixelcraft.demo.gignova.com',
          location: 'Noida, India',
          verificationStatus: 'VERIFIED',
        },
      },
    },
    include: { businessProfile: true },
  });

  console.log('✅ Demo Businesses created / verified');

  const biz1Profile = biz1User.businessProfile || (await prisma.businessProfile.findUnique({ where: { userId: biz1User.id } }))!;
  const biz2Profile = biz2User.businessProfile || (await prisma.businessProfile.findUnique({ where: { userId: biz2User.id } }))!;

  // 2. Create 5 Diverse Gigs
  const gigsData = [
    {
      id: 'demo-gig-01-fullstack',
      businessId: biz1Profile.id,
      title: 'Full Stack React & Node.js Developer Intern',
      description:
        'We need an energetic full stack developer to help build scalable microservices and dashboard interfaces. You will collaborate on REST APIs, PostgreSQL databases, and modern React TypeScript frontend modules. Great opportunity for hands-on production experience.',
      category: 'Development',
      requiredSkills: JSON.stringify(['React', 'TypeScript', 'Node.js', 'PostgreSQL']),
      compensation: '₹28,000/month',
      compensationType: 'monthly',
      workType: 'remote',
      location: 'Remote, India',
      duration: '3 months',
      openings: 3,
      requiredAvailability: 'Part-time (20 hours/week)',
      status: 'ACTIVE',
    },
    {
      id: 'demo-gig-02-uiux',
      businessId: biz2Profile.id,
      title: 'UI/UX Product Designer & Prototyper',
      description:
        'Looking for a student designer proficient in Figma to create user personas, responsive wireframes, component design systems, and high-fidelity interactive prototypes for a new fintech SaaS product.',
      category: 'Design',
      requiredSkills: JSON.stringify(['Figma', 'UI Design', 'UX Research', 'Prototyping']),
      compensation: '₹22,000/month',
      compensationType: 'monthly',
      workType: 'remote',
      location: 'Remote',
      duration: '2 months',
      openings: 2,
      requiredAvailability: 'Flexible (15 hours/week)',
      status: 'ACTIVE',
    },
    {
      id: 'demo-gig-03-datascience',
      businessId: biz1Profile.id,
      title: 'Python & Data Analytics Specialist',
      description:
        'Exciting analytics gig involving exploratory data analysis, data cleaning pipelines, and customer behavior insights using Pandas, NumPy, and SQL. You will build automated weekly visualization dashboards and model summaries.',
      category: 'Data Science',
      requiredSkills: JSON.stringify(['Python', 'Pandas', 'SQL', 'Data Analysis']),
      compensation: '₹25,000/month',
      compensationType: 'monthly',
      workType: 'hybrid',
      location: 'Noida, Sector 62',
      duration: '3 months',
      openings: 2,
      requiredAvailability: 'Part-time (20 hours/week)',
      status: 'ACTIVE',
    },
    {
      id: 'demo-gig-04-mobile',
      businessId: biz2Profile.id,
      title: 'Mobile App Developer (Flutter & REST APIs)',
      description:
        'Seeking an enthusiastic mobile developer to assist in building cross-platform student collaboration tools. Experience integrating RESTful APIs and state management required.',
      category: 'Development',
      requiredSkills: JSON.stringify(['Flutter', 'React Native', 'REST API', 'JavaScript']),
      compensation: '₹24,000/month',
      compensationType: 'monthly',
      workType: 'remote',
      location: 'Remote',
      duration: '2 months',
      openings: 1,
      requiredAvailability: 'Part-time (20 hours/week)',
      status: 'ACTIVE',
    },
    {
      id: 'demo-gig-05-devops-onsite',
      businessId: biz1Profile.id,
      title: 'On-Site Systems & DevOps Infrastructure Intern',
      description:
        'Mandatory on-site internship in New Delhi engineering lab. Involves Docker container setup, Linux server automation, CI/CD pipelines, and internal staging deployments. Requires physical presence for server rack management.',
      category: 'DevOps',
      requiredSkills: JSON.stringify(['Docker', 'Linux', 'AWS', 'CI/CD']),
      compensation: '₹30,000/month',
      compensationType: 'monthly',
      workType: 'onsite',
      location: 'Connaught Place, New Delhi',
      duration: '3 months',
      openings: 1,
      requiredAvailability: 'Full-time (35 hours/week)',
      status: 'ACTIVE',
    },
  ];

  const createdGigs: any[] = [];
  for (const g of gigsData) {
    const gig = await prisma.gig.upsert({
      where: { id: g.id },
      update: {
        title: g.title,
        description: g.description,
        category: g.category,
        requiredSkills: g.requiredSkills,
        compensation: g.compensation,
        compensationType: g.compensationType,
        workType: g.workType,
        location: g.location,
        duration: g.duration,
        openings: g.openings,
        requiredAvailability: g.requiredAvailability,
        status: g.status,
      },
      create: g,
    });
    createdGigs.push(gig);
  }
  console.log(`✅ Created / verified ${createdGigs.length} demonstration gigs`);

  // 3. Create 15 Realistic Student Profiles
  const studentsSeed = [
    {
      id: 'demo-std-01',
      email: 'demo-student-01@demo.gignova.com',
      fullName: 'Rohan Sharma',
      college: 'Sharda University',
      degree: 'B.Tech Computer Science & Engineering',
      yearOfStudy: '4th Year',
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Express.js', 'Git', 'Tailwind CSS'],
      experience:
        'Built full-stack e-commerce portal in React & Node.js with PostgreSQL backend. Completed 6-month software development project at college hackathon winner.',
      portfolioUrl: 'https://rohansharma.dev',
      githubUrl: 'https://github.com/rohan-sharma-dev',
      linkedinUrl: 'https://linkedin.com/in/rohan-sharma-demo',
      availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], hours: '25 hrs/week' },
      preferredWorkType: 'remote',
      bio: 'Full stack developer enthusiast passionate about clean code, high performance web apps, and modern developer tooling.',
    },
    {
      id: 'demo-std-02',
      email: 'demo-student-02@demo.gignova.com',
      fullName: 'Ananya Verma',
      college: 'IIT Delhi',
      degree: 'B.Tech Computer Science',
      yearOfStudy: '3rd Year',
      skills: ['React.js', 'TypeScript', 'Next.js', 'GraphQL', 'Tailwind CSS', 'Redux', 'Jest'],
      experience:
        'Frontend lead for college tech fest portal visited by 15,000+ attendees. Developed responsive dashboards using React, TypeScript, and modern CSS.',
      portfolioUrl: 'https://ananya-verma.design',
      githubUrl: 'https://github.com/ananya-verma',
      linkedinUrl: 'https://linkedin.com/in/ananya-verma-demo',
      availability: { days: ['Mon', 'Wed', 'Fri'], hours: '20 hrs/week' },
      preferredWorkType: 'remote',
      bio: 'UI engineer obsessed with micro-interactions, accessibility standards, and performant React applications.',
    },
    {
      id: 'demo-std-03',
      email: 'demo-student-03@demo.gignova.com',
      fullName: 'Vikram Malhotra',
      college: 'DTU Delhi',
      degree: 'B.Tech Information Technology',
      yearOfStudy: '4th Year',
      skills: ['Docker', 'Linux', 'AWS', 'Kubernetes', 'CI/CD', 'Python', 'Bash'],
      experience:
        'DevOps intern at early-stage startup. Managed containerized Kubernetes clusters on AWS EC2, automated GitHub Actions pipelines, and configured Prometheus alerts.',
      portfolioUrl: 'https://vikram-infra.tech',
      githubUrl: 'https://github.com/vikram-infra',
      linkedinUrl: 'https://linkedin.com/in/vikram-infra-demo',
      availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], hours: '40 hrs/week' },
      preferredWorkType: 'onsite',
      bio: 'Cloud architecture enthusiast, certified AWS Solutions Architect Associate, and open-source infrastructure contributor.',
    },
    {
      id: 'demo-std-04',
      email: 'demo-student-04@demo.gignova.com',
      fullName: 'Priya Iyer',
      college: 'NID Ahmedabad / Sharda Design',
      degree: 'B.Des Interaction & Product Design',
      yearOfStudy: '3rd Year',
      skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Wireframing', 'Design Systems'],
      experience:
        'Designed end-to-end mobile banking application prototype that won top honors at National Design Conclave. Conducted usability testing sessions with 40+ user participants.',
      portfolioUrl: 'https://priyaiyer.portfolio.demo',
      githubUrl: '',
      linkedinUrl: 'https://linkedin.com/in/priya-iyer-design',
      availability: { days: ['Tue', 'Thu', 'Sat'], hours: '18 hrs/week' },
      preferredWorkType: 'remote',
      bio: 'Human-centered product designer translating complex workflows into intuitive, joyful consumer experiences.',
    },
    {
      id: 'demo-std-05',
      email: 'demo-student-05@demo.gignova.com',
      fullName: 'Aman Preet Singh',
      college: 'BITS Pilani',
      degree: 'M.Sc Data Science & Economics',
      yearOfStudy: '2nd Year (Master)',
      skills: ['Python', 'Pandas', 'NumPy', 'SQL', 'Data Analysis', 'Scikit-Learn', 'Matplotlib'],
      experience:
        'Published research paper on student churn prediction. Built automated ETL pipelines in Python & SQL analyzing 250,000+ transactional records.',
      portfolioUrl: 'https://amanpreet-data.ai',
      githubUrl: 'https://github.com/amanpreet-ds',
      linkedinUrl: 'https://linkedin.com/in/amanpreet-singh-demo',
      availability: { days: ['Mon', 'Tue', 'Wed', 'Thu'], hours: '22 hrs/week' },
      preferredWorkType: 'hybrid',
      bio: 'Data scientist focused on translating messy datasets into actionable visual insights and predictive statistical models.',
    },
    {
      id: 'demo-std-06',
      email: 'demo-student-06@demo.gignova.com',
      fullName: 'Sneha Patel',
      college: 'IIIT Delhi',
      degree: 'B.Tech Computer Science',
      yearOfStudy: '3rd Year',
      skills: ['Flutter', 'Dart', 'React Native', 'JavaScript', 'REST API', 'Firebase'],
      experience:
        'Published 2 apps on Google Play Store with 5,000+ downloads. Experienced in multi-platform mobile architectures, state management with Bloc/Provider, and offline caching.',
      portfolioUrl: 'https://snehapatel-mobile.dev',
      githubUrl: 'https://github.com/sneha-mobile',
      linkedinUrl: 'https://linkedin.com/in/sneha-patel-demo',
      availability: { days: ['Mon', 'Wed', 'Fri'], hours: '20 hrs/week' },
      preferredWorkType: 'remote',
      bio: 'Cross-platform mobile engineer who loves crafting pixel-perfect, 60fps mobile interfaces.',
    },
    {
      id: 'demo-std-07',
      email: 'demo-student-07@demo.gignova.com',
      fullName: 'Arjun Nambiar',
      college: 'Sharda University',
      degree: 'B.Tech Information Technology',
      yearOfStudy: '2nd Year',
      skills: ['JavaScript', 'HTML5', 'CSS3', 'NodeJS', 'Express'],
      experience:
        'Completed semester projects in web programming. Developed a personal blog engine and a student notes aggregator with Express.js and MongoDB.',
      portfolioUrl: '',
      githubUrl: 'https://github.com/arjun-nambiar',
      linkedinUrl: 'https://linkedin.com/in/arjun-nambiar-demo',
      availability: { days: ['Weekends', 'Evenings'], hours: '12 hrs/week' },
      preferredWorkType: 'remote',
      bio: 'Eager sophomore learner expanding from fundamental web development to full-stack production stacks.',
    },
    {
      id: 'demo-std-08',
      email: 'demo-student-08@demo.gignova.com',
      fullName: 'Tanvi Kapoor',
      college: 'SRM University',
      degree: 'BCA (Computer Applications)',
      yearOfStudy: '3rd Year',
      skills: ['Figma', 'Adobe XD', 'HTML', 'CSS', 'UI/UX Design', 'Canva'],
      experience:
        'Freelance graphic designer for local student clubs. Created brand identities, poster designs, and simple website mockups using Figma and Adobe Suite.',
      portfolioUrl: 'https://tanvikapoor.crevado.com',
      githubUrl: '',
      linkedinUrl: 'https://linkedin.com/in/tanvi-kapoor-demo',
      availability: { days: ['Mon', 'Tue', 'Wed', 'Fri'], hours: '15 hrs/week' },
      preferredWorkType: 'remote',
      bio: 'Creative design thinker blending visual storytelling with clean layout principles.',
    },
    {
      id: 'demo-std-09',
      email: 'demo-student-09@demo.gignova.com',
      fullName: 'Kabir Mehta',
      college: 'NSUT Delhi',
      degree: 'B.Tech Mechanical Engineering',
      yearOfStudy: '4th Year',
      skills: ['Python', 'SQL', 'Excel', 'Data Visualization', 'Tableau'],
      experience:
        'Self-taught data analyst. Completed Google Data Analytics Professional Certificate. Analyzed renewable energy consumption datasets using Python and Tableau.',
      portfolioUrl: '',
      githubUrl: 'https://github.com/kabirmehta-data',
      linkedinUrl: 'https://linkedin.com/in/kabir-mehta-demo',
      availability: { days: ['Tue', 'Thu', 'Sat'], hours: '20 hrs/week' },
      preferredWorkType: 'hybrid',
      bio: 'Analytical problem solver transitioning engineering rigor into data-driven decision making.',
    },
    {
      id: 'demo-std-10',
      email: 'demo-student-10@demo.gignova.com',
      fullName: 'Divya Nair',
      college: 'Amity University',
      degree: 'B.Tech Computer Science',
      yearOfStudy: '3rd Year',
      skills: ['Java', 'Spring Boot', 'SQL', 'C++', 'Object Oriented Programming'],
      experience:
        'Academic projects in core Java, database management systems, and object oriented software engineering principles. Built hospital management CLI.',
      portfolioUrl: '',
      githubUrl: 'https://github.com/divyanair-code',
      linkedinUrl: 'https://linkedin.com/in/divya-nair-demo',
      availability: { days: ['Mon', 'Tue', 'Wed', 'Thu'], hours: '16 hrs/week' },
      preferredWorkType: 'remote',
      bio: 'Focused software engineering student with strong foundation in algorithms and backend enterprise architectures.',
    },
    {
      id: 'demo-std-11',
      email: 'demo-student-11@demo.gignova.com',
      fullName: 'Rahul Saxena',
      college: 'Galgotias University',
      degree: 'B.Tech Computer Science',
      yearOfStudy: '4th Year',
      skills: ['Docker', 'Linux', 'Git', 'Bash', 'Networking'],
      experience:
        'System administrator for college lab machines. Handled Ubuntu server provisioning, local network setup, and automated shell scripting backups.',
      portfolioUrl: '',
      githubUrl: 'https://github.com/rahulsaxena-ops',
      linkedinUrl: 'https://linkedin.com/in/rahul-saxena-demo',
      availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], hours: '35 hrs/week' },
      preferredWorkType: 'onsite',
      bio: 'Hands-on systems tinkerer comfortable with hardware racks, terminal commands, and server maintenance.',
    },
    {
      id: 'demo-std-12',
      email: 'demo-student-12@demo.gignova.com',
      fullName: 'Meera Deshmukh',
      college: 'Symbiosis Pune',
      degree: 'B.Des User Experience Design',
      yearOfStudy: '4th Year',
      skills: ['Figma', 'UX Research', 'Usability Testing', 'Wireframing', 'Prototyping', 'Design Thinking'],
      experience:
        'Interned with healthcare startup redesigning patient booking flow, increasing task completion by 32%. Authored comprehensive design system guidelines in Figma.',
      portfolioUrl: 'https://meera-ux.framer.website',
      githubUrl: '',
      linkedinUrl: 'https://linkedin.com/in/meera-deshmukh-demo',
      availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], hours: '20 hrs/week' },
      preferredWorkType: 'remote',
      bio: 'User research advocate dedicated to uncovering deep user pain points and validating hypotheses.',
    },
    {
      id: 'demo-std-13',
      email: 'demo-student-13@demo.gignova.com',
      fullName: 'Karthik Raja',
      college: 'VIT Vellore',
      degree: 'B.Tech Computer Science',
      yearOfStudy: '3rd Year',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'REST API', 'JavaScript', 'TypeScript'],
      experience:
        'Built full stack student marketplace web application. Integrated Stripe test payments and deployed containers on AWS Lightsail.',
      portfolioUrl: 'https://karthikraja.live',
      githubUrl: 'https://github.com/karthik-raja-dev',
      linkedinUrl: 'https://linkedin.com/in/karthik-raja-demo',
      availability: { days: ['Mon', 'Wed', 'Fri', 'Sat'], hours: '24 hrs/week' },
      preferredWorkType: 'remote',
      bio: 'Pragmatic web developer passionate about TypeScript across the full web stack.',
    },
    {
      id: 'demo-std-14',
      email: 'demo-student-14@demo.gignova.com',
      fullName: 'Sunita Reddy',
      college: 'Osmania University',
      degree: 'B.Sc Statistics & Computer Applications',
      yearOfStudy: '3rd Year',
      skills: ['Python', 'Pandas', 'SQL', 'Statistics', 'R', 'Data Analysis'],
      experience:
        'Conducted statistical surveys and exploratory data analysis projects. Proficient in hypothesis testing, regression models, and data wrangling.',
      portfolioUrl: '',
      githubUrl: 'https://github.com/sunita-stats',
      linkedinUrl: 'https://linkedin.com/in/sunita-reddy-demo',
      availability: { days: ['Mon', 'Tue', 'Wed', 'Thu'], hours: '18 hrs/week' },
      preferredWorkType: 'hybrid',
      bio: 'Statistical data enthusiast bridging classical probability with modern Python computational analysis.',
    },
    {
      id: 'demo-std-15',
      email: 'demo-student-15@demo.gignova.com',
      fullName: 'Harsh Vardhan',
      college: 'Sharda University',
      degree: 'B.Tech Computer Science',
      yearOfStudy: '1st Year',
      skills: ['C', 'Basic Python', 'HTML', 'Problem Solving'],
      experience: 'Fresher starting computer engineering journey. Active in coding club workshops.',
      portfolioUrl: '',
      githubUrl: 'https://github.com/harsh-freshman',
      linkedinUrl: 'https://linkedin.com/in/harsh-vardhan-demo',
      availability: null, // Deliberately missing availability to test eligibility criteria
      preferredWorkType: 'remote',
      bio: 'Enthusiastic beginner exploring algorithms, data structures, and computer science fundamentals.',
    },
  ];

  const createdStudents: any[] = [];
  for (const s of studentsSeed) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        id: s.id,
        email: s.email,
        password: passwordHash,
        role: 'STUDENT',
        studentProfile: {
          create: {
            fullName: s.fullName,
            college: s.college,
            degree: s.degree,
            yearOfStudy: s.yearOfStudy,
            skills: JSON.stringify(s.skills),
            experience: s.experience,
            portfolioUrl: s.portfolioUrl || null,
            githubUrl: s.githubUrl || null,
            linkedinUrl: s.linkedinUrl || null,
            availability: s.availability ? JSON.stringify(s.availability) : null,
            preferredWorkType: s.preferredWorkType,
            bio: s.bio,
          },
        },
      },
      include: { studentProfile: true },
    });
    createdStudents.push(user);
  }
  console.log(`✅ Created / verified ${createdStudents.length} student demo profiles`);

  // 4. Create 28 Applications distributed across gigs with realistic variety
  // Each record maps student to gig with custom cover letter
  const applicationsSeed = [
    // --- GIG 1: Full Stack React & Node (demo-gig-01-fullstack) ---
    {
      gigId: 'demo-gig-01-fullstack',
      studentEmail: 'demo-student-01@demo.gignova.com', // Rohan: Excellent match (95+)
      status: 'UNDER_REVIEW',
      coverLetter:
        'Dear Hiring Team at CloudScale,\n\nI am thrilled to apply for the Full Stack Intern role. Having developed full-stack apps with React, TypeScript, and Node.js with PostgreSQL databases, I have tackled production-level issues including JWT session tokens, schema migrations, and REST endpoints. My recent college project demonstrates exactly the tech stack listed. Looking forward to contributing to your team.',
    },
    {
      gigId: 'demo-gig-01-fullstack',
      studentEmail: 'demo-student-13@demo.gignova.com', // Karthik: Strong match (85-92)
      status: 'PENDING',
      coverLetter:
        'Hi CloudScale team, I have hands-on experience deploying TypeScript full stack applications on AWS with PostgreSQL. I am very interested in this 3-month internship and can commit 24 hours per week without conflicts.',
    },
    {
      gigId: 'demo-gig-01-fullstack',
      studentEmail: 'demo-student-02@demo.gignova.com', // Ananya: Strong match frontend-heavy (80-86)
      status: 'ACCEPTED',
      coverLetter:
        'Hello! While my primary expertise is in React and TypeScript frontends, I have worked with Node.js backends and GraphQL APIs in university team projects. Excited about the opportunity to expand my full-stack skills.',
    },
    {
      gigId: 'demo-gig-01-fullstack',
      studentEmail: 'demo-student-07@demo.gignova.com', // Arjun: Moderate match (65-72)
      status: 'PENDING',
      coverLetter:
        'I am an energetic sophomore with Node.js and JavaScript basics. I am a fast learner and eager to be mentored on production React and PostgreSQL.',
    },
    {
      gigId: 'demo-gig-01-fullstack',
      studentEmail: 'demo-student-10@demo.gignova.com', // Divya: Low / Ineligible match (Java backend, lacks React/TypeScript)
      status: 'REJECTED',
      coverLetter:
        'I have strong Java and SQL fundamentals and want to try web development.',
    },
    {
      gigId: 'demo-gig-01-fullstack',
      studentEmail: 'demo-student-15@demo.gignova.com', // Harsh: Ineligible (no availability, missing essential skills)
      status: 'PENDING',
      coverLetter: 'Interested in coding gigs.',
    },

    // --- GIG 2: UI/UX & Product Design (demo-gig-02-uiux) ---
    {
      gigId: 'demo-gig-02-uiux',
      studentEmail: 'demo-student-04@demo.gignova.com', // Priya: Excellent match (95+)
      status: 'ACCEPTED',
      coverLetter:
        'Dear PixelCraft Design Lead,\n\nI have followed PixelCraft projects with admiration! As a 3rd year design student at NID, I live and breathe Figma design systems, interactive prototypes, and usability testing. In my portfolio you will find detailed case studies of SaaS workflows and design tokens. I would love to bring these capabilities to your fintech platform.',
    },
    {
      gigId: 'demo-gig-02-uiux',
      studentEmail: 'demo-student-12@demo.gignova.com', // Meera: Excellent match (92-96)
      status: 'UNDER_REVIEW',
      coverLetter:
        'Hello! My UX research internship gave me deep experience crafting user journeys, wireframes, and validating designs with real users. I am available 20 hours a week and excited to collaborate with your team.',
    },
    {
      gigId: 'demo-gig-02-uiux',
      studentEmail: 'demo-student-08@demo.gignova.com', // Tanvi: Moderate match (68-75)
      status: 'PENDING',
      coverLetter:
        'I have experience creating UI mockups and graphics in Figma and Adobe XD. Ready to learn product design workflows under your guidance.',
    },
    {
      gigId: 'demo-gig-02-uiux',
      studentEmail: 'demo-student-02@demo.gignova.com', // Ananya: Partial / Related match (UI developer with design sense)
      status: 'PENDING',
      coverLetter:
        'As a frontend developer with strong UI layout skills in Tailwind and Figma inspection, I enjoy bridging the gap between designers and developers.',
    },
    {
      gigId: 'demo-gig-02-uiux',
      studentEmail: 'demo-student-03@demo.gignova.com', // Vikram: Ineligible (DevOps person applying to UI design without any design skills)
      status: 'REJECTED',
      coverLetter: 'Applying to test out new areas.',
    },

    // --- GIG 3: Python & Data Analytics (demo-gig-03-datascience) ---
    {
      gigId: 'demo-gig-03-datascience',
      studentEmail: 'demo-student-05@demo.gignova.com', // Aman: Excellent match (94+)
      status: 'UNDER_REVIEW',
      coverLetter:
        'Dear CloudScale Analytics Team,\n\nMy master thesis research centers on data transformations and automated pipeline evaluation with Python, Pandas, and SQL. I have built automated dashboards that processed over 250k rows. Noida Sector 62 is easily accessible for me, fitting the hybrid model seamlessly.',
    },
    {
      gigId: 'demo-gig-03-datascience',
      studentEmail: 'demo-student-14@demo.gignova.com', // Sunita: Strong match (84-88)
      status: 'PENDING',
      coverLetter:
        'Hello! With my statistics degree and practical Python & SQL skills, I specialize in exploratory data analysis and hypothesis validation. I am happy with the hybrid structure in Noida.',
    },
    {
      gigId: 'demo-gig-03-datascience',
      studentEmail: 'demo-student-09@demo.gignova.com', // Kabir: Moderate match (72-78)
      status: 'PENDING',
      coverLetter:
        'Completed Google Data Analytics certificate and have built Python scripts for data cleaning and Tableau summaries. Highly interested in this 3-month gig.',
    },
    {
      gigId: 'demo-gig-03-datascience',
      studentEmail: 'demo-student-01@demo.gignova.com', // Rohan: Moderate cross-skill match (PostgreSQL, general coding)
      status: 'PENDING',
      coverLetter:
        'I have strong SQL and database background and wrote data ingestion scripts in Node/Python.',
    },
    {
      gigId: 'demo-gig-03-datascience',
      studentEmail: 'demo-student-08@demo.gignova.com', // Tanvi: Ineligible (Design background, no Python/SQL skills)
      status: 'PENDING',
      coverLetter: 'Interested in analytics data visualization.',
    },

    // --- GIG 4: Mobile App Developer (demo-gig-04-mobile) ---
    {
      gigId: 'demo-gig-04-mobile',
      studentEmail: 'demo-student-06@demo.gignova.com', // Sneha: Excellent match (95+)
      status: 'UNDER_REVIEW',
      coverLetter:
        'Hi PixelCraft team! I have published two Flutter applications on the Play Store with thousands of active installs. I am fluent in integrating RESTful endpoints, local SQLite caching, and fluid animations. Looking forward to discussing the gig requirements!',
    },
    {
      gigId: 'demo-gig-04-mobile',
      studentEmail: 'demo-student-02@demo.gignova.com', // Ananya: Strong match (React Native related to React/JS)
      status: 'PENDING',
      coverLetter:
        'My deep React and JavaScript foundations allow me to build cross-platform interfaces in React Native smoothly. I would love to tackle mobile app development with you.',
    },
    {
      gigId: 'demo-gig-04-mobile',
      studentEmail: 'demo-student-01@demo.gignova.com', // Rohan: Moderate match (JavaScript & REST API)
      status: 'PENDING',
      coverLetter:
        'I build REST APIs and web interfaces, and would welcome the chance to apply my JavaScript/TypeScript skills to mobile development.',
    },
    {
      gigId: 'demo-gig-04-mobile',
      studentEmail: 'demo-student-11@demo.gignova.com', // Rahul: Low/Ineligible match
      status: 'REJECTED',
      coverLetter: 'Looking for mobile software experience.',
    },
    {
      gigId: 'demo-gig-04-mobile',
      studentEmail: 'demo-student-15@demo.gignova.com', // Harsh: Ineligible (no availability, no skills)
      status: 'PENDING',
      coverLetter: 'Want to learn Flutter.',
    },

    // --- GIG 5: On-Site Systems & DevOps (demo-gig-05-devops-onsite) ---
    {
      gigId: 'demo-gig-05-devops-onsite',
      studentEmail: 'demo-student-03@demo.gignova.com', // Vikram: Excellent match (96+) - Onsite preference matches!
      status: 'UNDER_REVIEW',
      coverLetter:
        'Dear Infrastructure Team,\n\nI am located in Delhi NCR and specifically looking for an on-site infrastructure opportunity where I can work directly with physical servers, Linux boxes, and Docker containers. I hold the AWS Solutions Architect certification and have maintained production Kubernetes clusters.',
    },
    {
      gigId: 'demo-gig-05-devops-onsite',
      studentEmail: 'demo-student-11@demo.gignova.com', // Rahul: Strong match (86-90) - Onsite preference matches!
      status: 'PENDING',
      coverLetter:
        'I currently manage our college lab servers on Ubuntu Linux and write Bash scripts for backups. Connaught Place is a 30-minute commute for me. Ready for full-time 35 hours per week.',
    },
    {
      gigId: 'demo-gig-05-devops-onsite',
      studentEmail: 'demo-student-13@demo.gignova.com', // Karthik: Moderate match but Work Mode Conflict (prefers remote, onsite gig)
      status: 'PENDING',
      coverLetter:
        'I have used Docker and AWS for deploying web services. Can manage remote tasks, but commute to Connaught Place daily might be difficult.',
    },
    {
      gigId: 'demo-gig-05-devops-onsite',
      studentEmail: 'demo-student-01@demo.gignova.com', // Rohan: Moderate/Ineligible (Remote preference conflict)
      status: 'PENDING',
      coverLetter: 'Familiar with Docker and Linux containers.',
    },
    {
      gigId: 'demo-gig-05-devops-onsite',
      studentEmail: 'demo-student-04@demo.gignova.com', // Priya: Ineligible (Designer, no DevOps skills)
      status: 'REJECTED',
      coverLetter: 'Interested in tech organizations.',
    },
    {
      gigId: 'demo-gig-05-devops-onsite',
      studentEmail: 'demo-student-15@demo.gignova.com', // Harsh: Ineligible (no skills, no availability)
      status: 'PENDING',
      coverLetter: 'Beginner student.',
    },
  ];

  let appCount = 0;
  for (const item of applicationsSeed) {
    const studentUser = createdStudents.find((s) => s.email === item.studentEmail);
    if (!studentUser) continue;

    const gig = createdGigs.find((g) => g.id === item.gigId);
    if (!gig) continue;

    // Upsert Application
    const application = await prisma.application.upsert({
      where: {
        gigId_studentId: {
          gigId: item.gigId,
          studentId: studentUser.id,
        },
      },
      update: {
        coverLetter: item.coverLetter,
        status: item.status,
      },
      create: {
        gigId: item.gigId,
        studentId: studentUser.id,
        coverLetter: item.coverLetter,
        status: item.status,
      },
      include: {
        student: {
          include: { studentProfile: true },
        },
      },
    });

    // Compute deterministic SmartMatch score
    const studentProfile = application.student.studentProfile;
    const gigSkills = JSON.parse(gig.requiredSkills || '[]');
    const studentSkills = studentProfile ? JSON.parse(studentProfile.skills || '[]') : [];

    const calculated = calculateSmartMatchScore({
      gig: {
        id: gig.id,
        title: gig.title,
        description: gig.description,
        category: gig.category,
        requiredSkills: gigSkills,
        workType: gig.workType,
        location: gig.location,
        duration: gig.duration,
        requiredAvailability: gig.requiredAvailability,
        deadline: gig.deadline,
        status: gig.status,
      },
      studentProfile: studentProfile
        ? {
            fullName: studentProfile.fullName,
            skills: studentSkills,
            experience: studentProfile.experience,
            portfolioUrl: studentProfile.portfolioUrl,
            linkedinUrl: studentProfile.linkedinUrl,
            githubUrl: studentProfile.githubUrl,
            availability: studentProfile.availability ? JSON.parse(studentProfile.availability) : null,
            preferredWorkType: studentProfile.preferredWorkType,
            bio: studentProfile.bio,
            college: studentProfile.college,
            degree: studentProfile.degree,
            yearOfStudy: studentProfile.yearOfStudy,
          }
        : null,
      application: {
        id: application.id,
        coverLetter: application.coverLetter,
        createdAt: application.createdAt,
      },
    });

    // Mark high-scoring accepted candidates as shortlisted initially for demo
    const isShortlisted = item.status === 'ACCEPTED' || (calculated.totalScore >= 90 && calculated.isEligible);

    await prisma.smartMatchScore.upsert({
      where: { applicationId: application.id },
      create: {
        applicationId: application.id,
        gigId: gig.id,
        studentId: studentUser.id,
        skillScore: calculated.skillScore,
        experienceScore: calculated.experienceScore,
        availabilityScore: calculated.availabilityScore,
        workModeScore: calculated.workModeScore,
        assessmentScore: calculated.assessmentScore,
        totalScore: calculated.totalScore,
        matchedSkills: JSON.stringify(calculated.matchedSkills),
        missingSkills: JSON.stringify(calculated.missingSkills),
        partiallyMatchedSkills: JSON.stringify(calculated.partiallyMatchedSkills),
        explanation: JSON.stringify(calculated.explanation),
        isEligible: calculated.isEligible,
        eligibilityReasons: JSON.stringify(calculated.eligibilityReasons),
        isShortlisted,
      },
      update: {
        skillScore: calculated.skillScore,
        experienceScore: calculated.experienceScore,
        availabilityScore: calculated.availabilityScore,
        workModeScore: calculated.workModeScore,
        assessmentScore: calculated.assessmentScore,
        totalScore: calculated.totalScore,
        matchedSkills: JSON.stringify(calculated.matchedSkills),
        missingSkills: JSON.stringify(calculated.missingSkills),
        partiallyMatchedSkills: JSON.stringify(calculated.partiallyMatchedSkills),
        explanation: JSON.stringify(calculated.explanation),
        isEligible: calculated.isEligible,
        eligibilityReasons: JSON.stringify(calculated.eligibilityReasons),
        isShortlisted,
      },
    });

    // Sync matchScore on application
    await prisma.application.update({
      where: { id: application.id },
      data: { matchScore: calculated.totalScore },
    });

    appCount++;
  }

  console.log(`✅ Seeded ${appCount} applications with SmartMatch evaluations`);
  console.log('\n🎉 SmartMatch mock seed data complete!\n');
  console.log('Demo Business Logins (Password: Demo@12345):');
  console.log('  1. demo-biz-cloud@demo.gignova.com  (CloudScale Tech - 3 Gigs)');
  console.log('  2. demo-biz-design@demo.gignova.com (PixelCraft Studio - 2 Gigs)');
  console.log('Demo Student Logins (Password: Demo@12345):');
  console.log('  demo-student-01@demo.gignova.com to demo-student-15@demo.gignova.com');
}

main()
  .catch((e) => {
    console.error('❌ Error during SmartMatch seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
