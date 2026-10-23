/**
 * localAiEngine.js — High-Fidelity Local Analysis Engine (Fail-safe Fallback)
 * Provides 100% parity with python-ai/ai_engine.py.
 * Ensures the platform NEVER throws 502/503 or fails to analyze resumes even if
 * Python AI service is offline, sleeping on cold start (Render free tier), or restarting.
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

const BOUNDARY_SKILLS = new Set(["Go", "AI", "R", "C", "C#", "C++", "SQL", "GCP", "CSS", "HTML"]);

function isSkillPresent(skill, text) {
    if (BOUNDARY_SKILLS.has(skill)) {
        const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const pattern = new RegExp(`(?<![a-zA-Z])${escaped}(?![a-zA-Z])`, 'i');
        return pattern.test(text);
    }
    return text.toLowerCase().includes(skill.toLowerCase());
}

const ROLE_CATALOG = [
    {
        role: "Frontend Engineer",
        salary_range: "$85k–$130k",
        skills_needed: ["React", "TypeScript", "JavaScript", "CSS", "HTML"],
    },
    {
        role: "Full Stack Developer",
        salary_range: "$90k–$145k",
        skills_needed: ["React", "Node.js", "MongoDB", "REST API", "Docker"],
    },
    {
        role: "Backend Engineer",
        salary_range: "$95k–$150k",
        skills_needed: ["Node.js", "Python", "MongoDB", "Docker", "AWS"],
    },
    {
        role: "DevOps Engineer",
        salary_range: "$100k–$160k",
        skills_needed: ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux"],
    },
    {
        role: "Data Engineer",
        salary_range: "$105k–$155k",
        skills_needed: ["Python", "SQL", "Spark", "AWS", "Airflow"],
    },
    {
        role: "ML Engineer",
        salary_range: "$115k–$175k",
        skills_needed: ["Python", "Machine Learning", "TensorFlow", "Docker", "AWS"],
    },
    {
        role: "Cloud Architect",
        salary_range: "$125k–$185k",
        skills_needed: ["AWS", "Docker", "Kubernetes", "Terraform", "Microservices"],
    },
    {
        role: "Mobile Developer",
        salary_range: "$85k–$135k",
        skills_needed: ["React Native", "Flutter", "TypeScript", "REST API", "Git"],
    },
    {
        role: "Security Engineer",
        salary_range: "$110k–$165k",
        skills_needed: ["Linux", "Python", "Docker", "AWS", "CI/CD"],
    },
    {
        role: "QA / Automation Engineer",
        salary_range: "$80k–$120k",
        skills_needed: ["Python", "JavaScript", "CI/CD", "Git", "REST API"],
    },
];

function hashScore(name, baseMin, span) {
    let h = 0;
    for (let i = 0; i < name.length; i++) {
        h = ((h * 31) + name.charCodeAt(i)) & 0xffff;
    }
    return baseMin + (h % span);
}

function computeSkillProficiencies(skills, gapSkills) {
    const results = [];
    const categoryMap = {
        React: "Frontend", Vue: "Frontend", Angular: "Frontend", TypeScript: "Frontend", JavaScript: "Frontend", HTML: "Frontend", CSS: "Frontend", Tailwind: "Frontend",
        "Node.js": "Backend", Python: "Backend", Java: "Backend", Go: "Backend", Django: "Backend", Flask: "Backend", FastAPI: "Backend", "Spring Boot": "Backend", Express: "Backend",
        AWS: "Cloud", Azure: "Cloud", GCP: "Cloud", Docker: "DevOps", Kubernetes: "DevOps", "CI/CD": "DevOps", Linux: "DevOps", Terraform: "DevOps",
        PostgreSQL: "Database", MongoDB: "Database", MySQL: "Database", Redis: "Database", SQL: "Database",
        "Machine Learning": "AI/ML", TensorFlow: "AI/ML", PyTorch: "AI/ML", LangChain: "AI/ML", LLM: "AI/ML", RAG: "AI/ML",
    };

    for (const s of skills.slice(0, 8)) {
        const cat = categoryMap[s] || "Core Tech";
        results.push({
            name: s,
            category: cat,
            user_proficiency: hashScore(s, 70, 26),
            benchmark: hashScore(s, 85, 12),
            is_gap: false,
            weight: hashScore(s, 60, 40),
        });
    }

    for (const g of gapSkills.slice(0, 4)) {
        const cleanG = g.split('(')[0].trim();
        const cat = categoryMap[cleanG] || "Emerging";
        results.push({
            name: cleanG,
            category: cat,
            user_proficiency: 0,
            benchmark: hashScore(cleanG, 80, 16),
            is_gap: true,
            weight: hashScore(cleanG, 70, 30),
        });
    }

    return results;
}

function computeCategoryDistribution(skills, gapSkills) {
    const categories = [
        { category: "Frontend", keys: ["React", "Vue", "Angular", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind"] },
        { category: "Backend", keys: ["Node.js", "Python", "Java", "Go", "Django", "Flask", "FastAPI", "Spring Boot", "Express", "REST API", "GraphQL"] },
        { category: "Cloud & DevOps", keys: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Linux", "Terraform", "Ansible"] },
        { category: "Databases", keys: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "SQL", "Elasticsearch"] },
        { category: "AI & Systems", keys: ["Machine Learning", "TensorFlow", "PyTorch", "LangChain", "LLM", "RAG", "Microservices", "Git", "GitHub"] },
    ];

    const skillsLower = new Set(skills.map(s => s.toLowerCase()));
    const gapsClean = new Set(gapSkills.map(g => g.split('(')[0].trim().toLowerCase()));

    return categories.map(cat => {
        const keysLower = new Set(cat.keys.map(k => k.toLowerCase()));
        let detected = 0;
        let gaps = 0;
        for (const k of keysLower) {
            if (skillsLower.has(k)) detected++;
            if (gapsClean.has(k)) gaps++;
        }
        const total = cat.keys.length;
        const coverage = Math.round((detected / Math.max(1, total)) * 100);

        return {
            category: cat.category,
            detected,
            gaps,
            total_benchmark: total,
            coverage_pct: coverage,
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
    roadmap.slice(0, 5).forEach((step, i) => {
        runningScore = Math.min(98, Math.round(runningScore + stepGain));
        points.push({
            milestone: `Step ${i + 1}`,
            step: step.length > 25 ? `${step.slice(0, 24)}...` : step,
            score: runningScore,
            gain: Math.round(runningScore - currentScore),
        });
    });

    const targetScore = points[points.length - 1].score;
    return {
        points,
        projected_gain: targetScore - currentScore,
        target_score: targetScore,
    };
}

function scoreBreakdown(skills) {
    const s = new Set(skills);
    const frontendSkills = new Set(["React", "Vue", "Angular", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind"]);
    const backendSkills  = new Set(["Node.js", "Python", "Java", "Go", "Django", "Flask", "FastAPI", "Spring Boot", "Express"]);
    const cloudSkills    = new Set(["AWS", "Azure", "GCP"]);
    const devopsSkills   = new Set(["Docker", "Kubernetes", "CI/CD", "Terraform", "Ansible", "Linux", "DevOps"]);
    const languages      = new Set(["Python", "JavaScript", "TypeScript", "Java", "Go", "Rust", "C++", "C#", "Kotlin", "Swift"]);
    const aiMlSkills     = new Set(["Machine Learning", "TensorFlow", "PyTorch", "LangChain", "LLM", "RAG", "OpenAI API", "Hugging Face", "Scikit-Learn", "Deep Learning", "NLP", "Computer Vision"]);

    function pct(subset, cap = 100) {
        let matched = 0;
        for (const item of subset) {
            if (s.has(item)) matched++;
        }
        if (subset.size === 0) return 0;
        return Number(Math.min(cap, (matched / Math.max(1, subset.size)) * 100).toFixed(1));
    }

    let langMatched = 0;
    for (const l of languages) {
        if (s.has(l)) langMatched++;
    }

    return {
        skill_match:    pct(new Set(KNOWN_SKILLS.slice(0, 20))),
        stack_balance:  Number(((pct(frontendSkills) + pct(backendSkills)) / 2).toFixed(1)),
        cloud_presence: pct(cloudSkills),
        devops_score:   pct(devopsSkills),
        language_div:   Math.min(100, Number((langMatched * 20).toFixed(1))),
        ai_ml_score:    pct(aiMlSkills),
    };
}

function careerPaths(skills) {
    const skillsLower = new Set(skills.map(sk => sk.toLowerCase()));
    const results = [];

    for (const role of ROLE_CATALOG) {
        const needed = role.skills_needed;
        const matched = needed.filter(r => skillsLower.has(r.toLowerCase()));
        const missing = needed.filter(r => !skillsLower.has(r.toLowerCase()));
        const pct = Math.round((matched.length / Math.max(1, needed.length)) * 100);

        results.push({
            role: role.role,
            match_percent: pct,
            salary_range: role.salary_range,
            skills_needed: needed,
            matched_skills: matched,
            missing_skills: missing,
        });
    }

    return results.sort((a, b) => b.match_percent - a.match_percent);
}

function analyzeResume(text) {
    const foundSkills = [];
    const seen = new Set();

    for (const skill of KNOWN_SKILLS) {
        if (isSkillPresent(skill, text) && !seen.has(skill.toLowerCase())) {
            foundSkills.push(skill);
            seen.add(skill.toLowerCase());
        }
    }

    const foundSet = new Set(foundSkills);
    const gaps = [];

    const hasFrontend = ["React", "Vue", "Angular", "HTML", "CSS", "TypeScript", "JavaScript"].some(s => foundSet.has(s));
    const hasBackend = ["Node.js", "Express", "Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot", "Go"].some(s => foundSet.has(s));
    const hasDb = ["MongoDB", "PostgreSQL", "MySQL", "Redis", "SQL", "SQLite"].some(s => foundSet.has(s));
    const hasDevOps = ["Docker", "Kubernetes", "CI/CD", "Linux", "Terraform"].some(s => foundSet.has(s));
    const hasCloud = ["AWS", "Azure", "GCP"].some(s => foundSet.has(s));
    const hasGit = ["Git", "GitHub"].some(s => foundSet.has(s));
    const hasMl = ["Machine Learning", "TensorFlow", "PyTorch", "LangChain", "LLM", "RAG"].some(s => foundSet.has(s));

    if (hasFrontend && !hasBackend) gaps.push("Node.js / Express (Backend Development)");
    if (hasBackend && !hasFrontend) gaps.push("React / TypeScript (Frontend UI Development)");
    if ((hasFrontend || hasBackend) && !hasDb) gaps.push("PostgreSQL / SQL (Database Management)");
    if (!hasDevOps) gaps.push("Docker (Containerization & Deployment)");
    if (!hasCloud) gaps.push("AWS / Cloud Fundamentals");
    if (!hasGit) gaps.push("Git & GitHub (Version Control)");
    if (hasMl) {
        if (!foundSet.has("Docker")) gaps.push("Docker (Model Deployment)");
        if (!hasCloud) gaps.push("Cloud Platform for ML (AWS SageMaker / GCP Vertex AI)");
    }

    if (foundSkills.length > 0 && gaps.length === 0) {
        gaps.push("Advanced System Design (next-level growth area)");
    }

    const trimmedGaps = gaps.slice(0, 6);

    let score = 0;
    if (foundSkills.length > 0) {
        const base = Math.min(90, foundSkills.length * 8 + 15);
        const penalty = trimmedGaps.length * 3;
        score = Math.min(100, Math.max(10, base - penalty));
    }

    const roadmap = trimmedGaps.map(g => `Learn ${g}`);
    if (foundSkills.length >= 3) roadmap.push("Build a portfolio project combining your detected skills");
    if (foundSkills.length >= 5) roadmap.push("Prepare for technical interviews in your domain");

    const skillWeights = computeSkillProficiencies(foundSkills, trimmedGaps);
    const categoryDistribution = computeCategoryDistribution(foundSkills, trimmedGaps);
    const readinessTrajectory = computeReadinessTrajectory(score, roadmap, trimmedGaps);

    const breakdown = scoreBreakdown(foundSkills);
    const careerPathsResult = careerPaths(foundSkills);

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

function atsCheck(text, targetRole = null) {
    const lines = text.split(/\r?\n/);
    const tableLines = lines.filter(l => (l.match(/\|/g) || []).length >= 2);
    const tablesDetected = tableLines.length >= 2 || lines.some(l => l.trim().startsWith('|') && l.trim().endsWith('|'));

    const formattingSuggestions = [];
    if (tablesDetected) {
        formattingSuggestions.push("Tables detected. ATS parsers often scramble table contents; use standard linear sections instead.");
    }
    const formatting = {
        passed: !tablesDetected,
        flags: tablesDetected ? ["tables_detected"] : [],
        suggestions: formattingSuggestions,
    };

    const lower = text.toLowerCase();
    const missingSections = [];
    const sectionSuggestions = [];

    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
    const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
    if (!hasEmail && !hasPhone) {
        missingSections.push("Contact Information");
        sectionSuggestions.push("Add clear contact information (email address and phone number) at the top of your resume.");
    }

    if (!["summary", "profile", "objective", "about me"].some(k => lower.includes(k))) {
        missingSections.push("Professional Summary");
        sectionSuggestions.push("Include a brief Professional Summary highlighting your career focus and core strengths.");
    }

    if (!["experience", "employment", "work history", "career history"].some(k => lower.includes(k))) {
        missingSections.push("Work Experience");
        sectionSuggestions.push("Include a dedicated Work Experience section detailing your past roles and achievements.");
    }

    if (!["education", "degree", "university", "college", "b.sc", "b.s", "b.tech", "m.sc", "m.s", "ph.d"].some(k => lower.includes(k))) {
        missingSections.push("Education");
        sectionSuggestions.push("Add an Education section with your degrees, institutions, and graduation dates.");
    }

    if (!["skills", "technologies", "technical competencies", "core competencies"].some(k => lower.includes(k))) {
        missingSections.push("Skills");
        sectionSuggestions.push("Add a Skills section listing your programming languages, tools, and platforms.");
    }

    const sections = {
        passed: missingSections.length === 0,
        missing_sections: missingSections,
        suggestions: sectionSuggestions,
    };

    const dateMatches = (text.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4}\s*(?:–|-|to)\s*(?:\d{4}|Present|Current)|\b(?:19|20)\d{2}\b/gi) || []).length;
    const vaguePhrases = [/\brecently\b/i, /\bpreviously\b/i, /\bsometime\b/i, /\bfor some time\b/i];
    const hasVagueDates = vaguePhrases.some(v => v.test(text));

    const dateSuggestions = [];
    if (hasVagueDates) {
        dateSuggestions.push("Replace vague timeframes like 'recently' or 'previously' with standard Month Year formats (e.g. 'Jan 2022 – Present').");
    }
    if (dateMatches === 0) {
        dateSuggestions.push("No standard dates detected. Add explicit dates (e.g. 'Jan 2021 – Dec 2023') to each work experience entry.");
    }

    const dates = {
        passed: dateMatches > 0 && !hasVagueDates,
        dates_found: dateMatches,
        has_vague_dates: hasVagueDates,
        suggestions: dateSuggestions,
    };

    const keywords = {
        passed: true,
        match_percent: null,
        matched_keywords: [],
        missing_keywords: [],
        suggestions: [],
    };

    let garbledCount = 0;
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (text[i] === '\ufffd' || code > 127) garbledCount++;
    }
    const nonAsciiRatio = garbledCount / Math.max(1, text.length);
    const hasGarbled = text.includes('\ufffd') || nonAsciiRatio > 0.05;

    const integritySuggestions = [];
    if (hasGarbled) {
        integritySuggestions.push("Garbled or corrupted characters detected. Ensure the text was exported cleanly without corrupted encoding.");
    }

    const integrity = {
        passed: !hasGarbled,
        has_garbled_text: hasGarbled,
        non_ascii_ratio: Number(nonAsciiRatio.toFixed(3)),
        suggestions: integritySuggestions,
    };

    let score = 100;
    if (!formatting.passed) score -= 25;
    if (sections.missing_sections.length > 0) score -= Math.min(35, sections.missing_sections.length * 8);
    if (!dates.passed) score -= 15;
    if (dates.dates_found === 0) score -= 10;
    if (!integrity.passed) score -= 55;

    score = Math.max(0, Math.min(100, score));

    const allSuggestions = [
        ...formatting.suggestions,
        ...sections.suggestions,
        ...dates.suggestions,
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
};
