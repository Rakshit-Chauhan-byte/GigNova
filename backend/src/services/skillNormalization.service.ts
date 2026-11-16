/**
 * Skill Normalization Service for GigNova SmartMatch
 * Normalizes skill names, manages aliases, and finds related skills for partial credit.
 */

// Skill aliases mapping (lowercase variant -> normalized canonical name)
const SKILL_ALIASES: Record<string, string> = {
  // Frontend
  'react': 'react',
  'react.js': 'react',
  'reactjs': 'react',
  'react native': 'react native',
  'react-native': 'react native',
  'javascript': 'javascript',
  'js': 'javascript',
  'es6': 'javascript',
  'ecmascript': 'javascript',
  'typescript': 'typescript',
  'ts': 'typescript',
  'next': 'next.js',
  'nextjs': 'next.js',
  'next.js': 'next.js',
  'vue': 'vue.js',
  'vuejs': 'vue.js',
  'vue.js': 'vue.js',
  'angular': 'angular',
  'angularjs': 'angular',
  'angular.js': 'angular',
  'html': 'html',
  'html5': 'html',
  'css': 'css',
  'css3': 'css',
  'sass': 'sass',
  'scss': 'sass',
  'tailwind': 'tailwind css',
  'tailwindcss': 'tailwind css',
  'tailwind css': 'tailwind css',
  'bootstrap': 'bootstrap',
  'redux': 'redux',

  // Backend
  'node': 'node.js',
  'nodejs': 'node.js',
  'node.js': 'node.js',
  'express': 'express.js',
  'expressjs': 'express.js',
  'express.js': 'express.js',
  'nest': 'nestjs',
  'nestjs': 'nestjs',
  'nest.js': 'nestjs',
  'python': 'python',
  'py': 'python',
  'python3': 'python',
  'django': 'django',
  'flask': 'flask',
  'fastapi': 'fastapi',
  'java': 'java',
  'spring': 'spring boot',
  'springboot': 'spring boot',
  'spring boot': 'spring boot',
  'c#': 'c#',
  'csharp': 'c#',
  '.net': '.net',
  'dotnet': '.net',
  'golang': 'go',
  'go': 'go',
  'rust': 'rust',
  'php': 'php',
  'laravel': 'laravel',
  'ruby': 'ruby',
  'rails': 'ruby on rails',
  'ruby on rails': 'ruby on rails',

  // Databases
  'sql': 'sql',
  'mysql': 'mysql',
  'postgres': 'postgresql',
  'postgresql': 'postgresql',
  'psql': 'postgresql',
  'sqlite': 'sqlite',
  'mongo': 'mongodb',
  'mongodb': 'mongodb',
  'redis': 'redis',
  'prisma': 'prisma',

  // Design
  'figma': 'figma',
  'ui design': 'ui design',
  'ux design': 'ux design',
  'ui/ux': 'ui/ux design',
  'ui/ux design': 'ui/ux design',
  'wireframing': 'wireframing',
  'prototyping': 'prototyping',
  'adobe xd': 'adobe xd',
  'photoshop': 'adobe photoshop',
  'illustrator': 'adobe illustrator',

  // Data & AI
  'pandas': 'pandas',
  'numpy': 'numpy',
  'scikit-learn': 'scikit-learn',
  'sklearn': 'scikit-learn',
  'machine learning': 'machine learning',
  'ml': 'machine learning',
  'data analysis': 'data analysis',
  'data science': 'data science',
  'deep learning': 'deep learning',
  'tensorflow': 'tensorflow',
  'pytorch': 'pytorch',

  // DevOps & Tools
  'git': 'git',
  'github': 'github',
  'docker': 'docker',
  'containerization': 'docker',
  'kubernetes': 'kubernetes',
  'k8s': 'kubernetes',
  'aws': 'aws',
  'amazon web services': 'aws',
  'gcp': 'google cloud',
  'google cloud': 'google cloud',
  'azure': 'azure',
  'ci/cd': 'ci/cd',
  'rest api': 'rest api',
  'rest apis': 'rest api',
  'rest': 'rest api',
  'restful': 'rest api',
  'git and github': 'git',
  'problem-solving': 'problem solving',
  'problem solving': 'problem solving',
  'graphql': 'graphql',
  'gql': 'graphql',
};

