-- Insert Product Analyst Course
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
    'Product Analyst',
    'product-analyst',
    'Leverage data-driven insights to analyze user behavior, optimize funnels, and drive strategic product growth.',
    'Data is the heartbeat of modern products. In our Product Analyst track, you will learn how to transform raw user data into actionable product strategies. We cover everything from defining key performance indicators (KPIs) to executing complex A/B tests and funnel analysis. You will get hands-on experience with industry-standard product analytics tools, learning to identify friction points in the user journey and proposing data-backed improvements. This track bridges the gap between purely technical data analysis and high-level product strategy, making you an indispensable asset to any modern product team.',
    'Intermediate',
    'https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=2070&auto=format&fit=crop',
    true,
    '12 Weeks',
    ARRAY['Foundational understanding of data (Excel)', 'Basic analytical mindset', 'Familiarity with digital products'],
    ARRAY['Implement A/B testing and experimentation frameworks', 'Analyze retention cohorts and user churn patterns', 'Master funnel analysis to identify conversion friction', 'Define and track product-specific KPIs and growth metrics', 'Visualize product performance for cross-functional stakeholders', 'Translate behavioral insights into roadmap recommendations'],
    ARRAY['Data-inclined Product Managers', 'Business Analysts pivoting to Product', 'Marketing Analysts focusing on growth', 'UX Researchers looking for quantitative skills'],
    ARRAY['Product Analyst', 'Growth Analyst', 'Data Product Manager', 'User Experience Analyst']
);
