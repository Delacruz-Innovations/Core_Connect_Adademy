-- Insert Cybersecurity (Foundations) and AI Vibe Coding Courses
INSERT INTO courses (
    id,
    title,
    slug,
    short_description,
    description,
    level,
    thumbnail_url,
    is_published,
    duration,
    prerequisites,
    learning_outcomes,
    target_audience,
    career_prospects
) VALUES 
(
    gen_random_uuid(),
    'Cybersecurity (Foundations)',
    'cybersecurity-foundations',
    'Learn how to protect digital assets, identify vulnerabilities, and respond to threats—without needing a background in coding.',
    'Our Cybersecurity Foundations track is designed specifically for non-technical professionals who want to enter the high-growth field of digital defense. This course strips away the complexity of heavy coding and focuses on the strategic principles of network security, risk management, and data protection. You will learn to think like a defender, identifying critical vulnerabilities in information assets and proposing robust security controls. By the end of this program, you will be proficient in security protocols, compliance standards, and incident response planning, making you a vital asset in any organization''s defense strategy.',
    'Beginner',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
    true,
    '10 Weeks',
    ARRAY['Basic computer literacy', 'Strong analytical thinking', 'No coding required'],
    ARRAY['Protect and defend systems against common cyber threats', 'Master network security and firewall fundamentals', 'Perform risk assessments and vulnerability analysis', 'Develop and execute incident response plans', 'Navigate legal and ethical issues in information security', 'Understand GRC (Governance, Risk, and Compliance) standards'],
    ARRAY['Non-technical professionals looking to pivot to tech', 'Recent graduates interested in digital security', 'Managers responsible for organizational data safety', 'Aspiring GRC or SOC Analysts'],
    ARRAY['Cybersecurity Analyst', 'GRC Analyst', 'Security Awareness Trainer', 'Information Security Coordinator']
),
(
    gen_random_uuid(),
    'AI Vibe Coding',
    'ai-vibe-coding',
    'Build fully functional websites and apps using natural language and AI coding assistants—no traditional programming experience needed.',
    'Welcome to the future of development. Our AI Vibe Coding track is designed for "builders" who want to skip the syntax and go straight to shipping products. This course teaches you to use Large Language Models (LLMs) like Claude, ChatGPT, and Gemini as your collaborative partners. You will master the art of "vibe coding"—using natural language to guide AI through complex development tasks. We cover advanced prompting techniques, local environment setup with Cursor and v0, and iterative refinement. Whether you have never written a line of code or just want to build 10x faster, this course empowers you to turn your ideas into functional, professional-grade software.',
    'Beginner',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop',
    true,
    '8 Weeks',
    ARRAY['Creative mindset', 'Ability to articulate ideas clearly', 'Zero coding knowledge required'],
    ARRAY['Build and deploy full-stack apps using AI assistants', 'Master advanced prompting techniques for code generation', 'Optimize development workflows with Cursor, v0, and Replit', 'Iteratively refine and bug-fix AI-generated code', 'Integrate APIs and databases through conversational guidance', 'Deploy professional-grade landing pages and utilities'],
    ARRAY['Entrepreneurs and "Solo-preneurs"', 'Designers wanting to build their own products', 'Marketing professionals building landing pages', 'Non-tech founders who want to prototype fast'],
    ARRAY['AI-Assisted Developer', 'No-Code/Low-Code Engineer', 'Product Prototype Specialist', 'Digital Product Builder']
);
