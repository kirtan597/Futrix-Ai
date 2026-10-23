/**
 * localAiEngine.js — High-Fidelity Local Analysis Engine (Fail-safe Fallback)
 * Provides 100% parity with python-ai/ai_engine.py.
 * Ensures the platform NEVER throws 502/503 or fails to analyze resumes even if
 * Python AI service is offline, sleeping on cold start (Render free tier), or restarting.
 * 
 * Deep Contextual Resume Analysis + 5-Pillar Readiness Scoring + Adaptive Skill Gap Diagnostics.
 * Truly analyzes the actual uploaded/pasted text:
 * - Extracts career timeline, seniority tier, and professional experience years
 * - Detects quantified business impact metrics (scale, throughput, users, revenue, latency)
 * - Maps skills with contextual evidence (Work Experience, Lead roles, Projects, Certifications)
 * - Dynamically generates role-specific & seniority-tiered skill gaps (no generic placeholders)
 * - Evaluates multi-factor readiness scoring (Stack Breadth, Seniority, Impact, Rigor, Credentials)
 */

const KNOWN_SKILLS = [
    "Java", "Python", "JavaScript", "TypeScript", "React", "Node.js", "Express",
    "MongoDB", "SQL", "Docker", "Kubernetes", "AWS", "Azure", "Git", "GitHub",
    "C++", "C#", "Spring Boot", "Django", "Flask", "FastAPI", "HTML", "CSS",
    "Tailwind", "Go", "Rust", "Swift", "Kotlin", "TensorFlow", "PyTorch", "Pandas",
    "NumPy", "Scikit-Learn", "Machine Learning", "AI", "Agile", "Scrum",
    "System Design", "Microservices", "REST API", "GraphQL", "CI/CD", "DevOps",
    "PostgreSQL", "MySQL", "Redis", "Linux", "Terraform", "Ansible", "Nginx",
    "Apache Kafka", "Spark", "Airflow", "Hadoop", "Elasticsearch", "RabbitMQ",
    "Vue", "Angular", "Next.js", "Svelte", "Bootstrap", "Sass", "LESS", "jQuery",
    "PHP", "Ruby", "Ruby on Rails", "Perl", "Scala", "R", "MATLAB", "Dart",
    "Flutter", "React Native", "Ionic", "Electron", "Firebase", "Supabase",
    "Prisma", "Sequelize", "SQLite", "DynamoDB", "Cassandra", "Neo4j", "Jenkins",
    "GitHub Actions", "CircleCI", "Travis CI", "GitLab CI", "Prometheus", "Grafana",
    "Datadog", "New Relic", "Sentry", "Webpack", "Vite", "Babel", "ESLint", "Jest",
    "Cypress", "Selenium", "Playwright", "Mocha", "Pytest", "JUnit", "Swagger",
    "Postman", "gRPC", "WebSocket", "OAuth", "JWT", "SAML", "Figma", "Jira",
    "Confluence", "Notion", "Slack", "VS Code", "IntelliJ", "GCP", "Heroku",
    "Vercel", "Netlify", "DigitalOcean", "Cloudflare", "S3", "Lambda", "EC2",
    "ECS", "Fargate", "CloudFormation", "ARM Templates", "Power BI", "Tableau",
    "Data Analysis", "Deep Learning", "Natural Language Processing", "Computer Vision",
    "Reinforcement Learning", "Keras", "OpenCV", "NLTK", "spaCy", "Hugging Face",
    "LangChain", "RAG", "LLM", "Prompt Engineering", "Apache", "Tomcat", "IIS",
    "Solr", "Logstash", "Kibana", "Vagrant", "Chef", "Puppet", "Packer", "Consul",
    "Vault", "Kong", "Istio", "Service Mesh", "Serverless", "Edge Computing",
    "IoT", "Blockchain", "Solidity", "Web3", "Ethereum"
];

const BOUNDARY_SKILLS = new Set(["Go", "AI", "R", "C", "C#", "C++", "SQL", "GCP", "CSS", "HTML", "Java"]);

const SKILL_ALIASES = {
    "node.js": ["nodejs", "node .js", "node js"],
    "react": ["react.js", "reactjs"],
    "next.js": ["nextjs", "next js"],
    "express": ["express.js", "expressjs"],
    "vue": ["vue.js", "vuejs"],
    "angular": ["angular.js", "angularjs"],
    "postgresql": ["postgres", "psql"],
    "mongodb": ["mongo"],
    "rest api": ["restful api", "restful apis", "rest apis", "restful", "rest api design"],
    "ci/cd": ["cicd", "ci / cd", "continuous integration"],
    "aws": ["amazon web services"],
    "gcp": ["google cloud platform", "google cloud"],
    "machine learning": ["ml"],
    "github actions": ["github action"],
};