// Related skills mapping for partial credit (0.5 value)
const RELATED_SKILLS: Record<string, string[]> = {
  'react': ['javascript', 'typescript', 'next.js', 'html', 'css', 'redux'],
  'javascript': ['typescript', 'react', 'node.js', 'express.js', 'vue.js'],
  'typescript': ['javascript', 'react', 'node.js', 'next.js', 'nestjs'],
  'next.js': ['react', 'javascript', 'typescript', 'node.js'],
  'vue.js': ['javascript', 'typescript', 'html', 'css'],
  'angular': ['typescript', 'javascript', 'html', 'css'],
  'node.js': ['express.js', 'javascript', 'typescript', 'nestjs', 'rest api'],
  'express.js': ['node.js', 'javascript', 'typescript', 'rest api'],
  'python': ['django', 'flask', 'fastapi', 'data analysis', 'pandas'],
  'django': ['python', 'rest api', 'sql'],
  'flask': ['python', 'rest api'],
  'fastapi': ['python', 'rest api'],
  'pandas': ['python', 'numpy', 'data analysis', 'sql'],
  'numpy': ['python', 'pandas', 'data science', 'machine learning'],
  'machine learning': ['python', 'data science', 'deep learning', 'pandas', 'numpy'],
  'data science': ['python', 'machine learning', 'data analysis', 'sql', 'pandas'],
  'figma': ['ui design', 'ux design', 'ui/ux design', 'wireframing', 'prototyping'],
  'ui design': ['figma', 'ux design', 'ui/ux design', 'wireframing', 'prototyping'],
  'ux design': ['ui design', 'ui/ux design', 'figma', 'wireframing'],
  'ui/ux design': ['figma', 'ui design', 'ux design', 'wireframing', 'prototyping'],
  'html': ['css', 'javascript', 'tailwind css'],
  'css': ['html', 'tailwind css', 'sass'],
  'tailwind css': ['css', 'html'],
  'postgresql': ['sql', 'mysql', 'sqlite', 'database'],
  'mysql': ['sql', 'postgresql', 'database'],
  'mongodb': ['nosql', 'database'],
  'docker': ['kubernetes', 'devops', 'ci/cd', 'aws'],
  'kubernetes': ['docker', 'devops', 'aws'],
  'aws': ['docker', 'kubernetes', 'devops', 'google cloud', 'azure'],
  'rest api': ['graphql', 'express.js', 'node.js', 'fastapi'],
};

/**
 * Normalizes a skill string to its canonical form
 */
export function normalizeSkill(skill: string): string {
  if (!skill) return '';
  const cleaned = skill.trim().toLowerCase();
  return SKILL_ALIASES[cleaned] || cleaned;
}

export interface SkillMatchResult {
  matchedSkills: string[];
  partiallyMatchedSkills: string[];
  missingSkills: string[];
  skillScore: number;
}

/**
 * Compares student skills against gig required skills with alias normalization and partial matching
 */
export function matchSkills(
  studentRawSkills: string[],
  gigRawSkills: string[]
): SkillMatchResult {
  if (!gigRawSkills || gigRawSkills.length === 0) {
    return {
      matchedSkills: [],
      partiallyMatchedSkills: [],
      missingSkills: [],
      skillScore: 100, // Gig requires no specific skills, full credit
    };
  }

  // Canonicalize student skills
  const studentCanonical = new Set<string>();
  for (const s of studentRawSkills) {
    const norm = normalizeSkill(s);
    if (norm) studentCanonical.add(norm);
  }

  const matchedSkills: string[] = [];
  const partiallyMatchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const gigSkill of gigRawSkills) {
    const normGig = normalizeSkill(gigSkill);
    if (!normGig) continue;

    // Direct match check
    if (studentCanonical.has(normGig)) {
      matchedSkills.push(gigSkill);
      continue;
    }

    // Check related skills for partial credit
    const related = RELATED_SKILLS[normGig] || [];
    const hasRelated = related.some((rel) => studentCanonical.has(rel));

    if (hasRelated) {
      partiallyMatchedSkills.push(gigSkill);
    } else {
      missingSkills.push(gigSkill);
    }
  }

  // Exact match gets full credit (1.0), partial gets 0.5
  const totalRequired = gigRawSkills.length;
  const matchValue = matchedSkills.length * 1.0 + partiallyMatchedSkills.length * 0.5;
  const skillScore = Math.min(100, Math.round((matchValue / totalRequired) * 100));

  return {
    matchedSkills,
    partiallyMatchedSkills,
    missingSkills,
    skillScore,
  };
}
