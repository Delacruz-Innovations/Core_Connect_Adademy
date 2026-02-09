-- Insert Digital Operations Analyst Course
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
) VALUES (
    gen_random_uuid(),
    'Digital Operations Analyst',
    'digital-operations-analyst',
    'Optimize organizational efficiency by streamlining digital workflows, implementing automation, and scaling operations.',
    'As organizations scale, the complexity of their digital operations grows exponentially. Our Digital Operations Analyst track prepares you to become the strategic problem-solver who keeps the gears turning smoothly. You will learn to audit existing workflows, identify bottlenecks, and implement digital solutions that save time and reduce costs. From choosing the right ERP systems to designing automated data pipelines, this course covers the operational backbone of modern tech companies. We focus on the intersection of technology, process, and people, ensuring you can manage the digital infrastructure that powers successful organizations.',
    'Beginner',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
    true,
    '10 Weeks',
    ARRAY['Interest in systems and efficiency', 'Basic digital tool proficiency', 'Logical approach to problem-solving'],
    ARRAY['Map and optimize complex business processes', 'Implement and manage digital operation tools (SaaS/ERP)', 'Design automation workflows for recurring tasks', 'Synthesize operational data into business intelligence', 'Manage digital transformation initiatives smoothly', 'Apply Lean and Six Sigma principles to digital environments'],
    ARRAY['Operations enthusiasts', 'Early-career professionals in logistics or admin', 'Entrepreneurs scaling their business operations', 'Graduates interested in the "engine room" of tech'],
    ARRAY['Digital Operations Analyst', 'Process Automation Specialist', 'Operations Manager', 'Digital Transformation Consultant']
);