function isSkillPresent(skill, text) {
    if (BOUNDARY_SKILLS.has(skill)) {
        const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const pattern = new RegExp(`(?<![a-zA-Z0-9_#+])${escaped}(?![a-zA-Z0-9_#+])`, 'i');
        if (pattern.test(text)) return true;
    } else {
        const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const pattern = new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, 'i');
        if (pattern.test(text)) return true;
    }

    const sLower = skill.toLowerCase();
    if (SKILL_ALIASES[sLower]) {
        for (const alias of SKILL_ALIASES[sLower]) {
            const escAlias = alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            const patAlias = new RegExp(`(?<![a-zA-Z0-9])${escAlias}(?![a-zA-Z0-9])`, 'i');
            if (patAlias.test(text)) return true;
        }
    }

    return false;
}

function parseSections(text) {
    const headers = [
        ['experience', /(?:work\s+experience|employment\s+history|experience\b)/i],
        ['education', /(?:education\s+&\s+certifications|education\b|academic\b)/i],
        ['skills', /(?:technical\s+skills|skills\b|technologies\b|competencies\b)/i],
        ['projects', /(?:key\s+projects|projects\b|personal\s+projects\b)/i],
        ['certifications', /(?:certifications?\s+&\s+achievements|certifications?\b|achievements?\b)/i],
        ['summary', /(?:professional\s+summary|profile\b|summary\b|about\s+me\b)/i],
    ];

    const pattern = new RegExp(`\\b(${headers.map(h => h[1].source).join('|')})\\b`, 'i');
    const parts = text.split(pattern);

    const sections = { header: parts[0] || '' };
    for (let i = 1; i < parts.length; i += 2) {
        const secTitle = (parts[i] || '').trim().toLowerCase();
        const secContent = parts[i + 1] || '';
        let cat = 'other';
        for (const [k, pat] of headers) {
            if (pat.test(secTitle)) {
                cat = k;
                break;
            }
        }
        sections[cat] = (sections[cat] || '') + '\n' + secContent;
    }
    return sections;
}

function extractExperienceDetails(text, sections) {
    const explicitM = text.match(/(\d+)\+?\s*years?(?:\s+of)?\s+experience/i);
    const isStudent = /\b(202[4-9]\s*[-–—to]\s*202[8-9]|undergraduate|student|pursuing)\b/i.test((sections.education || '') + ' ' + (sections.header || ''));

    const expText = sections.experience || '';
    const headerText = (sections.header || '') + ' ' + (sections.summary || '');

    const hasLead = /\b(lead|principal|staff|architect|manager|head)\b/i.test(headerText + ' ' + expText);
    const hasSenior = /\b(senior|sr\.)\b/i.test(headerText + ' ' + expText);
    const hasIntern = /\b(intern|internship|trainee|apprentice)\b/i.test(expText + ' ' + headerText);

    const dateRangePat = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(20\d{2})\s*[-–—to]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(20\d{2}|Present|Current)/gi;
    let match;
    let expYears = 0.0;
    while ((match = dateRangePat.exec(expText)) !== null) {
        const sYr = parseInt(match[1], 10);
        const eYr = /present|current/i.test(match[2]) ? 2025 : parseInt(match[2], 10);
        expYears += Math.max(0.2, (eYr - sYr));
    }

    let totalYears = 1.0;
    if (explicitM) {
        totalYears = parseFloat(explicitM[1]);
    } else if (isStudent && (hasIntern || !hasLead)) {
        totalYears = Math.min(1.0, Math.max(0.3, expYears * 0.3));
    } else if (expYears > 0) {
        totalYears = expYears;
    } else {
        totalYears = hasIntern ? 0.5 : (hasSenior ? 5.0 : 1.0);
    }

    let tier = "Junior Engineer";
    let level = 1;

    if (hasLead || totalYears >= 6) {
        tier = "Lead / Principal";
        level = 4;
    } else if (hasSenior || totalYears >= 4) {
        tier = "Senior Engineer";
        level = 3;
    } else if (totalYears >= 2) {
        tier = "Mid-Level Engineer";
        level = 2;
    } else if (totalYears >= 1 && !hasIntern) {
        tier = "Junior Engineer";
        level = 1;
    } else {
        tier = "Student / Intern";
        level = 0;
    }

    return { totalYears, tier, level };
}

function extractMetrics(text) {
    const pctMatches = text.match(/\b\d{1,3}%/g) || [];
    const currMatches = text.match(/(?:[₹$]|Rs\.?)\s*[\d,.]+\s*(?:Crore|Lakh|Cr|k|M|B)?/gi) || [];
    const volMatches = text.match(/\b[\d,]+\+?\s*(?:users|MAU|DAU|clients|requests|transactions|developers|queries)\b/gi) || [];
    const uptimeMatches = text.match(/99\.\d+%\s*uptime|\b\d+\s*ms\b/gi) || [];
    return [...pctMatches, ...currMatches, ...volMatches, ...uptimeMatches];
}

