import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calculateSmartMatchScore } from '../src/services/matching.service';

const prisma = new PrismaClient();

// 100 Realistic Student Applicant Specs
interface ApplicantSpec {
  name: string;
  college: string;
  degree: string;
  year: string;
  skills: string[];
  experience: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  availability: { days: string[]; hours: string } | null;
  preferredWorkType: string;
  location: string;
  bio: string;
  coverLetter: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
}

const APPLICANTS_DATA: ApplicantSpec[] = [
  // --- Tier 1: Highly Skilled Full Stack Developers (Score ~90-98, Expected Ranks 1-15) ---
  {
    name: 'Aarav Mehta',
    college: 'IIT Delhi',
    degree: 'B.Tech Computer Science & Engineering',
    year: '4th Year',
    skills: ['JavaScript', 'React.js', 'Node.js', 'Express.js', 'TypeScript', 'HTML', 'CSS', 'SQL', 'MongoDB', 'Tailwind CSS', 'Git and GitHub', 'REST APIs', 'Prisma'],
    experience: 'Built full-scale E-commerce platform with microservices in Node.js/Express, React 18, and PostgreSQL using Prisma ORM. Integrated Stripe webhooks and JWT auth.',
    githubUrl: 'https://github.com/aarav-mehta-dev',
    portfolioUrl: 'https://aaravmehta.dev',
    linkedinUrl: 'https://linkedin.com/in/aarav-mehta-demo',
    availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], hours: '25 hrs/week' },
    preferredWorkType: 'remote',
    location: 'New Delhi',
    bio: 'Full stack engineer with deep TypeScript and React expertise. Open source contributor.',
    coverLetter: 'Dear TechNova Solutions Team,\n\nI am thrilled to apply for the Full Stack Web Development Intern role. I have extensive experience building scalable web apps with React, Express, and PostgreSQL using Prisma. My e-commerce and SaaS projects mirror your exact tech stack. Excited to contribute.',
    status: 'ACCEPTED',
  },
  {
    name: 'Diya Sengupta',
    college: 'BITS Pilani',
    degree: 'B.E. Computer Science',
    year: '4th Year',
    skills: ['React.js', 'Node.js', 'TypeScript', 'Express.js', 'MongoDB', 'JavaScript', 'HTML', 'CSS', 'REST APIs', 'Tailwind CSS', 'Git and GitHub'],
    experience: 'Created real-time collaborative task management Kanban board using React, Node.js, Express, and MongoDB with WebSocket support for live team synchronization.',
    githubUrl: 'https://github.com/diya-sengupta',
    portfolioUrl: 'https://diyasengupta.live',
    linkedinUrl: 'https://linkedin.com/in/diya-sengupta-demo',
    availability: { days: ['Mon', 'Wed', 'Fri', 'Sat'], hours: '20 hrs/week' },
    preferredWorkType: 'remote',
    location: 'Bengaluru',
    bio: 'Passionate about clean architecture, responsive UIs, and robust backend APIs.',
    coverLetter: 'Hello TechNova! I have developed end-to-end web apps with React, Node.js, and MongoDB. My real-time task manager project handled multi-user concurrency seamlessly. I am ready to commit 20 hours per week remotely.',
    status: 'ACCEPTED',
  },
  {
    name: 'Kabir Nair',
    college: 'Sharda University',
    degree: 'B.Tech Computer Science',
    year: '3rd Year',
    skills: ['JavaScript', 'React', 'Node.js', 'Express', 'TypeScript', 'HTML5', 'CSS3', 'SQL', 'Prisma', 'REST APIs', 'Git'],
    experience: 'Developed Sharda University student management and attendance tracking system with React frontend, Express API backend, and SQLite/PostgreSQL with Prisma.',
    githubUrl: 'https://github.com/kabir-nair-code',
    portfolioUrl: 'https://kabirnair.tech',
    linkedinUrl: 'https://linkedin.com/in/kabir-nair-demo',
    availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], hours: '22 hrs/week' },
    preferredWorkType: 'remote',
    location: 'Greater Noida',
    bio: 'Sharda University 3rd year student focused on modern full stack web development and database optimizations.',
    coverLetter: 'Dear Hiring Manager,\n\nAs a 3rd-year CS student at Sharda University, I have spent the last 2 years mastering React, Node.js, and TypeScript. I recently completed our campus portal with Express and Prisma. This 8-week internship perfectly aligns with my goals.',
    status: 'ACCEPTED',
  },
  {
    name: 'Ishaan Joshi',
    college: 'DTU Delhi',
    degree: 'B.Tech Software Engineering',
    year: '4th Year',
    skills: ['React.js', 'Node.js', 'Express.js', 'TypeScript', 'JavaScript', 'SQL', 'MongoDB', 'Tailwind CSS', 'Git and GitHub', 'REST APIs'],
    experience: 'Architected AI-powered web platform for summarizing academic papers using React frontend, Node/Express proxy, and MongoDB caching layer.',
    githubUrl: 'https://github.com/ishaan-joshi-dev',
    portfolioUrl: 'https://ishaanjoshi.io',
    linkedinUrl: 'https://linkedin.com/in/ishaan-joshi-demo',
    availability: { days: ['Mon', 'Tue', 'Wed', 'Thu'], hours: '24 hrs/week' },
    preferredWorkType: 'remote',
    location: 'Delhi',
    bio: 'Software engineer building web solutions at the intersection of developer tools and modern UX.',
    coverLetter: 'Hi TechNova Solutions! Your focus on React and Express is exactly where my core strength lies. I have maintained production-ready full stack repositories and look forward to contributing.',
    status: 'UNDER_REVIEW',
  },
  {
    name: 'Ananya Rao',
    college: 'IIIT Hyderabad',
    degree: 'B.Tech Computer Science',
    year: '3rd Year',
    skills: ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'Express.js', 'CSS', 'HTML', 'SQL', 'PostgreSQL', 'REST APIs', 'Git'],
    experience: 'Engineered student finance and expense tracker web app with interactive charts in React and automated monthly report generation in Express with PostgreSQL.',
    githubUrl: 'https://github.com/ananya-rao-cse',
    portfolioUrl: 'https://ananyarao.dev',
    linkedinUrl: 'https://linkedin.com/in/ananya-rao-demo',
    availability: { days: ['Mon', 'Wed', 'Fri'], hours: '20 hrs/week' },
    preferredWorkType: 'remote',
    location: 'Hyderabad',
    bio: 'Enthusiastic full-stack builder with strong foundations in algorithms and relational database design.',
    coverLetter: 'Greetings! I love writing clean, testable TypeScript code across React components and Express controllers. My expense tracker project showcases full CRUD workflows and PostgreSQL transactions.',
    status: 'UNDER_REVIEW',
  },
  {
    name: 'Siddharth Jain',
    college: 'NSUT Delhi',
    degree: 'B.Tech Information Technology',
    year: '3rd Year',
    skills: ['React.js', 'Node.js', 'Express.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'MongoDB', 'REST APIs', 'Tailwind CSS'],
    experience: 'Built real-time group chat application featuring channels, direct messaging, and file sharing using React, Express, MongoDB, and Socket.io.',
    githubUrl: 'https://github.com/siddharth-jain-dev',
    portfolioUrl: 'https://siddharthjain.me',
    linkedinUrl: 'https://linkedin.com/in/siddharth-jain-demo',
    availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], hours: '20 hrs/week' },
    preferredWorkType: 'remote',
    location: 'New Delhi',
    bio: 'Passionate full-stack developer dedicated to building responsive and intuitive user experiences.',
    coverLetter: 'Dear TechNova Team, I have hands-on experience building real-time applications with React and Express. I would love to bring my frontend finesse and API design experience to your team.',
    status: 'UNDER_REVIEW',
  },
  {
    name: 'Pooja Sharma',
    college: 'VIT Vellore',
    degree: 'B.Tech Computer Science',
    year: '4th Year',
    skills: ['JavaScript', 'React.js', 'Node.js', 'Express.js', 'HTML', 'CSS', 'SQL', 'Prisma', 'Tailwind CSS', 'Git and GitHub'],
    experience: 'Created multi-author blogging and publishing platform with Markdown support, role-based admin controls, and PostgreSQL with Prisma.',
    githubUrl: 'https://github.com/pooja-sharma-vit',
    portfolioUrl: 'https://poojasharma.dev',
    linkedinUrl: 'https://linkedin.com/in/pooja-sharma-demo',
    availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], hours: '25 hrs/week' },
    preferredWorkType: 'remote',
    location: 'Vellore',
    bio: 'Full stack developer focused on performance, accessibility, and modern React ecosystems.',
    coverLetter: 'Hello! I have created comprehensive web portals using React, Express, and Prisma. The 8-week duration and remote structure fit my semester availability perfectly.',
    status: 'ACCEPTED',
  },
  {
    name: 'Dev Patel',
    college: 'IIT Bombay',
    degree: 'B.Tech Computer Science',
    year: '3rd Year',
    skills: ['TypeScript', 'JavaScript', 'React.js', 'Node.js', 'Express.js', 'SQL', 'MongoDB', 'REST APIs', 'Tailwind CSS'],
    experience: 'Developed college event ticketing and pass validation system using React, Node.js REST API, and MongoDB with QR code verification.',
    githubUrl: 'https://github.com/dev-patel-iitb',
    portfolioUrl: 'https://devpatel.tech',
    linkedinUrl: 'https://linkedin.com/in/dev-patel-demo',
    availability: { days: ['Mon', 'Wed', 'Fri'], hours: '18 hrs/week' },
    preferredWorkType: 'remote',
    location: 'Mumbai',
    bio: 'Competitive coder and full stack web enthusiast passionate about developer productivity.',
    coverLetter: 'Dear Recruiter, I have built production-grade apps handling hundreds of users with React, Express, and databases. Excited about the opportunity to intern at TechNova Solutions.',
    status: 'UNDER_REVIEW',
  },
  {
    name: 'Riya Agarwal',
    college: 'Sharda University',
    degree: 'B.Tech Information Technology',
    year: '4th Year',
    skills: ['JavaScript', 'React.js', 'Node.js', 'Express.js', 'HTML', 'CSS', 'SQL', 'MongoDB', 'Tailwind CSS', 'Git and GitHub'],
    experience: 'Led technical team to build Sharda University Alumni Connect Portal with React, Express, and MongoDB, facilitating mentorship matching.',
    githubUrl: 'https://github.com/riya-agarwal-su',
    portfolioUrl: 'https://riyaagarwal.me',
    linkedinUrl: 'https://linkedin.com/in/riya-agarwal-demo',
    availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], hours: '20 hrs/week' },
    preferredWorkType: 'remote',
    location: 'Noida',
    bio: 'Senior IT student with proven record in building web apps and mentoring junior developers.',
    coverLetter: 'Dear TechNova Solutions, As a 4th-year student at Sharda University, I have spent significant time developing full stack JavaScript applications. I can immediately contribute to your product goals.',
    status: 'ACCEPTED',
  },
  {
    name: 'Kunal Deshmukh',
    college: 'Pune Institute of Computer Technology',
    degree: 'B.E. Information Technology',
    year: '3rd Year',
    skills: ['React.js', 'TypeScript', 'Node.js', 'Express.js', 'HTML', 'CSS', 'SQL', 'PostgreSQL', 'Prisma', 'Git'],
    experience: 'Developed inventory and billing management portal for local retail businesses using React, TypeScript, Express, and PostgreSQL.',
    githubUrl: 'https://github.com/kunal-deshmukh-dev',
    portfolioUrl: 'https://kunaldeshmukh.dev',
    linkedinUrl: 'https://linkedin.com/in/kunal-deshmukh-demo',
    availability: { days: ['Mon', 'Tue', 'Thu', 'Fri'], hours: '20 hrs/week' },
    preferredWorkType: 'remote',
    location: 'Pune',
    bio: 'Full stack builder who enjoys designing clean APIs and seamless responsive web interfaces.',
    coverLetter: 'Hello! I specialize in React, TypeScript, and Node.js with SQL databases. I have already built and deployed practical business tools.',
    status: 'UNDER_REVIEW',
  },
  {
    name: 'Snehal Kulkarni',
    college: 'VJTI Mumbai',
    degree: 'B.Tech Computer Engineering',
    year: '4th Year',
    skills: ['JavaScript', 'React.js', 'Node.js', 'Express.js', 'TypeScript', 'HTML', 'CSS', 'SQL', 'REST APIs'],
    experience: 'Created healthcare appointment booking web portal with React and Express with automated SMS and email reminders.',
    githubUrl: 'https://github.com/snehal-kulkarni',
    portfolioUrl: 'https://snehalkulkarni.online',
    linkedinUrl: 'https://linkedin.com/in/snehal-kulkarni-demo',
    availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], hours: '25 hrs/week' },
    preferredWorkType: 'remote',
    location: 'Mumbai',
    bio: 'Software engineering senior enthusiastic about building scalable web solutions.',
    coverLetter: 'Dear TechNova, I have strong proficiency across the MERN stack with TypeScript. Ready to dedicate 25 hours per week to your team.',
    status: 'ACCEPTED',
  },
  {
    name: 'Varun Reddy',
    college: 'NIT Trichy',
    degree: 'B.Tech Computer Science',
    year: '3rd Year',
    skills: ['React.js', 'Node.js', 'Express.js', 'TypeScript', 'JavaScript', 'MongoDB', 'SQL', 'Tailwind CSS', 'Git'],
    experience: 'Engineered peer-to-peer book sharing and rental portal using React, Node, Express, and MongoDB.',
    githubUrl: 'https://github.com/varun-reddy-dev',
    portfolioUrl: 'https://varunreddy.dev',
    linkedinUrl: 'https://linkedin.com/in/varun-reddy-demo',
    availability: { days: ['Mon', 'Wed', 'Fri'], hours: '20 hrs/week' },
    preferredWorkType: 'remote',
    location: 'Chennai',
    bio: 'Curious problem solver building full-stack web applications with modern tooling.',
    coverLetter: 'Hi TechNova Solutions, My skill set in React, Node, Express, and MongoDB directly matches your requirements. I have completed several end-to-end projects.',
    status: 'UNDER_REVIEW',
  },
  {
    name: 'Megha Singhania',
    college: 'Thapar University',
    degree: 'B.E. Computer Engineering',
    year: '3rd Year',
    skills: ['JavaScript', 'React.js', 'Node.js', 'Express.js', 'HTML', 'CSS', 'SQL', 'MongoDB', 'Git and GitHub'],
    experience: 'Built digital portfolio builder allowing users to create and host custom portfolio web pages with Express and React.',
    githubUrl: 'https://github.com/megha-singhania',
    portfolioUrl: 'https://meghasinghania.live',
    linkedinUrl: 'https://linkedin.com/in/megha-singhania-demo',
    availability: { days: ['Mon', 'Tue', 'Wed', 'Thu'], hours: '20 hrs/week' },
    preferredWorkType: 'remote',
    location: 'Patiala',
    bio: 'Front-end oriented full stack developer who takes pride in crafting pixel-perfect, accessible web interfaces.',
    coverLetter: 'Dear Hiring Team, I have worked on React, Node.js, and MongoDB for over a year and built full stack tools used by fellow students.',
    status: 'UNDER_REVIEW',
  },
  {
    name: 'Abhishek Choudhury',
    college: 'Jadavpur University',
    degree: 'B.E. Information Technology',
    year: '4th Year',
    skills: ['JavaScript', 'React.js', 'Node.js', 'Express.js', 'TypeScript', 'SQL', 'PostgreSQL', 'HTML', 'CSS', 'REST APIs'],
    experience: 'Developed automated bug tracking and issue ticketing tool with React, Express, PostgreSQL, and markdown documentation.',
    githubUrl: 'https://github.com/abhishek-choudhury',
    portfolioUrl: 'https://abhishekchoudhury.dev',
    linkedinUrl: 'https://linkedin.com/in/abhishek-choudhury-demo',
    availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], hours: '25 hrs/week' },
    preferredWorkType: 'remote',
    location: 'Kolkata',
    bio: 'Backend-leaning full stack engineer with strong SQL and architectural fundamentals.',
    coverLetter: 'Dear TechNova, I have solid experience designing RESTful APIs in Express and writing responsive React frontends. Looking forward to your response.',
    status: 'ACCEPTED',
  },
  {
    name: 'Tanmay Kulkarni',
    college: 'COEP Pune',
    degree: 'B.Tech Computer Engineering',
    year: '3rd Year',
    skills: ['React.js', 'Node.js', 'Express.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'MongoDB', 'Prisma'],
    experience: 'Created real-time voting and polling web app with live chart analytics in React and Express with MongoDB.',
    githubUrl: 'https://github.com/tanmay-coep',
    portfolioUrl: 'https://tanmaykulkarni.tech',
    linkedinUrl: 'https://linkedin.com/in/tanmay-kulkarni-demo',
    availability: { days: ['Mon', 'Wed', 'Fri'], hours: '18 hrs/week' },
    preferredWorkType: 'remote',
    location: 'Pune',
    bio: 'Full stack developer who enjoys working with TypeScript, React, and server-side runtimes.',
    coverLetter: 'Hello TechNova Solutions, My projects in React and Express have taught me how to handle asynchronous data streams and database modeling. Excited for this gig.',
    status: 'UNDER_REVIEW',
  },

  // --- Tier 2: Strong Frontend or Backend Specialists (Score ~75-89, Expected Ranks 16-45) ---
  // (30 applicants with great skills in 4-6 required skills, relevant projects, consistent availability)
  ...Array.from({ length: 30 }, (_, i) => {
    const idx = i + 16;
    const names = [
      'Gaurav Bhasin', 'Kavita Sundaram', 'Nikhil Saxena', 'Simran Kaur', 'Aditya Sen',
      'Pallavi Dixit', 'Manish Pandey', 'Shreya Mukherjee', 'Rajat Bhatia', 'Neha Nambiar',
      'Arnav Bansal', 'Ritika Ghosh', 'Harish Menon', 'Bhavna Tiwari', 'Akash Goswami',
      'Swati Mishra', 'Deepak Rawat', 'Kritika Pillai', 'Suraj Chauhan', 'Archana Nair',
      'Lokesh Yadav', 'Sangeeta Roy', 'Naveen Bhatt', 'Vidya Iyer', 'Prashant Gill',
      'Juhi Chawla', 'Sanjay Dutt', 'Natasha Sen', 'Rohit Aggarwal', 'Deepika Verma'
    ];
    const colleges = [
      'Sharda University', 'Amity University', 'Galgotias University', 'DTU Delhi', 'NSUT Delhi',
      'SRM University', 'VIT Vellore', 'Manipal University', 'Thapar University', 'Delhi University',
      'BITS Pilani', 'NIT Kurukshetra', 'IIIT Lucknow', 'PEC Chandigarh', 'Jamia Millia Islamia'
    ];
    const isFrontendFocus = i % 2 === 0;
    const skills = isFrontendFocus
      ? ['React.js', 'JavaScript', 'HTML', 'CSS', 'TypeScript', 'Tailwind CSS', 'Git and GitHub']
      : ['Node.js', 'Express.js', 'JavaScript', 'SQL', 'MongoDB', 'REST APIs', 'Git and GitHub'];

    const projectTypes = [
      'E-commerce product catalog with shopping cart and filtering',
      'Personal finance dashboard with visual income/expense graphs',
      'Student course feedback and rating system with REST API',
      'Real-time markdown note taking application with autosave',
      'Weather forecast and climate data tracker using external APIs',
      'Recipe sharing and search portal with user bookmarking',
      'Job board listing web portal with search and filtering',
      'Fitness workout and calorie tracking interactive dashboard'
    ];

    const project = projectTypes[i % projectTypes.length];
    const status: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' =
      i < 4 ? 'ACCEPTED' : i < 14 ? 'UNDER_REVIEW' : i < 26 ? 'PENDING' : 'REJECTED';

    return {
      name: names[i] || `Applicant ${idx}`,
      college: colleges[i % colleges.length],
      degree: 'B.Tech Computer Science',
      year: (i % 3 === 0 ? '4th Year' : i % 3 === 1 ? '3rd Year' : '2nd Year'),
      skills,
      experience: `Built ${project} using ${skills.slice(0, 4).join(', ')}. Demonstrated strong grasp of modular code and component reuse.`,
      githubUrl: `https://github.com/mock-applicant-${idx}`,
      portfolioUrl: `https://mock-student-${idx}.portfolio.demo`,
      linkedinUrl: `https://linkedin.com/in/mock-applicant-${idx}`,
      availability: { days: ['Mon', 'Tue', 'Wed', 'Thu'], hours: `${16 + (i % 8)} hrs/week` },
      preferredWorkType: 'remote',
      location: ['New Delhi', 'Noida', 'Gurugram', 'Bengaluru', 'Mumbai', 'Pune', 'Hyderabad'][i % 7],
      bio: `${isFrontendFocus ? 'Frontend engineer' : 'Backend engineer'} with proven hands-on project portfolio in modern JavaScript stacks.`,
      coverLetter: `Dear TechNova Solutions, I am writing to express my eager interest in the Full Stack Intern role. I have extensive experience in ${skills.slice(0, 3).join(', ')} and have built several functional web applications. Looking forward to discussing how I can add value.`,
      status,
    };
  }),

  // --- Tier 3: Moderate Match (JavaScript/React basics or transferable languages) (Score ~60-74, Expected Ranks 46-75) ---
  // (30 applicants with 3-4 matched skills, academic projects, consistent availability)
  ...Array.from({ length: 30 }, (_, i) => {
    const idx = i + 46;
    const names = [
      'Chirag Sethi', 'Lavanya Menon', 'Pranav Kulkarni', 'Sonalika Das', 'Bhupesh Gupta',
      'Tanushree Paul', 'Hemant Chawla', 'Monika Varma', 'Tushar Mathur', 'Ananya Barua',
      'Saurabh Shukla', 'Preeti Kaushik', 'Sameer Quadri', 'Sunidhi Sharma', 'Yashwant Rao',
      'Garima Sinha', 'Pankaj Bishnoi', 'Shweta Jha', 'Nitin Anand', 'Amrita Chatterjee',
      'Vijay Shankar', 'Kavya Madhavan', 'Raghavendra Rao', 'Dipti Pathak', 'Ganesh Iyer',
      'Payal Aggarwal', 'Omkar Patil', 'Renu Bala', 'Subhashish Roy', 'Poonam Yadav'
    ];
    const colleges = [
      'Sharda University', 'Galgotias University', 'Chandigarh University', 'Amity Noida',
      'SRM University', 'Lovely Professional University', 'UPES Dehradun', 'Graphic Era',
      'Guru Gobind Singh IPU', 'Dr. APJ Abdul Kalam Technical University'
    ];

    const hasPython = i % 3 === 0;
    const hasJava = i % 3 === 1;

    let skills: string[];
    if (hasPython) {
      skills = ['JavaScript', 'HTML', 'CSS', 'Python', 'SQL', 'Git and GitHub'];
    } else if (hasJava) {
      skills = ['JavaScript', 'HTML', 'CSS', 'Java', 'SQL', 'Problem-solving'];
    } else {
      skills = ['JavaScript', 'HTML', 'CSS', 'React.js', 'Tailwind CSS'];
    }

    const projects = [
      'Student database management console with SQL queries',
      'Personal portfolio website with responsive CSS grid',
      'Weather tracker web page using fetch API and vanilla JavaScript',
      'Quiz application with score tracking and local storage',
      'Simple blog engine with user comments and posts',
      'Library catalog search tool with HTML/CSS tables'
    ];

    const status: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' =
      i < 3 ? 'UNDER_REVIEW' : i < 25 ? 'PENDING' : 'REJECTED';

    return {
      name: names[i] || `Applicant ${idx}`,
      college: colleges[i % colleges.length],
      degree: (i % 2 === 0 ? 'B.Tech Information Technology' : 'BCA (Computer Applications)'),
      year: (i % 2 === 0 ? '2nd Year' : '3rd Year'),
      skills,
      experience: `Completed academic coursework in web technologies and built ${projects[i % projects.length]}.`,
      githubUrl: `https://github.com/mock-applicant-${idx}`,
      portfolioUrl: (i % 2 === 0 ? `https://mock-student-${idx}.demo` : undefined),
      linkedinUrl: `https://linkedin.com/in/mock-applicant-${idx}`,
      availability: { days: ['Mon', 'Wed', 'Fri'], hours: `${15 + (i % 6)} hrs/week` },
      preferredWorkType: 'remote',
      location: ['Noida', 'New Delhi', 'Jaipur', 'Lucknow', 'Dehradun', 'Chandigarh', 'Indore'][i % 7],
      bio: 'Motivated student eager to apply foundational web concepts to production full stack code.',
      coverLetter: `Hi TechNova team, I have solid knowledge of ${skills.slice(0, 3).join(', ')} and have completed multiple academic web development assignments. I am a fast learner and ready to contribute to your intern team.`,
      status,
    };
  }),

  // --- Tier 4: Beginners & Cross-disciplinary (Score ~45-59, Expected Ranks 76-90) ---
  // (15 applicants with basic HTML/CSS/JS or Python/C++ backgrounds, limited projects)
  ...Array.from({ length: 15 }, (_, i) => {
    const idx = i + 76;
    const names = [
      'Ajay Chaurasia', 'Bhavika Somani', 'Chetan Bhagat', 'Dolly Parikh', 'Eshan Trivedi',
      'Farhan Akhtar', 'Geeta Goswami', 'Hitesh Banga', 'Indu Malviya', 'Jitendra Sahu',
      'Kiran Bedi', 'Laxman Murthy', 'Meenakshi Sundaram', 'Naresh Goyal', 'Ojasvi Singhal'
    ];
    const colleges = [
      'Sharda University', 'Amity University', 'Delhi University', 'CCS University Meerut',
      'Galgotias College', 'Maharshi Dayanand University'
    ];

    const skills = [
      ['HTML', 'CSS', 'JavaScript'],
      ['Python', 'HTML', 'CSS'],
      ['C++', 'HTML', 'JavaScript'],
      ['Java', 'SQL', 'HTML']
    ][i % 4];

    return {
      name: names[i] || `Applicant ${idx}`,
      college: colleges[i % colleges.length],
      degree: 'B.Tech / B.Sc Computer Science',
      year: (i % 2 === 0 ? '1st Year' : '2nd Year'),
      skills,
      experience: 'Academic coursework and beginner mini-projects in basic programming and web styling.',
      githubUrl: `https://github.com/mock-applicant-${idx}`,
      availability: { days: ['Mon', 'Tue', 'Thu'], hours: '15 hrs/week' },
      preferredWorkType: 'remote',
      location: 'Noida',
      bio: 'Undergraduate student learning full stack technologies and eager for practical exposure.',
      coverLetter: 'Dear TechNova, I have learned web basics and want to learn React and Node.js in this internship.',
      status: 'PENDING' as const,
    };
  }),

  // --- Tier 5: Ineligible Applicants (Expected Ranks 91-100) ---
  // (10 applicants failing mandatory eligibility rules: e.g. 0 matching required skills, OR incompatible availability < 15 hrs, OR missing availability)
  ...Array.from({ length: 10 }, (_, i) => {
    const idx = i + 91;
    const names = [
      'Pradeep Rawat', 'Qasim Ali', 'Rashmi Khatri', 'Sandeep Nain', 'Tarun Gogoi',
      'Urvashi Rautela', 'Vipin Narang', 'Wahida Rehman', 'Xavier Lobo', 'Yogesh Nagar'
    ];
    const colleges = [
      'Sharda University', 'Delhi University', 'Amity University', 'Galgotias University', 'NIFT Delhi'
    ];

    const isIncompatibleHours = i < 4; // States 5 hrs or 8 hrs (gig mandates at least 15)
    const isMissingAvailability = i >= 4 && i < 7; // Null availability
    const isMissingAllSkills = i >= 7; // Designer or civil engineer with zero web/programming skills

    let skills: string[];
    let availability: { days: string[]; hours: string } | null;
    let bio: string;
    let coverLetter: string;

    if (isIncompatibleHours) {
      skills = ['React.js', 'Node.js', 'JavaScript', 'HTML', 'CSS'];
      availability = { days: ['Sun'], hours: `${5 + i} hrs/week` }; // Incompatible: only 5-8 hrs/week
      bio = 'Student with busy semester exam schedule.';
      coverLetter = 'Can only commit 5 to 8 hours on Sunday due to heavy college commitments.';
    } else if (isMissingAvailability) {
      skills = ['JavaScript', 'HTML', 'CSS'];
      availability = null; // Missing mandatory availability
      bio = 'Student exploring options.';
      coverLetter = 'Applying to see if there is an opening.';
    } else {
      skills = ['AutoCAD', 'Civil Engineering', 'Drafting', 'Building Materials']; // Missing all essential skills
      availability = { days: ['Mon', 'Tue'], hours: '20 hrs/week' };
      bio = 'Civil engineering student curious about tech.';
      coverLetter = 'I do not have programming experience but want to try web design.';
    }

    return {
      name: names[i] || `Applicant ${idx}`,
      college: colleges[i % colleges.length],
      degree: isMissingAllSkills ? 'B.Tech Civil Engineering' : 'B.Tech Computer Science',
      year: '2nd Year',
      skills,
      experience: isMissingAllSkills ? 'Surveying and CAD lab projects.' : 'Introductory web exercises.',
      availability,
      preferredWorkType: 'remote',
      location: 'New Delhi',
      bio,
      coverLetter,
      status: (i % 2 === 0 ? 'REJECTED' : 'PENDING') as 'PENDING' | 'REJECTED',
    };
  }),
];

