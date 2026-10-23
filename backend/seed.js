require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('./src/models/User')
const Request = require('./src/models/Request')
const Message = require('./src/models/Message')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillsync'

async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('Connected to MongoDB for feeding test data...')

    // Clear existing requests and messages to repopulate cleanly
    await Request.deleteMany({})
    await Message.deleteMany({})

    const defaultPassword = await bcrypt.hash('password123', 10)

    const seedUsersData = [
      {
        name: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        password: defaultPassword,
        bio: 'Staff Software Engineer specializing in distributed systems, Node.js architecture, and React micro-frontends.',
        skillsToTeach: ['Node.js', 'System Design', 'React', 'TypeScript', 'GraphQL'],
        skillsToLearn: ['Rust', 'WebAssembly', 'Kubernetes'],
        reputation: 820,
        xp: 2550,
        level: 8,
        stats: {
          sessionsHelped: 38,
          sessionsLearned: 5,
          totalRatingsCount: 36,
          averageRating: 4.9,
          ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 4, 5: 31 }
        },
        streaks: {
          helpingStreak: 14,
          learningStreak: 3,
          lastHelpedAt: new Date(),
          lastLearnedAt: new Date(Date.now() - 86400000)
        },
        badges: [
          { id: 'first_help', name: 'First Helper', description: 'Assisted your first peer learner', icon: '🌟' },
          { id: 'twenty_five_helps', name: '25 Sessions', description: 'Assisted 25 peer learners', icon: '🏆' },
          { id: 'top_rated', name: 'Top Rated', description: 'Maintained 4.8+ rating across sessions', icon: '⭐' },
          { id: 'streak_7', name: '7-Day Streak', description: '7-day active helping streak', icon: '🌊' }
        ]
      },
      {
        name: 'Dr. Aris Thorne',
        email: 'aris.thorne@example.com',
        password: defaultPassword,
        bio: 'AI Research Scientist & LLM practitioner. Building production RAG workflows and fine-tuning open-source models.',
        skillsToTeach: ['Machine Learning', 'RAG', 'Python', 'LangChain', 'Vector DBs', 'PyTorch'],
        skillsToLearn: ['Go', 'Kubernetes', 'WebGPU'],
        reputation: 910,
        xp: 3100,
        level: 9,
        stats: {
          sessionsHelped: 44,
          sessionsLearned: 3,
          totalRatingsCount: 42,
          averageRating: 4.95,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 40 }
        },
        streaks: {
          helpingStreak: 18,
          learningStreak: 1,
          lastHelpedAt: new Date()
        },
        badges: [
          { id: 'first_help', name: 'First Helper', description: 'Assisted your first peer learner', icon: '🌟' },
          { id: 'twenty_five_helps', name: '25 Sessions', description: 'Assisted 25 peer learners', icon: '🏆' },
          { id: 'top_rated', name: 'Top Rated', description: 'Maintained 4.8+ rating', icon: '⭐' },
          { id: 'perfect_score', name: 'Perfect Score', description: 'Earned pristine 5-star feedback', icon: '💯' }
        ]
      },
      {
        name: 'Marcus Vance',
        email: 'marcus.vance@example.com',
        password: defaultPassword,
        bio: 'Senior Data Scientist & ML Engineer. Passionate about feature stores, PyTorch models, and real-time inference pipelines.',
        skillsToTeach: ['Python', 'Machine Learning', 'PyTorch', 'Data Analysis', 'SQL'],
        skillsToLearn: ['Next.js', 'Full Stack Development'],
        reputation: 670,
        xp: 1950,
        level: 6,
        stats: {
          sessionsHelped: 28,
          sessionsLearned: 8,
          totalRatingsCount: 27,
          averageRating: 4.85,
          ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 5, 5: 21 }
        },
        streaks: {
          helpingStreak: 6,
          learningStreak: 2,
          lastHelpedAt: new Date()
        },
        badges: [
          { id: 'first_help', name: 'First Helper', description: 'Assisted your first peer learner', icon: '🌟' },
          { id: 'ten_helps', name: '10 Sessions', description: 'Assisted 10 peer learners', icon: '💪' },
          { id: 'streak_3', name: '3-Day Streak', description: '3-day active streak', icon: '⚡' }
        ]
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        password: defaultPassword,
        bio: 'Lead Product Designer & Design Systems Engineer. Connecting Figma tokens with modern React component systems.',
        skillsToTeach: ['UI/UX Design', 'Figma', 'Design Systems', 'CSS Grid', 'Tailwind/Bootstrap'],
        skillsToLearn: ['React Native', 'Swift'],
        reputation: 560,
        xp: 1580,
        level: 5,
        stats: {
          sessionsHelped: 24,
          sessionsLearned: 13,
          totalRatingsCount: 23,
          averageRating: 4.9,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 3, 5: 20 }
        },
        streaks: {
          helpingStreak: 5,
          learningStreak: 4,
          lastHelpedAt: new Date()
        },
        badges: [
          { id: 'first_help', name: 'First Helper', description: 'Assisted your first peer learner', icon: '🌟' },
          { id: 'ten_helps', name: '10 Sessions', description: 'Assisted 10 peer learners', icon: '💪' },
          { id: 'top_rated', name: 'Top Rated', description: 'Maintained 4.8+ rating', icon: '⭐' }
        ]
      },
      {
        name: 'Mateo Silva',
        email: 'mateo.silva@example.com',
        password: defaultPassword,
        bio: 'Cloud Native & Kubernetes architect. Specialist in EKS, service meshes, Terraform modules, and cost optimization.',
        skillsToTeach: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'Linux', 'Helm'],
        skillsToLearn: ['Rust', 'Go'],
        reputation: 640,
        xp: 1850,
        level: 6,
        stats: {
          sessionsHelped: 27,
          sessionsLearned: 6,
          totalRatingsCount: 25,
          averageRating: 4.8,
          ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 4, 5: 20 }
        },
        streaks: { helpingStreak: 4, learningStreak: 1 },
        badges: [
          { id: 'first_help', name: 'First Helper', description: 'Assisted your first peer learner', icon: '🌟' },
          { id: 'ten_helps', name: '10 Sessions', description: 'Assisted 10 peer learners', icon: '💪' }
        ]
      },
      {
        name: 'Kavita Nambiar',
        email: 'kavita.nambiar@example.com',
        password: defaultPassword,
        bio: 'Principal Frontend Architect. Love teaching modern Next.js 15 App Router, React Server Components, and SSR caching.',
        skillsToTeach: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Web Performance'],
        skillsToLearn: ['Machine Learning', 'Python'],
        reputation: 730,
        xp: 2150,
        level: 7,
        stats: {
          sessionsHelped: 32,
          sessionsLearned: 7,
          totalRatingsCount: 30,
          averageRating: 4.9,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 3, 5: 27 }
        },
        streaks: { helpingStreak: 8, learningStreak: 2 },
        badges: [
          { id: 'first_help', name: 'First Helper', description: 'Assisted your first peer learner', icon: '🌟' },
          { id: 'twenty_five_helps', name: '25 Sessions', description: 'Assisted 25 peer learners', icon: '🏆' },
          { id: 'top_rated', name: 'Top Rated', description: 'Maintained high rating', icon: '⭐' }
        ]
      },
      {
        name: 'Kenji Sato',
        email: 'kenji.sato@example.com',
        password: defaultPassword,
        bio: 'Systems software developer. Deeply fond of Rust, Tokio async runtime, memory safety patterns, and WebAssembly.',
        skillsToTeach: ['Rust', 'WebAssembly', 'C++', 'Concurrency', 'Linux Internals'],
        skillsToLearn: ['TypeScript', 'GraphQL'],
        reputation: 690,
        xp: 1980,
        level: 6,
        stats: {
          sessionsHelped: 29,
          sessionsLearned: 5,
          totalRatingsCount: 28,
          averageRating: 4.88,
          ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 24 }
        },
        streaks: { helpingStreak: 6, learningStreak: 1 },
        badges: [
          { id: 'first_help', name: 'First Helper', description: 'Assisted your first peer learner', icon: '🌟' },
          { id: 'ten_helps', name: '10 Sessions', description: 'Assisted 10 peer learners', icon: '💪' }
        ]
      },
      {
        name: 'Amara Okafor',
        email: 'amara.okafor@example.com',
        password: defaultPassword,
        bio: 'Cybersecurity Analyst & Application Security Engineer. Teaching JWT hardening, OAuth 2.1, and secure coding practices.',
        skillsToTeach: ['Cybersecurity', 'OAuth2', 'JWT Security', 'OWASP Top 10', 'Pen-Testing'],
        skillsToLearn: ['Docker', 'Cloudflare Workers'],
        reputation: 580,
        xp: 1620,
        level: 5,
        stats: {
          sessionsHelped: 23,
          sessionsLearned: 9,
          totalRatingsCount: 22,
          averageRating: 4.82,
          ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 18 }
        },
        streaks: { helpingStreak: 4, learningStreak: 3 },
        badges: [
          { id: 'first_help', name: 'First Helper', description: 'Assisted your first peer learner', icon: '🌟' },
          { id: 'ten_helps', name: '10 Sessions', description: 'Assisted 10 peer learners', icon: '💪' }
        ]
      },
      {
        name: 'Zoe Washington',
        email: 'zoe.washington@example.com',
        password: defaultPassword,
        bio: 'Senior Database Reliability Engineer. Expert in PostgreSQL query optimization, vacuum tuning, and Redis caching topologies.',
        skillsToTeach: ['PostgreSQL', 'Redis', 'Database Indexing', 'SQL', 'MongoDB'],
        skillsToLearn: ['Kubernetes', 'Go'],
        reputation: 530,
        xp: 1470,
        level: 5,
        stats: {
          sessionsHelped: 21,
          sessionsLearned: 8,
          totalRatingsCount: 20,
          averageRating: 4.85,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 3, 5: 17 }
        },
        streaks: { helpingStreak: 3, learningStreak: 2 },
        badges: [
          { id: 'first_help', name: 'First Helper', description: 'Assisted your first peer learner', icon: '🌟' },
          { id: 'ten_helps', name: '10 Sessions', description: 'Assisted 10 peer learners', icon: '💪' }
        ]
      },
      {
        name: 'Liam O\'Connor',
        email: 'liam.oconnor@example.com',
        password: defaultPassword,
        bio: 'DevOps & CI/CD automation enthusiast. Passionate about GitHub Actions, Docker compose, and reproducible build systems.',
        skillsToTeach: ['Docker', 'CI/CD', 'GitHub Actions', 'Linux', 'AWS'],
        skillsToLearn: ['Go', 'Python'],
        reputation: 460,
        xp: 1290,
        level: 4,
        stats: {
          sessionsHelped: 18,
          sessionsLearned: 5,
          totalRatingsCount: 17,
          averageRating: 4.75,
          ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 4, 5: 12 }
        },
        streaks: { helpingStreak: 2, learningStreak: 1 },
        badges: [
          { id: 'first_help', name: 'First Helper', description: 'Assisted your first peer learner', icon: '🌟' },
          { id: 'five_helps', name: '5 Sessions', description: 'Assisted 5 peer learners', icon: '🔥' }
        ]
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        password: defaultPassword,
        bio: 'Backend engineer focusing on high-concurrency Go microservices, REST architectures, and gRPC streaming.',
        skillsToTeach: ['Go / Golang', 'gRPC', 'REST API Design', 'PostgreSQL'],
        skillsToLearn: ['Rust', 'Distributed Systems'],
        reputation: 410,
        xp: 1040,
        level: 4,
        stats: {
          sessionsHelped: 15,
          sessionsLearned: 7,
          totalRatingsCount: 14,
          averageRating: 4.8,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 3, 5: 11 }
        },
        streaks: { helpingStreak: 3, learningStreak: 1 },
        badges: [
          { id: 'first_help', name: 'First Helper', icon: '🌟', description: 'First helped session' }
        ]
      },
      {
        name: 'David Kim',
        email: 'david.kim@example.com',
        password: defaultPassword,
        bio: 'Mobile software engineer building Flutter and React Native cross-platform apps with beautiful micro-interactions.',
        skillsToTeach: ['Flutter', 'Dart', 'React Native', 'Mobile UI Architecture'],
        skillsToLearn: ['Node.js', 'Docker'],
        reputation: 310,
        xp: 820,
        level: 3,
        stats: {
          sessionsHelped: 11,
          sessionsLearned: 16,
          totalRatingsCount: 10,
          averageRating: 4.7,
          ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 7 }
        },
        streaks: { helpingStreak: 2, learningStreak: 6 },
        badges: [
          { id: 'first_help', name: 'First Helper', icon: '🌟', description: 'First helper' }
        ]
      },
      {
        name: 'Hanna Lindqvist',
        email: 'hanna.lindqvist@example.com',
        password: defaultPassword,
        bio: 'Frontend accessibility champion. Specialist in WCAG 2.2 criteria, ARIA patterns, keyboard navigation, and semantic HTML.',
        skillsToTeach: ['Web Accessibility (a11y)', 'ARIA', 'Semantic HTML', 'CSS Architecture'],
        skillsToLearn: ['Vue.js', 'Nuxt'],
        reputation: 370,
        xp: 940,
        level: 3,
        stats: {
          sessionsHelped: 13,
          sessionsLearned: 9,
          totalRatingsCount: 12,
          averageRating: 4.85,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 10 }
        },
        streaks: { helpingStreak: 2, learningStreak: 3 },
        badges: [
          { id: 'first_help', name: 'First Helper', icon: '🌟', description: 'First helper' }
        ]
      }
    ]

    const usersMap = {}
    for (const uData of seedUsersData) {
      let user = await User.findOne({ email: uData.email })
      if (user) {
        Object.assign(user, uData)
        await user.save()
      } else {
        user = await User.create(uData)
      }
      usersMap[uData.email] = user
    }

    // Ensure Alex Rivera exists (default test user)
    let alex = await User.findOne({ email: 'alex.rivera@example.com' })
    if (!alex) {
      alex = await User.create({
        name: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        password: defaultPassword,
        bio: 'Frontend dev & open-source enthusiast passionate about React, Vite, and UI engineering.',
        skillsToTeach: ['React', 'JavaScript', 'CSS & Bootstrap', 'Vite'],
        skillsToLearn: ['Python', 'Docker', 'System Design'],
        reputation: 260,
        xp: 680,
        level: 3,
        stats: {
          sessionsHelped: 7,
          sessionsLearned: 9,
          totalRatingsCount: 6,
          averageRating: 5.0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 6 }
        },
        streaks: { helpingStreak: 3, learningStreak: 4 },
        badges: [
          { id: 'first_help', name: 'First Helper', description: 'Assisted your first peer learner', icon: '🌟' },
          { id: 'perfect_score', name: 'Perfect Score', description: 'Received a 5-star rating', icon: '💯' }
        ]
      })
    }
    usersMap['alex.rivera@example.com'] = alex

    console.log(`Seeded / updated ${Object.keys(usersMap).length} active community members.`)

    const sarah = usersMap['sarah.chen@example.com']
    const aris = usersMap['aris.thorne@example.com']
    const marcus = usersMap['marcus.vance@example.com']
    const priya = usersMap['priya.patel@example.com']
    const mateo = usersMap['mateo.silva@example.com']
    const kavita = usersMap['kavita.nambiar@example.com']
    const kenji = usersMap['kenji.sato@example.com']
    const amara = usersMap['amara.okafor@example.com']
    const zoe = usersMap['zoe.washington@example.com']
    const liam = usersMap['liam.oconnor@example.com']
    const elena = usersMap['elena.rostova@example.com']
    const david = usersMap['david.kim@example.com']
    const hanna = usersMap['hanna.lindqvist@example.com']

    // Create a rich selection of requests:
    // 1. OPEN requests (displayed in Browse Requests)
    // 2. ACCEPTED / In-Progress requests (live active sessions)
    // 3. CLOSED requests with reviews and ratings (historical)
    const seedRequests = [
      // --- OPEN REQUESTS ---
      {
        skill: 'Next.js 15 App Router & Server Actions',
        description: 'Need help refactoring an existing client-side form to use Next.js 15 Server Actions with useActionState and revalidatePath. Looking for clean error handling patterns.',
        requester: alex._id,
        status: 'open',
        active: true,
        createdAt: new Date(Date.now() - 3600000 * 1)
      },
      {
        skill: 'Rust Borrow Checker & Lifetime Annotations',
        description: 'Stuck fighting the borrow checker with a struct holding references to parsed tokens. Need someone experienced with Rust lifetimes to explain idiomatic patterns or using Cow/Arc.',
        requester: liam._id,
        status: 'open',
        active: true,
        createdAt: new Date(Date.now() - 3600000 * 3)
      },
      {
        skill: 'RAG Pipeline with LangChain & Pinecone',
        description: 'Building a semantic search Q&A bot. Need help optimizing chunking strategy and metadata filtering with OpenAI embeddings to prevent hallucinations.',
        requester: david._id,
        status: 'open',
        active: true,
        createdAt: new Date(Date.now() - 3600000 * 5)
      },
      {
        skill: 'Kubernetes Ingress & Cert-Manager on EKS',
        description: 'Need assistance setting up an AWS Load Balancer Controller with cert-manager for automatic Let\'s Encrypt SSL certificate issuance in an EKS cluster.',
        requester: hanna._id,
        status: 'open',
        active: true,
        createdAt: new Date(Date.now() - 3600000 * 7)
      },
      {
        skill: 'JWT Refresh Token Rotation & Cookie Security',
        description: 'Implementing secure authentication in Express. Want to review httpOnly cookie configuration, SameSite attributes, and handling race conditions during concurrent refresh token requests.',
        requester: mateo._id,
        status: 'open',
        active: true,
        createdAt: new Date(Date.now() - 3600000 * 9)
      },
      {
        skill: 'PostgreSQL Index Tuning with EXPLAIN ANALYZE',
        description: 'A query joining a 2M-row orders table with customers is taking over 4 seconds. Need a database peer to review the query execution plan and recommend partial or composite indexes.',
        requester: kavita._id,
        status: 'open',
        active: true,
        createdAt: new Date(Date.now() - 3600000 * 12)
      },
      {
        skill: 'WebRTC PeerConnection & MediaStream',
        description: 'Creating a 1-on-1 audio calling feature. Need help understanding the SDP offer/answer exchange and handling ICE candidate re-negotiation when network switches.',
        requester: elena._id,
        status: 'open',
        active: true,
        createdAt: new Date(Date.now() - 3600000 * 15)
      },
      {
        skill: 'Tailwind CSS v4 CSS Architecture & Themes',
        description: 'Upgrading a design library from Tailwind v3 to v4. Need help configuring the new @theme directive, CSS custom properties, and container queries.',
        requester: kenji._id,
        status: 'open',
        active: true,
        createdAt: new Date(Date.now() - 3600000 * 18)
      },
      {
        skill: 'FastAPI Async Workers & Background Tasks',
        description: 'Need help properly offloading long-running PDF processing tasks from FastAPI handlers using Celery/Redis without blocking the event loop.',
        requester: priya._id,
        status: 'open',
        active: true,
        createdAt: new Date(Date.now() - 3600000 * 22)
      },
      {
        skill: 'GraphQL Federation with Apollo Router',
        description: 'Splitting a monolithic GraphQL schema into two subgraphs (Users and Billing). Need help setting up Apollo Router entity keys and @key directives.',
        requester: alex._id,
        status: 'open',
        active: true,
        createdAt: new Date(Date.now() - 3600000 * 26)
      },
      {
        skill: 'Figma Auto-Layout & Design System Variables',
        description: 'Setting up multi-mode color variables and spacing tokens in Figma. Looking for feedback on component variant structure and documentation.',
        requester: liam._id,
        status: 'open',
        active: true,
        createdAt: new Date(Date.now() - 3600000 * 30)
      },
      {
        skill: 'Docker Compose Multi-Container Networking',
        description: 'Need help connecting an Express API with MongoDB, Redis, and a mock mail server container on a shared Docker bridge network with health checks.',
        requester: david._id,
        status: 'open',
        active: true,
        createdAt: new Date(Date.now() - 3600000 * 36)
      },

      // --- ACCEPTED / IN-PROGRESS SESSIONS ---
      {
        skill: 'React Custom Hooks & Render Optimization',
        description: 'Facing redundant re-renders with a complex data table component. Looking for guidance on memoization strategies, custom hook separation, and React Compiler compatibility.',
        requester: alex._id,
        helper: kavita._id,
        status: 'accepted',
        active: false,
        acceptedAt: new Date(Date.now() - 3600000 * 2),
        createdAt: new Date(Date.now() - 3600000 * 6)
      },
      {
        skill: 'PyTorch Model Training & Loss Function Debugging',
        description: 'Training loss diverges after epoch 3 on a custom classifier. Looking for a peer to review gradient clipping, learning rate warmup, and data normalization.',
        requester: elena._id,
        helper: aris._id,
        status: 'accepted',
        active: false,
        acceptedAt: new Date(Date.now() - 3600000 * 4),
        createdAt: new Date(Date.now() - 3600000 * 8)
      },
      {
        skill: 'Go Concurrency with Channels & WaitGroups',
        description: 'Building a worker pool in Go that fetches external APIs concurrently with rate limiting. Need advice on clean cancellation with context.Context.',
        requester: david._id,
        helper: kenji._id,
        status: 'accepted',
        active: false,
        acceptedAt: new Date(Date.now() - 3600000 * 3),
        createdAt: new Date(Date.now() - 3600000 * 10)
      },
      {
        skill: 'CSS Subgrid & Complex Layouts',
        description: 'Building an interactive multi-column card grid where headers and footers align across all sibling cards using CSS Subgrid. Need a review of browser fallbacks.',
        requester: priya._id,
        helper: alex._id,
        status: 'accepted',
        active: false,
        acceptedAt: new Date(Date.now() - 3600000 * 1),
        createdAt: new Date(Date.now() - 3600000 * 4)
      },

      // --- COMPLETED & RATED SESSIONS ---
      {
        skill: 'Vite Plugin & Fast HMR Configuration',
        description: 'Configuring custom virtual modules in Vite with fast Hot Module Replacement during development.',
        requester: liam._id,
        helper: alex._id,
        status: 'closed',
        active: false,
        rating: 5,
        feedback: 'Alex explained Vite rollup options and HMR accept boundaries perfectly. Solved our dev reload lag completely!',
        acceptedAt: new Date(Date.now() - 86400000 * 1),
        closedAt: new Date(Date.now() - 86400000 * 1 + 2100000),
        ratedAt: new Date(Date.now() - 86400000 * 1 + 2300000),
        createdAt: new Date(Date.now() - 86400000 * 2)
      },
      {
        skill: 'Docker Multi-stage Builds for Go Services',
        description: 'Wanted to reduce Docker image size from 800MB to under 30MB using scratch and alpine multi-stage build techniques.',
        requester: alex._id,
        helper: mateo._id,
        status: 'closed',
        active: false,
        rating: 5,
        feedback: 'Mateo was awesome! Showed me how to compile statically with CGO_ENABLED=0 and our image went down to 18MB. Incredible session.',
        acceptedAt: new Date(Date.now() - 86400000 * 2),
        closedAt: new Date(Date.now() - 86400000 * 2 + 2400000),
        ratedAt: new Date(Date.now() - 86400000 * 2 + 2500000),
        createdAt: new Date(Date.now() - 86400000 * 3)
      },
      {
        skill: 'CSS Flexbox vs Grid for Complex Dashboards',
        description: 'Needed advice on building a responsive 3-column analytics dashboard that gracefully collapses to single-column on mobile viewports.',
        requester: marcus._id,
        helper: priya._id,
        status: 'closed',
        active: false,
        rating: 5,
        feedback: 'Priya explained CSS grid template areas so clearly. The responsive transition looks completely natural now.',
        acceptedAt: new Date(Date.now() - 86400000 * 3),
        closedAt: new Date(Date.now() - 86400000 * 3 + 2700000),
        ratedAt: new Date(Date.now() - 86400000 * 3 + 2800000),
        createdAt: new Date(Date.now() - 86400000 * 4)
      },
      {
        skill: 'Redis Cache-Aside Pattern Implementation',
        description: 'Designing a caching layer in Node.js with TTL and stampede mitigation for frequently queried user profile feeds.',
        requester: liam._id,
        helper: zoe._id,
        status: 'closed',
        active: false,
        rating: 5,
        feedback: 'Zoe is a true database expert. Walked me through probabilistic early recomputation to prevent cache stampedes.',
        acceptedAt: new Date(Date.now() - 86400000 * 4),
        closedAt: new Date(Date.now() - 86400000 * 4 + 3000000),
        ratedAt: new Date(Date.now() - 86400000 * 4 + 3100000),
        createdAt: new Date(Date.now() - 86400000 * 5)
      },
      {
        skill: 'OAuth 2.1 PKCE Flow for Single Page Apps',
        description: 'Securing an authorization code flow with PKCE without storing client secrets in client-side JavaScript.',
        requester: david._id,
        helper: amara._id,
        status: 'closed',
        active: false,
        rating: 5,
        feedback: 'Amara helped me verify that code_verifier and code_challenge hashes matched exactly. Very reassuring security review!',
        acceptedAt: new Date(Date.now() - 86400000 * 5),
        closedAt: new Date(Date.now() - 86400000 * 5 + 3200000),
        ratedAt: new Date(Date.now() - 86400000 * 5 + 3300000),
        createdAt: new Date(Date.now() - 86400000 * 6)
      }
    ]

    const createdRequests = await Request.insertMany(seedRequests)
    console.log(`Seeded ${createdRequests.length} requests (12 open, 3 accepted, 4 closed).`)

    // Seed realistic chat history for the active session (Alex + Kavita on React Custom Hooks)
    const activeReactReq = createdRequests.find(r => r.skill === 'React Custom Hooks & Render Optimization')
    if (activeReactReq) {
      await Message.insertMany([
        {
          roomId: activeReactReq._id.toString(),
          sender: kavita._id,
          senderName: kavita.name,
          text: 'Hi Alex! I saw your request on React custom hooks and redundant re-renders. Happy to take a look at your component structure!',
          createdAt: new Date(Date.now() - 3600000 * 1.8)
        },
        {
          roomId: activeReactReq._id.toString(),
          sender: alex._id,
          senderName: alex.name,
          text: 'Hi Kavita! Thanks so much for accepting. I have a large table component that re-renders all 50 rows whenever a filter input changes in the parent header.',
          createdAt: new Date(Date.now() - 3600000 * 1.5)
        },
        {
          roomId: activeReactReq._id.toString(),
          sender: kavita._id,
          senderName: kavita.name,
          text: 'Classic scenario! Are the rows passing inline callbacks like `onClick={() => handleSelect(row.id)}` or complex non-memoized objects as props?',
          createdAt: new Date(Date.now() - 3600000 * 1.2)
        },
        {
          roomId: activeReactReq._id.toString(),
          sender: alex._id,
          senderName: alex.name,
          text: 'Yes! Exactly that — inline functions in each row cell. That must be breaking React.memo.',
          createdAt: new Date(Date.now() - 3600000 * 1.0)
        },
        {
          roomId: activeReactReq._id.toString(),
          sender: kavita._id,
          senderName: kavita.name,
          text: 'Spot on. By memoizing the handler with `useCallback` or passing an `onSelect` handler that takes the ID as argument, only the affected row will re-render!',
          createdAt: new Date(Date.now() - 3600000 * 0.8)
        }
      ])
      console.log('Seeded live chat message history for active exchange.')
    }

    console.log('Test data feeding completed successfully!')
    process.exit(0)
  } catch (err) {
    console.error('Seeding error:', err)
    process.exit(1)
  }
}

seed()
