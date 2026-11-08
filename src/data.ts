// All site content lives here. Edit this file to update the website.

export type SpotId = 'hero' | 'mandiri' | 'diksha' | 'indocyber' | 'unggul' | 'phincon' | 'casestudy' | 'projects' | 'skills' | 'contact'

export interface Stat {
  value: number
  suffix?: string
  label: string
}

export interface Role {
  spot: SpotId
  title: string
  company: string
  context: string
  dates: string
  stats: Stat[]
  points: string[]
}

export const ROLES: Role[] = [
  {
    spot: 'mandiri',
    title: 'System Analyst',
    company: 'PT Bank Mandiri (Persero) Tbk',
    context: 'Transfer and payroll products',
    dates: 'Jul 2026 to present',
    stats: [
      { value: 5, label: 'products' },
      { value: 40, label: 'APIs specified' },
      { value: 188, label: 'screen specs' },
      { value: 307, label: 'Jira tickets' },
    ],
    points: [
      'Design requirements, APIs, and database tables with Product Owners',
      'Test features internally before they reach the testing team',
      'Trace bugs through Kibana logs to their root cause',
      'Document every change in Confluence',
    ],
  },
  {
    spot: 'diksha',
    title: 'Junior Product Manager and System Analyst',
    company: 'Diksha Technologies',
    context: 'Placed at BRI, on the BRImo mobile banking app',
    dates: 'Mar 2025 to Aug 2025',
    stats: [
      { value: 8, suffix: '+', label: 'PRDs written' },
      { value: 3, suffix: '+', label: 'payment user flows' },
    ],
    points: [
      'Wrote requirements that engineering and QA teams used to build and test payment features',
      'Benchmarked peer mobile banking apps to inform priorities',
      'Defined acceptance criteria and took features through UAT',
      'Designed UML diagrams and Postman collections for API testing',
    ],
  },
  {
    spot: 'indocyber',
    title: 'System Analyst',
    company: 'PT Indocyber Global Teknologi',
    context: 'Placed at Bank Mandiri, on Kopra by Mandiri',
    dates: 'Mar 2024 to Mar 2025',
    stats: [
      { value: 300, suffix: '+', label: 'web screens documented' },
      { value: 1200, suffix: '+', label: 'Jira tickets' },
      { value: 6, label: 'Product Owners' },
    ],
    points: [
      'Designed API specifications and database tables',
      'Turned business needs into application requirements',
      'Found the root cause of bugs and gave developers clear steps to fix them',
    ],
  },
  {
    spot: 'unggul',
    title: 'Junior Software Engineer',
    company: 'PT Unggul Mitra Solusi',
    context: 'ERP for finance, purchase, sales, accounting, and stock',
    dates: 'Feb 2023 to Feb 2024',
    stats: [
      { value: 10, suffix: '+', label: 'features' },
      { value: 5, label: 'ERP modules' },
      { value: 30, suffix: '+', label: 'REST APIs' },
    ],
    points: [
      'Built features with Laravel, React.js, and Next.js',
      'Tested and validated APIs with Postman',
      'Reviewed system flows to catch the impact of new features',
    ],
  },
  {
    spot: 'phincon',
    title: 'Web Developer Intern',
    company: 'PHINCON',
    context: 'ERP and CRM',
    dates: 'Feb 2022 to Feb 2023',
    stats: [{ value: 2, label: 'enterprise systems' }],
    points: ['Built REST APIs and fixed bugs with Java Spring Boot and Angular'],
  },
]

export const BUBBLES: Record<SpotId, string> = {
  hero: 'Hi there!',
  mandiri: 'Writing specs for transfers',
  diksha: 'Mobile banking at BRI',
  indocyber: 'Checking every screen',
  unggul: 'Back when I wrote ERP code',
  phincon: 'This is where I started',
  casestudy: 'Pick a step and look around',
  projects: 'We built these to compete',
  skills: 'Hmm, what do I use?',
  contact: 'Send me a message!',
}

// The speech bubble is the site's navigation. Each stop offers where to go next.
export const CHOICES: Record<SpotId, { label: string; to: SpotId }[]> = {
  hero: [
    { label: 'Your work', to: 'mandiri' },
    { label: 'How you work', to: 'casestudy' },
    { label: 'Projects', to: 'projects' },
    { label: 'Skills', to: 'skills' },
    { label: 'Contact', to: 'contact' },
  ],
  mandiri: [{ label: 'Job before this', to: 'diksha' }, { label: 'How you work', to: 'casestudy' }],
  diksha: [{ label: 'Job before this', to: 'indocyber' }, { label: 'How you work', to: 'casestudy' }],
  indocyber: [{ label: 'Job before this', to: 'unggul' }, { label: 'How you work', to: 'casestudy' }],
  unggul: [{ label: 'Job before this', to: 'phincon' }, { label: 'How you work', to: 'casestudy' }],
  phincon: [{ label: 'How you work', to: 'casestudy' }, { label: 'Back to the start', to: 'hero' }],
  casestudy: [{ label: 'Your projects', to: 'projects' }, { label: 'Contact', to: 'contact' }],
  projects: [{ label: 'Your skills', to: 'skills' }, { label: 'Contact', to: 'contact' }],
  skills: [{ label: 'How to reach you', to: 'contact' }, { label: 'Your work', to: 'mandiri' }],
  contact: [{ label: 'Back to the start', to: 'hero' }, { label: 'Your work', to: 'mandiri' }],
}