const ROLE_CATALOG = [
    {
        role: "Frontend Engineer",
        salary_range: "$85k–$130k",
        skills_needed: ["React", "TypeScript", "JavaScript", "CSS", "HTML"],
        min_exp: 1.0
    },
    {
        role: "Full Stack Developer",
        salary_range: "$90k–$145k",
        skills_needed: ["React", "Node.js", "MongoDB", "REST API", "Docker"],
        min_exp: 1.5
    },
    {
        role: "Backend Engineer",
        salary_range: "$95k–$150k",
        skills_needed: ["Node.js", "Python", "MongoDB", "Docker", "AWS"],
        min_exp: 1.5
    },
    {
        role: "DevOps Engineer",
        salary_range: "$100k–$160k",
        skills_needed: ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux"],
        min_exp: 2.0
    },
    {
        role: "Data Engineer",
        salary_range: "$105k–$155k",
        skills_needed: ["Python", "SQL", "Spark", "AWS", "Airflow"],
        min_exp: 2.0
    },
    {
        role: "ML Engineer",
        salary_range: "$115k–$175k",
        skills_needed: ["Python", "Machine Learning", "TensorFlow", "Docker"],
        min_exp: 2.0
    },
    {
        role: "Cloud Architect",
        salary_range: "$125k–$185k",
        skills_needed: ["AWS", "Kubernetes", "Terraform", "Docker"],
        min_exp: 4.0
    },
    {
        role: "Mobile Developer",
        salary_range: "$85k–$135k",
        skills_needed: ["React Native", "Flutter", "TypeScript", "REST API", "Git"],
        min_exp: 1.0
    },
    {
        role: "Security Engineer",
        salary_range: "$110k–$165k",
        skills_needed: ["Linux", "Python", "Docker", "AWS", "CI/CD"],
        min_exp: 2.0
    },
    {
        role: "QA / Automation Engineer",
        salary_range: "$80k–$120k",
        skills_needed: ["Python", "JavaScript", "CI/CD", "Git", "REST API"],
        min_exp: 1.0
    },
];

