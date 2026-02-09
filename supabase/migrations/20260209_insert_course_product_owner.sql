-- Insert Product Owner / Product Fundamentals Course
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
    'Product Owner / Product Fundamentals',
    'product-owner-fundamentals',
    'Master the accountability of maximizing product value within the Scrum framework through vision setting and backlog management.',
    'The Product Owner / Product Fundamentals track is your gateway to becoming a strategic leader in an Agile environment. This course goes beyond theory, teaching you the precise mindset and activities required to bridge business strategy with technical execution. You will learn to define a compelling product vision, craft high-impact user stories, and master the art of backlog prioritization. We focus on maximizing Return on Investment (ROI) and fostering a product mindset that prioritizes value over simple feature delivery. Prepare to lead Scrum teams with confidence and deliver products that truly resonate with users.',
    'Beginner',
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2070&auto=format&fit=crop',
    true,
    '10 Weeks',
    ARRAY['Basic understanding of project workflows', 'Interest in leadership and strategy', 'No prior technical experience required'],
    ARRAY['Master the Scrum framework and its core artifacts', 'Define and communicate a clear product vision', 'Create and prioritize a value-driven Product Backlog', 'Craft effective user stories and acceptance criteria', 'Manage stakeholder expectations and feedback loops', 'Shift from a "Project" to a "Product" value-maximization mindset'],
    ARRAY['Aspiring Product Owners', 'New POs looking to formalize their skills', 'Project Managers transitioning to Agile', 'Entrepreneurs building their own products'],
    ARRAY['Product Owner', 'Associate Product Manager', 'Agile Product Lead', 'Backlog Manager']
);