async function main() {
  console.log('🌱 Seeding 100 Realistic Student Applicants for TechNova Solutions SmartMatch Demo...\n');

  const passwordHash = await bcrypt.hash('Demo@12345', 10);

  // 1. Create or ensure TechNova Solutions demo business exists
  const businessUser = await prisma.user.upsert({
    where: { email: 'demo-biz-technova@demo.gignova.com' },
    update: {},
    create: {
      email: 'demo-biz-technova@demo.gignova.com',
      password: passwordHash,
      role: 'BUSINESS',
      businessProfile: {
        create: {
          businessName: 'TechNova Solutions',
          description:
            'Premier software engineering company delivering modern web applications, scalable cloud infrastructure, and enterprise digital solutions.',
          industry: 'Software & Web Development',
          businessEmail: 'careers@technovasolutions.demo',
          contactPhone: '+91 98111 88990',
          website: 'https://technovasolutions.demo.gignova.com',
          location: 'Bengaluru / Remote',
          verificationStatus: 'VERIFIED',
        },
      },
    },
    include: { businessProfile: true },
  });

  const businessProfile =
    businessUser.businessProfile ||
    (await prisma.businessProfile.findUnique({ where: { userId: businessUser.id } }))!;

  console.log(`✅ Business profile verified: ${businessProfile.businessName} (${businessUser.email})`);

  // 2. Create Target Demonstration Gig: "Full Stack Web Development Intern"
  const targetGigId = 'demo-gig-100-fullstack';
  const targetGig = await prisma.gig.upsert({
    where: { id: targetGigId },
    update: {
      title: 'Full Stack Web Development Intern',
      description:
        'Looking for students interested in developing and maintaining modern web applications using React, Node.js, Express.js, and databases. You will work on real-world web features, API development, and responsive UI components.',
      category: 'Development',
      requiredSkills: JSON.stringify([
        'JavaScript',
        'React.js',
        'Node.js',
        'Express.js',
        'TypeScript',
        'HTML',
        'CSS',
        'SQL',
        'MongoDB',
      ]),
      compensation: '₹20,000/month',
      compensationType: 'monthly',
      workType: 'remote',
      location: 'Remote',
      duration: '8 weeks',
      openings: 5,
      requiredAvailability: 'At least 15 hours per week',
      status: 'ACTIVE',
    },
    create: {
      id: targetGigId,
      businessId: businessProfile.id,
      title: 'Full Stack Web Development Intern',
      description:
        'Looking for students interested in developing and maintaining modern web applications using React, Node.js, Express.js, and databases. You will work on real-world web features, API development, and responsive UI components.',
      category: 'Development',
      requiredSkills: JSON.stringify([
        'JavaScript',
        'React.js',
        'Node.js',
        'Express.js',
        'TypeScript',
        'HTML',
        'CSS',
        'SQL',
        'MongoDB',
      ]),
      compensation: '₹20,000/month',
      compensationType: 'monthly',
      workType: 'remote',
      location: 'Remote',
      duration: '8 weeks',
      openings: 5,
      requiredAvailability: 'At least 15 hours per week',
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Target gig verified: "${targetGig.title}" [ID: ${targetGig.id}]`);
  console.log(`📋 Generating ${APPLICANTS_DATA.length} unique student profiles and evaluating SmartMatch scores...`);

  const gigSkills = JSON.parse(targetGig.requiredSkills);

  let insertedCount = 0;
  let eligibleCount = 0;
  let ineligibleCount = 0;

  for (let i = 0; i < APPLICANTS_DATA.length; i++) {
    const item = APPLICANTS_DATA[i];
    const paddedIndex = String(i + 1).padStart(3, '0');
    const studentEmail = `mock-applicant-${paddedIndex}@demo.gignova.com`;
    const studentUserId = `demo-usr-100-${paddedIndex}`;

    // 1. Upsert Student User and StudentProfile
    const studentUser = await prisma.user.upsert({
      where: { email: studentEmail },
      update: {},
      create: {
        id: studentUserId,
        email: studentEmail,
        password: passwordHash,
        role: 'STUDENT',
        studentProfile: {
          create: {
            fullName: item.name,
            college: item.college,
            degree: item.degree,
            yearOfStudy: item.year,
            skills: JSON.stringify(item.skills),
            experience: item.experience,
            portfolioUrl: item.portfolioUrl || null,
            githubUrl: item.githubUrl || null,
            linkedinUrl: item.linkedinUrl || null,
            availability: item.availability ? JSON.stringify(item.availability) : null,
            preferredWorkType: item.preferredWorkType,
            bio: item.bio,
          },
        },
      },
      include: { studentProfile: true },
    });

    const studentProfile =
      studentUser.studentProfile ||
      (await prisma.studentProfile.findUnique({ where: { userId: studentUser.id } }))!;

    // 2. Upsert Application linked to target gig
    const application = await prisma.application.upsert({
      where: {
        gigId_studentId: {
          gigId: targetGig.id,
          studentId: studentUser.id,
        },
      },
      update: {
        coverLetter: item.coverLetter,
        status: item.status,
      },
      create: {
        gigId: targetGig.id,
        studentId: studentUser.id,
        coverLetter: item.coverLetter,
        status: item.status,
      },
    });

    // 3. Compute Deterministic SmartMatch Compatibility Score
    const calculated = calculateSmartMatchScore({
      gig: {
        id: targetGig.id,
        title: targetGig.title,
        description: targetGig.description,
        category: targetGig.category,
        requiredSkills: gigSkills,
        workType: targetGig.workType,
        location: targetGig.location,
        duration: targetGig.duration,
        requiredAvailability: targetGig.requiredAvailability,
        deadline: targetGig.deadline,
        status: targetGig.status,
      },
      studentProfile: {
        fullName: studentProfile.fullName,
        skills: JSON.parse(studentProfile.skills || '[]'),
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
      },
      application: {
        id: application.id,
        coverLetter: application.coverLetter,
        createdAt: application.createdAt,
      },
    });

    if (calculated.isEligible) eligibleCount++;
    else ineligibleCount++;

    // Pre-shortlist top candidates for rich presentation
    const isShortlisted = item.status === 'ACCEPTED' || (i < 5 && calculated.isEligible);

    // 4. Upsert SmartMatchScore
    await prisma.smartMatchScore.upsert({
      where: { applicationId: application.id },
      create: {
        applicationId: application.id,
        gigId: targetGig.id,
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

    // 5. Update Application matchScore
    await prisma.application.update({
      where: { id: application.id },
      data: { matchScore: calculated.totalScore },
    });

    insertedCount++;
    if (insertedCount % 20 === 0 || insertedCount === 100) {
      console.log(`  📊 Processed ${insertedCount}/100 applicants...`);
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎉 100 Mock Student Applicants Successfully Seeded!`);
  console.log(`======================================================`);
  console.log(`  - Target Gig: "${targetGig.title}" (${targetGig.id})`);
  console.log(`  - Employer: TechNova Solutions (demo-biz-technova@demo.gignova.com)`);
  console.log(`  - Password: Demo@12345`);
  console.log(`  - Total Applications: ${insertedCount}`);
  console.log(`  - Eligible Applicants: ${eligibleCount}`);
  console.log(`  - Ineligible Applicants: ${ineligibleCount}`);
  console.log(`======================================================\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error during 100-applicant seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