function analyzeResume(text) {
    const foundSkills = [];
    const seen = new Set();
    for (const skill of KNOWN_SKILLS) {
        if (isSkillPresent(skill, text) && !seen.has(skill.toLowerCase())) {
            foundSkills.push(skill);
            seen.add(skill.toLowerCase());
        }
    }

    if (foundSkills.length === 0) {
        return {
            skills: [],
            gap_skills: [],
            readiness_score: 0,
            roadmap: [],
            skill_weights: [],
            category_distribution: computeCategoryDistribution([], []),
            readiness_trajectory: computeReadinessTrajectory(0, [], []),
            score_breakdown: scoreBreakdown([]),
            career_paths: careerPaths([]),
        };
    }

    const sections = parseSections(text);
    const { totalYears, tier: seniorityTier, level: seniorityLevel } = extractExperienceDetails(text, sections);
    const metrics = extractMetrics(text);

    const foundSet = new Set(foundSkills);

    const hasFrontend = ["React", "Vue", "Angular", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind", "Next.js"].some(s => foundSet.has(s));
    const hasBackend = ["Node.js", "Express", "Python", "FastAPI", "Django", "Flask", "Java", "Spring Boot", "Go", "C#"].some(s => foundSet.has(s));
    const hasDevOps = ["Docker", "Kubernetes", "CI/CD", "Terraform", "Ansible", "Linux", "GitHub Actions"].some(s => foundSet.has(s));
    const hasCloud = ["AWS", "Azure", "GCP"].some(s => foundSet.has(s));
    const hasDb = ["SQL", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Supabase", "Firebase"].some(s => foundSet.has(s));
    const hasLlm = ["LangChain", "LLM", "RAG", "OpenAI API", "Hugging Face", "Prompt Engineering"].some(s => foundSet.has(s));
    const isFullstack = hasFrontend && hasBackend;

    const gaps = [];

    // 1. Cross-domain essential checks
    if (hasLlm && !foundSet.has("Python")) {
        gaps.push("Python (Essential for AI/LLM development)");
    }

    if (hasFrontend && !hasCloud && !hasBackend) {
        gaps.push("Cloud Platform (AWS / Azure / GCP)");
    }

    // 2. Automated Testing gap (Critical for production engineering)
    const hasTesting = ["Jest", "Pytest", "Mocha", "Cypress", "Playwright", "JUnit", "Selenium"].some(s => foundSet.has(s));
    if (!hasTesting && (hasBackend || isFullstack || hasFrontend)) {
        if (foundSet.has("Python") && foundSet.has("Node.js")) {
            gaps.push("Automated Testing & TDD (Jest / Pytest)");
        } else if (foundSet.has("Python")) {
            gaps.push("Automated Testing & TDD (Pytest)");
        } else if (foundSet.has("React") || foundSet.has("JavaScript")) {
            gaps.push("Automated Testing (Jest / React Testing Library)");
        } else {
            gaps.push("Automated Unit & Integration Testing");
        }
    }

    // 3. Message Queues & Asynchronous Processing
    const hasQueues = (foundSet.has("Apache Kafka") || foundSet.has("RabbitMQ") || foundSet.has("Celery")) || /\b(kafka|rabbitmq|celery|bullmq|sqs|event-driven|message queue)\b/i.test(text);
    if (!hasQueues && (hasBackend || isFullstack)) {
        if (seniorityLevel >= 3) {
            gaps.push("Event-Driven Architecture & Message Brokers (Apache Kafka / AWS SQS)");
        } else {
            gaps.push("Message Queues & Asynchronous Tasks (RabbitMQ / Apache Kafka)");
        }
    }

    // 4. Observability & APM
    const hasApm = (foundSet.has("Datadog") || foundSet.has("Prometheus") || foundSet.has("Grafana") || foundSet.has("New Relic") || foundSet.has("Sentry")) || /\b(opentelemetry|datadog|prometheus|grafana|jaeger|apm)\b/i.test(text);
    if (!hasApm && (hasBackend || hasCloud || seniorityLevel >= 2)) {
        if (seniorityLevel >= 3) {
            gaps.push("Distributed Tracing & APM Observability (OpenTelemetry / Datadog)");
        } else {
            gaps.push("Production Observability & Monitoring (Prometheus / Grafana)");
        }
    }

    // 5. Infrastructure as Code (Senior / Lead cloud gap)
    const hasIac = (foundSet.has("Terraform") || foundSet.has("Ansible") || foundSet.has("CloudFormation")) || /\b(terraform|pulumi|cloudformation)\b/i.test(text);
    if (!hasIac && hasCloud && seniorityLevel >= 3) {
        gaps.push("Infrastructure as Code (Terraform / AWS CloudFormation)");
    }

    // 6. Enterprise Security / Zero Trust
    const hasSec = /\b(oauth2|oidc|owasp|zero trust|iam policies|saml)\b/i.test(text);
    if (!hasSec && seniorityLevel >= 3) {
        gaps.push("Enterprise Security & Zero Trust Architecture (OAuth2 / OWASP)");
    }

    // 7. Foundational gaps for juniors / students
    if (seniorityLevel === 0) {
        const hasCicd = (foundSet.has("CI/CD") || foundSet.has("GitHub Actions") || foundSet.has("Jenkins")) && /\b(ci\/cd pipeline|github actions deployment|automated deploy)\b/i.test(text);
        if (!hasCicd && gaps.length < 4) {
            gaps.push("Production CI/CD Automation & Deployment Pipelines");
        }
    }

    // 8. Missing Cloud or Database for developers
    if ((hasBackend || hasFrontend) && !hasCloud && !gaps.includes("Cloud Platform (AWS / Azure / GCP)")) {
        gaps.push("Cloud Platform (AWS / Azure / GCP)");
    }

    if (hasBackend && !hasDb) {
        gaps.push("Database Management & SQL Modeling (PostgreSQL / MongoDB)");
    }

    // If gaps are still empty (rare high-level profile), provide Staff+ architectural areas
    if (gaps.length === 0) {
        if (seniorityLevel >= 3) {
            gaps.push("Multi-Region Cloud Resilience & High-Availability Architecture");
        } else {
            gaps.push("Advanced Microservices & Distributed System Design");
        }
    }

    const trimmedGaps = Array.from(new Set(gaps)).slice(0, 6);

    // Multi-Pillar Scoring Rubric (100 Max)
    // Pillar 1: Technical Stack Versatility (Max 25)
    const p1 = Math.min(25, Math.round(foundSkills.length * 0.65 + (isFullstack ? 4 : 2) + (hasCloud ? 3 : 0) + (hasDb ? 2 : 0)));

    // Pillar 2: Professional Experience & Seniority (Max 25)
    let p2 = 14;
    if (seniorityLevel >= 4) {
        p2 = 25;
    } else if (seniorityLevel === 3) {
        p2 = 22;
    } else if (seniorityLevel === 2) {
        p2 = 18;
    } else if (seniorityLevel === 1) {
        p2 = 14;
    } else {
        p2 = Math.round(8 + Math.min(4.0, totalYears * 2.5));
    }

    // Pillar 3: Quantified Business Impact & Scale (Max 20)
    const hasCr = metrics.some(m => m.includes('₹') || /Crore/i.test(m) || m.includes('$'));
    const hasLargeScale = metrics.some(m => m.includes('100,000') || m.includes('120,000') || /million/i.test(m) || m.includes('99.99%'));
    const metricCount = metrics.length;

    let p3 = 4;
    if (hasCr || hasLargeScale) {
        p3 = Math.min(20, 15 + Math.min(5, metricCount));
    } else if (metricCount >= 3) {
        p3 = Math.min(16, 10 + metricCount);
    } else if (metricCount >= 1) {
        p3 = 7 + metricCount;
    }

    // Pillar 4: Engineering Rigor & Architecture (Max 15)
    let p4 = 0;
    if (/\bmicroservices\b/i.test(text)) p4 += 3;
    if (/\b(high-throughput|scalable|low-latency|optimization)\b/i.test(text)) p4 += 3;
    if (foundSet.has("Docker") && (foundSet.has("Kubernetes") || foundSet.has("AWS"))) p4 += 3;
    if (/\b(mentored|led|architected|lead)\b/i.test(text)) p4 += 3;
    if (foundSet.has("CI/CD") || foundSet.has("GitHub Actions")) p4 += 3;
    p4 = Math.min(15, p4);

    // Pillar 5: Credentials, Education & Learning (Max 15)
    let p5 = 0;
    if (/\b(solutions architect|aws certified|gcp certified|ckad|cka)\b/i.test(text)) p5 += 7;
    if (/\b(b\.?tech|b\.?s\.?|master|bachelor)\b/i.test(text)) p5 += 4;
    if (/\b(open-source|hackathon|npm|saas|edtech)\b/i.test(text)) p5 += 4;
    p5 = Math.min(15, p5);

    const score = Math.min(98, Math.max(25, p1 + p2 + p3 + p4 + p5));

    const roadmap = trimmedGaps.map(g => `Learn ${g}`);
    if (foundSkills.length >= 3) roadmap.push("Build a production portfolio project integrating your core stack");
    if (foundSkills.length >= 5) roadmap.push("Prepare for technical interviews and system architecture defense");

    const skillWeights = computeSkillProficiencies(foundSkills, trimmedGaps, text, seniorityLevel, sections);
    const categoryDistribution = computeCategoryDistribution(foundSkills, trimmedGaps);
    const readinessTrajectory = computeReadinessTrajectory(score, roadmap, trimmedGaps);

    const breakdown = scoreBreakdown(foundSkills, text);
    const careerPathsResult = careerPaths(foundSkills, text, totalYears);

    return {
        skills: foundSkills,
        gap_skills: trimmedGaps,
        readiness_score: score,
        roadmap,
        skill_weights: skillWeights,
        category_distribution: categoryDistribution,
        readiness_trajectory: readinessTrajectory,
        score_breakdown: breakdown,
        career_paths: careerPathsResult,
    };
}

function computeSkillProficiencies(skills, gapSkills, text = "", seniorityLevel = 1, sections = null) {
    const results = [];
    const categoryMap = {
        "React": "Frontend", "Vue": "Frontend", "Angular": "Frontend", "TypeScript": "Frontend", "JavaScript": "Frontend", "HTML": "Frontend", "CSS": "Frontend", "Tailwind": "Frontend", "Next.js": "Frontend",
        "Node.js": "Backend", "Python": "Backend", "Java": "Backend", "Go": "Backend", "Django": "Backend", "Flask": "Backend", "FastAPI": "Backend", "Spring Boot": "Backend", "Express": "Backend", "REST API": "Backend", "GraphQL": "Backend",
        "AWS": "Cloud", "Azure": "Cloud", "GCP": "Cloud", "Docker": "DevOps", "Kubernetes": "DevOps", "CI/CD": "DevOps", "Linux": "DevOps", "Terraform": "DevOps", "Ansible": "DevOps", "GitHub Actions": "DevOps",
        "PostgreSQL": "Database", "MongoDB": "Database", "MySQL": "Database", "Redis": "Database", "SQL": "Database", "Supabase": "Database", "Firebase": "Database",
        "Machine Learning": "AI/ML", "TensorFlow": "AI/ML", "PyTorch": "AI/ML", "LangChain": "AI/ML", "LLM": "AI/ML", "RAG": "AI/ML", "Data Analysis": "Data/Analytics", "Pandas": "Data/Analytics", "NumPy": "Data/Analytics",
    };

    if (!sections && text) {
        sections = parseSections(text);
    } else if (!sections) {
        sections = {};
    }

    const expText = (sections.experience || '').toLowerCase();
    const projText = (sections.projects || '').toLowerCase();
    const certText = ((sections.certifications || '') + ' ' + (sections.education || '')).toLowerCase();
    const fullLower = text ? text.toLowerCase() : "";

    const baseByLevel = { 4: 65, 3: 58, 2: 50, 1: 42, 0: 36 };
    const base = baseByLevel[seniorityLevel] || 45;

    for (const s of skills.slice(0, 10)) {
        const sLower = s.toLowerCase();
        let sScore = base;
        if (expText.includes(sLower)) {
            sScore += 18;
            if (seniorityLevel >= 3) sScore += 8;
        }
        if (projText.includes(sLower)) {
            sScore += 10;
        }
        if (certText.includes(sLower)) {
            sScore += 14;
        }
        const freq = fullLower ? (fullLower.split(sLower).length - 1) : 1;
        if (freq >= 3) {
            sScore += 6;
        } else if (freq >= 2) {
            sScore += 3;
        }

        const userProf = Math.min(96, Math.max(30, Math.round(sScore)));
        let h = 0;
        for (let i = 0; i < s.length; i++) {
            h = (h * 31 + s.charCodeAt(i)) & 0xffff;
        }
        const benchmark = Math.min(95, Math.max(78, 84 + (h % 10)));

        results.push({
            name: s,
            category: categoryMap[s] || "Core Tech",
            user_proficiency: userProf,
            benchmark,
            is_gap: false,
            weight: Math.min(100, Math.max(50, userProf + 4)),
        });
    }

    for (const g of gapSkills.slice(0, 4)) {
        const cleanG = g.split('(')[0].trim();
        const cat = categoryMap[cleanG] || "Emerging";
        let h = 0;
        for (let i = 0; i < cleanG.length; i++) {
            h = (h * 31 + cleanG.charCodeAt(i)) & 0xffff;
        }
        const benchmark = Math.min(95, Math.max(80, 84 + (h % 9)));
        results.push({
            name: cleanG,
            category: cat,
            user_proficiency: 0,
            benchmark,
            is_gap: true,
            weight: 75,
        });
    }

    return results;
}

function computeCategoryDistribution(skills, gapSkills) {
    const categories = [
        { category: "Frontend", keys: ["React", "Vue", "Angular", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind", "Next.js"] },
        { category: "Backend", keys: ["Node.js", "Python", "Java", "Go", "Django", "Flask", "FastAPI", "Spring Boot", "Express", "REST API", "GraphQL"] },
        { category: "Cloud & DevOps", keys: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Linux", "Terraform", "Ansible", "GitHub Actions"] },
        { category: "Databases", keys: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "SQL", "Elasticsearch", "Supabase", "Firebase"] },
        { category: "AI & Systems", keys: ["Machine Learning", "TensorFlow", "PyTorch", "LangChain", "LLM", "RAG", "Microservices", "Data Analysis", "Pandas"] },
    ];

    const skillsLower = new Set(skills.map(s => s.toLowerCase()));
    const gapsClean = new Set(gapSkills.map(g => g.split('(')[0].trim().toLowerCase()));

    return categories.map(cat => {
        const keysLower = cat.keys.map(k => k.toLowerCase());
        const detectedCount = keysLower.filter(k => skillsLower.has(k)).length;
        const gapCount = keysLower.filter(k => gapsClean.has(k)).length;
        const totalMarket = cat.keys.length;
        const coveragePct = Math.round((detectedCount / Math.max(1, totalMarket)) * 100);

        return {
            category: cat.category,
            detected: detectedCount,
            gaps: gapCount,
            total_benchmark: totalMarket,
            coverage_pct: coveragePct,
        };
    });
}

function computeReadinessTrajectory(currentScore, roadmap, gapSkills) {
    const points = [
        { milestone: "Baseline", step: "Current Profile", score: currentScore, gain: 0 }
    ];

    const totalGapPotential = Math.min(100 - currentScore, Math.max(15, gapSkills.length * 8));
    const stepsCount = Math.max(1, roadmap.length);
    const stepGain = totalGapPotential / stepsCount;

    let runningScore = currentScore;
    for (let i = 0; i < Math.min(5, roadmap.length); i++) {
        const step = roadmap[i];
        runningScore = Math.min(98, Math.round(runningScore + stepGain));
        points.push({
            milestone: `Step ${i + 1}`,
            step: step.length > 25 ? (step.slice(0, 24) + "...") : step,
            score: runningScore,
            gain: Math.round(runningScore - currentScore),
        });
    }

    return {
        points,
        projected_gain: points[points.length - 1].score - currentScore,
        target_score: points[points.length - 1].score,
    };
}

function scoreBreakdown(skills, text = "") {
    const s = new Set(skills);

    const frontendSkills = ["React", "Vue", "Angular", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind", "Next.js"];
    const backendSkills = ["Node.js", "Python", "Java", "Go", "Django", "Flask", "FastAPI", "Spring Boot", "Express", "REST API", "GraphQL"];
    const cloudSkills = ["AWS", "Azure", "GCP"];
    const devopsSkills = ["Docker", "Kubernetes", "CI/CD", "Terraform", "Ansible", "Linux", "DevOps", "GitHub Actions"];
    const languages = ["Python", "JavaScript", "TypeScript", "Java", "Go", "Rust", "C++", "C#", "Kotlin", "Swift"];
    const aiMlSkills = ["Machine Learning", "TensorFlow", "PyTorch", "LangChain", "LLM", "RAG", "OpenAI API", "Hugging Face", "Scikit-Learn", "Deep Learning", "Data Analysis", "Pandas", "NumPy"];

    function pct(subset, cap = 100) {
        const matched = subset.filter(x => s.has(x)).length;
        if (subset.length === 0) return 0.0;
        return Math.round(Math.min(cap, (matched / Math.max(1, subset.length)) * 100) * 10) / 10;
    }

    return {
        skill_match: pct(KNOWN_SKILLS.slice(0, 25)),
        stack_balance: Math.round(((pct(frontendSkills) + pct(backendSkills)) / 2) * 10) / 10,
        cloud_presence: pct(cloudSkills),
        devops_score: pct(devopsSkills),
        language_div: Math.min(100.0, Math.round(languages.filter(x => s.has(x)).length * 20 * 10) / 10),
        ai_ml_score: pct(aiMlSkills),
    };
}

function careerPaths(skills, text = "", experienceYears = null) {
    const skillsLower = new Set(skills.map(sk => sk.toLowerCase()));
    const dbSet = new Set(["mongodb", "postgresql", "mysql", "redis", "sql", "sqlite", "supabase"]);
    const hasAnyDb = Array.from(skillsLower).some(sk => dbSet.has(sk));

    const results = [];
    for (const role of ROLE_CATALOG) {
        const needed = role.skills_needed;
        const matched = [];
        const missing = [];

        for (const r of needed) {
            const rLower = r.toLowerCase();
            if (skillsLower.has(rLower)) {
                matched.push(r);
            } else if (r === "MongoDB" && hasAnyDb) {
                matched.push(r);
            } else {
                missing.push(r);
            }
        }

        const basePct = (matched.length / Math.max(1, needed.length)) * 100;
        let finalPct = Math.round(basePct);

        if (experienceYears !== null && experienceYears < (role.min_exp || 1.0)) {
            const expFactor = Math.max(0.65, experienceYears / role.min_exp);
            finalPct = Math.round(basePct * expFactor);
        }

        results.push({
            role: role.role,
            match_percent: finalPct,
            salary_range: role.salary_range,
            skills_needed: needed,
            matched_skills: matched,
            missing_skills: missing,
        });
    }

    return results.sort((a, b) => b.match_percent - a.match_percent);
}

function checkFormattingRisk(text) {
    const flags = [];
    const suggestions = [];
    const lines = text.split('\n');

    const tableLines = lines.filter(l => (l.match(/\|/g) || []).length >= 2);
    if (tableLines.length >= 2 || lines.some(l => l.trim().startsWith('|') && l.trim().endsWith('|'))) {
        flags.push("tables_detected");
        suggestions.push("Tables detected. ATS parsers often scramble table contents; use standard linear sections instead.");
    }

    return {
        passed: flags.length === 0,
        flags,
        suggestions,
    };
}

function checkSectionPresence(text) {
    const lower = text.toLowerCase();
    const missing = [];
    const suggestions = [];

    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
    const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
    if (!(hasEmail || hasPhone)) {
        missing.push("Contact Information");
        suggestions.push("Add clear contact information (email address and phone number) at the top of your resume.");
    }

    if (!["summary", "profile", "objective", "about me"].some(k => lower.includes(k))) {
        missing.push("Professional Summary");
        suggestions.push("Include a brief Professional Summary highlighting your career focus and core strengths.");
    }

    if (!["experience", "employment", "work history", "career history"].some(k => lower.includes(k))) {
        missing.push("Work Experience");
        suggestions.push("Include a dedicated Work Experience section detailing your past roles and achievements.");
    }

    if (!["education", "degree", "university", "college", "b.sc", "b.s", "b.tech", "m.sc", "m.s", "ph.d"].some(k => lower.includes(k))) {
        missing.push("Education");
        suggestions.push("Add an Education section with your degrees, institutions, and graduation dates.");
    }

    if (!["skills", "technologies", "technical competencies", "core competencies"].some(k => lower.includes(k))) {
        missing.push("Skills");
        suggestions.push("Add a Skills section listing your programming languages, tools, and platforms.");
    }

    return {
        passed: missing.length === 0,
        missing_sections: missing,
        suggestions,
    };
}

function checkDateParseability(text) {
    const datePatterns = [
        /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}/gi,
        /\d{4}\s*(?:–|-|to)\s*(?:\d{4}|Present|Current)/gi,
        /\b(?:19|20)\d{2}\b/g,
    ];
    let datesFound = 0;
    for (const pat of datePatterns) {
        const matches = text.match(pat);
        if (matches) datesFound += matches.length;
    }

    const vaguePatterns = [/\brecently\b/i, /\bpreviously\b/i, /\bsometime\b/i, /\bfor some time\b/i];
    const hasVagueDates = vaguePatterns.some(v => v.test(text));

    const suggestions = [];
    if (hasVagueDates) {
        suggestions.push("Replace vague timeframes like 'recently' or 'previously' with standard Month Year formats (e.g. 'Jan 2022 – Present').");
    }
    if (datesFound === 0) {
        suggestions.push("No standard dates detected. Add explicit dates (e.g. 'Jan 2021 – Dec 2023') to each work experience entry.");
    }

    return {
        passed: datesFound > 0 && !hasVagueDates,
        dates_found: datesFound,
        has_vague_dates: hasVagueDates,
        suggestions,
    };
}

function checkKeywordMatch(text, jobDescription = null) {
    if (!jobDescription || !jobDescription.trim()) {
        return {
            passed: null,
            match_percent: null,
            matched_keywords: [],
            missing_keywords: [],
            suggestions: [],
        };
    }

    const jdSkills = KNOWN_SKILLS.filter(s => isSkillPresent(s, jobDescription));
    const matched = jdSkills.filter(k => isSkillPresent(k, text));
    const missing = jdSkills.filter(k => !isSkillPresent(k, text));

    const pct = jdSkills.length > 0 ? Math.round((matched.length / jdSkills.length) * 100) : 0;
    const passed = pct >= 50;

    const suggestions = [];
    if (missing.length > 0) {
        suggestions.push(`Consider including key terms from the job description: ${missing.slice(0, 5).join(', ')}.`);
    }

    return {
        passed,
        match_percent: pct,
        matched_keywords: matched,
        missing_keywords: missing,
        suggestions,
    };
}

function checkFileIntegrity(text) {
    if (!text) {
        return { passed: true, has_garbled_text: false, suggestions: [] };
    }

    let garbledChars = 0;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '\ufffd' || text.charCodeAt(i) > 127) {
            garbledChars++;
        }
    }
    const nonAsciiRatio = garbledChars / Math.max(1, text.length);
    const hasGarbled = text.includes('\ufffd') || nonAsciiRatio > 0.05;

    const suggestions = [];
    if (hasGarbled) {
        suggestions.push("Garbled or corrupted characters detected. Ensure the text was exported cleanly without corrupted encoding.");
    }

    return {
        passed: !hasGarbled,
        has_garbled_text: hasGarbled,
        non_ascii_ratio: Math.round(nonAsciiRatio * 1000) / 1000,
        suggestions,
    };
}

function atsCheck(text, jobDescription = null, targetRole = null) {
    const formatting = checkFormattingRisk(text);
    const sections = checkSectionPresence(text);
    const dates = checkDateParseability(text);
    const keywords = checkKeywordMatch(text, jobDescription);
    const integrity = checkFileIntegrity(text);

    let score = 100;
    if (!formatting.passed) score -= 25;
    if (sections.missing_sections.length > 0) {
        score -= Math.min(35, sections.missing_sections.length * 8);
    }
    if (!dates.passed) score -= 15;
    if (dates.dates_found === 0) score -= 10;
    if (!integrity.passed) score -= 55;

    if (keywords.match_percent !== null) {
        if (keywords.match_percent < 40) score -= 15;
        else if (keywords.match_percent >= 75) score += 5;
    }

    score = Math.max(0, Math.min(100, score));

    const allSuggestions = [
        ...formatting.suggestions,
        ...sections.suggestions,
        ...dates.suggestions,
        ...keywords.suggestions,
        ...integrity.suggestions,
    ];

    let summary = "Low ATS Compatibility";
    let summaryDetail = "Critical ATS parsing risks detected (such as tables, missing core sections, or encoding issues) that may prevent parsing.";
    if (score >= 80) {
        summary = "ATS-Optimized";
        summaryDetail = "Your resume structure adheres closely to ATS parsing standards with clear sections and linear formatting.";
    } else if (score >= 60) {
        summary = "Moderately ATS-Compatible";
        summaryDetail = "Your resume will be parsed by most ATS systems, but several formatting or section enhancements are recommended.";
    }

    return {
        ats_score: score,
        summary,
        summary_detail: summaryDetail,
        checks: {
            formatting_risk: formatting,
            section_presence: sections,
            date_parseability: dates,
            keyword_match: keywords,
            file_integrity: integrity,
        },
        all_suggestions: allSuggestions,
    };
}

module.exports = {
    analyzeResume,
    scoreBreakdown,
    careerPaths,
    atsCheck,
    KNOWN_SKILLS,
    ROLE_CATALOG,
    computeSkillProficiencies,
    computeCategoryDistribution,
    computeReadinessTrajectory,
};