// Answers the character gives when visitors ask him something. Rewrite these in your own words.
export const QUESTIONS = [
  {
    q: 'Why system analyst?',
    a: "I've worked as a developer and as a product manager. System analysis sits between the two: I work out what the business needs and write it so developers can build it.",
  },
  {
    q: 'What are you working on?',
    a: "Transfer and payroll products at Bank Mandiri. So far that's 40 APIs specified and 188 screen specifications.",
  },
  {
    q: 'Can you still code?',
    a: 'Yes. I built ERP systems with Laravel, React, and Next.js, and I still do frontend and full-stack work in competitions.',
  },
  {
    q: 'Best competition result?',
    a: 'SAKSI reached the top 50 at Healthkathon 2026, and ITTU Forensic reached the top 80 at PIDI DIGDAYA.',
  },
  {
    q: 'Do you speak Mandarin?',
    a: 'Conversationally. I studied it full-time at Zhejiang University from 2025 to 2026.',
  },
]

export interface Project {
  name: string
  tagline: string
  detail: string
  role: string
  /** Competition result, shown as a badge. Leave out when there is none. */
  result?: string
  /** Optional link for the result badge, such as the competition's page. */
  resultHref?: string
  tech: string[]
  live?: string
  code?: string
}

export const PROJECTS: Project[] = [
  {
    name: 'SAKSI',
    tagline: 'AI phone calls that verify health insurance claims',
    detail: 'Calls JKN members to confirm that a claimed hospital service really happened, then shows their answers beside the claim so a BPJS verifier can decide. I built the frontend and combined BPJS sample data into the aggregates and datasets the database needed.',
    role: 'Frontend and data analyst',
    result: 'Top 50, Healthkathon 2026',
    tech: ['Twilio Voice', 'WhatsApp API', 'Speech-to-Text', 'Gemini on Vertex AI'],
    live: 'https://saksi-e7qnoeocsa-as.a.run.app/',
  },
  {
    name: 'ITTU Forensic',
    tagline: 'Financial crime investigation console',
    detail: 'One console for police, regulators, banks, and exchanges, with data separated per agency and a hash-chained audit trail.',
    role: 'Frontend',
    result: 'Top 80, PIDI DIGDAYA',
    resultHref: 'https://www.bi.go.id/id/PIDI/default.aspx',
    tech: ['Row-level security', 'Audit trail', 'Google sign-in'],
    live: 'https://honeypot-brown.vercel.app/login',
  },
  {
    name: 'OLAF',
    tagline: 'AI voice companion for elderly care',
    detail: 'Four voice-first agents that talk in real time, turn spoken memories into illustrated stories, and alert family when needed. Built for the Gemini Live Agent Challenge.',
    role: 'Full-stack developer',
    tech: ['Next.js', 'FastAPI', 'Google ADK', 'Gemini Live', 'Firebase'],
    live: 'https://olaf-dev-7a5d4.web.app/',
    code: 'https://github.com/RaymonddC/olaf',
  },
  {
    name: 'ELSA',
    tagline: 'AI wallet analyzer',
    detail: 'Analyzes Bitcoin and Ethereum wallets with an agent that shows every step of its reasoning and flags unusual transactions.',
    role: 'Full-stack developer',
    tech: ['React', 'Express', 'Elasticsearch', 'OpenAI', 'Docker'],
    live: 'https://project-30dd0d97-4e23-4201-ac7.web.app/',
    code: 'https://github.com/RaymonddC/elsa',
  },
  {
    name: 'MITU',
    tagline: 'Autonomous payroll agent',
    detail: 'Runs daily payroll on Ethereum for multiple employers through smart contracts, with AI fraud checks and an on-chain audit trail.',
    role: 'Full-stack developer',
    tech: ['React', 'Node.js', 'Ethereum', 'Smart contracts', 'MongoDB'],
    live: 'https://mitu-frontend.vercel.app/',
    code: 'https://github.com/RaymonddC/mitu',
  },
  {
    name: 'RAMI',
    tagline: 'AI study sidekick',
    detail: 'A Chrome extension that turns web pages into mind maps and study tools with on-device AI, so nothing leaves the browser.',
    role: 'Full-stack developer',
    tech: ['Chrome extension', 'Gemini Nano', 'React Flow', 'Mermaid'],
    code: 'https://github.com/RaymonddC/rami-extension',
  },
]

export const SKILLS = [
  {
    title: 'Analysis',
    items: ['Requirements gathering', 'Business analysis', 'UML and ERD', 'API specification', 'Database design', 'Data mapping', 'User flows', 'PRDs', 'Acceptance criteria', 'UAT', 'Root cause analysis'],
  },
  { title: 'Tools', items: ['Jira', 'Confluence', 'Kibana', 'Postman', 'Git'] },
  {
    title: 'Development',
    items: ['Java', 'Spring Boot', 'PHP', 'Laravel', 'JavaScript', 'TypeScript', 'React.js', 'Next.js', 'Angular', 'Express', 'Golang', 'MySQL', 'MongoDB'],
  },
]

export const BACKGROUND = [
  { title: 'Computer Science, GPA 3.55/4.00', detail: 'BINUS University, 2019 to 2023' },
  { title: 'Mandarin language study', detail: 'Zhejiang University, China, 2025 to 2026' },
  { title: 'DIGDAYA Essential, Practitioner, and Capstone', detail: 'LPPI, 2026' },
  { title: 'Indonesian, English, and Mandarin', detail: 'Native in Indonesian, conversational in the others' },
]

export const LINKS = {
  email: 'wilbertw99@gmail.com',
  linkedin: 'https://www.linkedin.com/in/wilbert-wil-712712152/',
  github: 'https://github.com/kerbaudisko21',
  resume: '/Wilbert-Resume-System-Analyst.pdf',
}
