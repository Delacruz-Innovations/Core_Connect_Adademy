-- Business Analysis Course Curriculum Migration
-- Course ID: 3cd71722-a59f-417c-9839-1baf52b8d9eb
-- Target: 'business-analysis'

DO $$
DECLARE
    v_course_id UUID := '3cd71722-a59f-417c-9839-1baf52b8d9eb';
    v_m1_id UUID;
    v_m2_id UUID;
    v_m3_id UUID;
    v_m4_id UUID;
    v_m5_id UUID;
    v_m6_id UUID;
BEGIN
    -- 1. Insert Modules
    INSERT INTO modules (course_id, title, week_number, status) 
    VALUES (v_course_id, 'Fundamentals & Introduction', 1, 'unlocked') RETURNING id INTO v_m1_id;

    INSERT INTO modules (course_id, title, week_number, status) 
    VALUES (v_course_id, 'Planning & Requirement Elicitation', 2, 'locked') RETURNING id INTO v_m2_id;

    INSERT INTO modules (course_id, title, week_number, status) 
    VALUES (v_course_id, 'Analysis & Modeling Techniques', 3, 'locked') RETURNING id INTO v_m3_id;

    INSERT INTO modules (course_id, title, week_number, status) 
    VALUES (v_course_id, 'Data-Driven Decision Making', 4, 'locked') RETURNING id INTO v_m4_id;

    INSERT INTO modules (course_id, title, week_number, status) 
    VALUES (v_course_id, 'Management & Solution Evaluation', 5, 'locked') RETURNING id INTO v_m5_id;

    INSERT INTO modules (course_id, title, week_number, status) 
    VALUES (v_course_id, 'Strategy & Professional Growth', 6, 'locked') RETURNING id INTO v_m6_id;

    -- 2. Insert Lessons for Module 1
    INSERT INTO lessons (module_id, title, description, order_index) VALUES
    (v_m1_id, 'The Evolving Role of the Business Analyst in 2026', 'Exploration of the transition from traditional BA roles to strategic partnership and digital agency.', 1),
    (v_m1_id, 'Core Competencies and Ethical Considerations', 'Analyzing the hard and soft skills required for modern business analysis and ethical data handling.', 2),
    (v_m1_id, 'Understanding Digital Transformation & Change Management', 'How BAs facilitate organizational change in the age of rapid technology adoption.', 3),
    (v_m1_id, 'BA Methodologies: Waterfall vs. Agile vs. DevOps', 'Comparative study of project management frameworks and the BA contribution in each.', 4);

    -- 3. Insert Lessons for Module 2
    INSERT INTO lessons (module_id, title, description, order_index) VALUES
    (v_m2_id, 'Stakeholder Identification & Engagement Mapping', 'Precision techniques for mapping stakeholder influence and designing communication strategies.', 1),
    (v_m2_id, 'Advanced Elicitation Techniques: Beyond the Interview', 'Using observation, document analysis, and interface analysis to uncover requirements.', 2),
    (v_m2_id, 'Defining Project Scope & Creating the BA Plan', 'Structuring the business analysis approach to ensure project alignment and resource efficiency.', 3),
    (v_m2_id, 'Elicitation Workshops and Collaborative Discovery', 'Mastering the art of facilitating high-impact workshops for requirements gathering.', 4);

    -- 4. Insert Lessons for Module 3
    INSERT INTO lessons (module_id, title, description, order_index) VALUES
    (v_m3_id, 'Process Modeling & BPMN 2.0 Standards', 'Visualizing business workflows using international BPMN standards for clarity and precision.', 1),
    (v_m3_id, 'Use Case Modeling & User Story Mapping', 'Detailing functional requirements through the lens of actors and iterative user stories.', 2),
    (v_m3_id, 'Data Modeling Fundamentals for BAs', 'Understanding entity-relationship diagrams and how data architecture supports business logic.', 3),
    (v_m3_id, 'Prototyping and Wireframing for Requirements Validation', 'Creating low-fidelity visuals to validate requirements with stakeholders early in the cycle.', 4);

    -- 5. Insert Lessons for Module 4
    INSERT INTO lessons (module_id, title, description, order_index) VALUES
    (v_m4_id, 'SQL for Business Analysts: Querying Data for Insights', 'Core SQL skills for extracting and manipulating data from relational databases.', 1),
    (v_m4_id, 'Data Visualization with Power BI and Tableau', 'Transforming complex datasets into actionable visual stories and executive dashboards.', 2),
    (v_m4_id, 'Understanding Predictive Analytics & Decision Intelligence', 'Introduction to the role of AI and statistics in forecasting business trends.', 3),
    (v_m4_id, 'Key Metrics & Performance Indicators (KPIs) Alignment', 'Ensuring BA initiatives are linked directly to measurable business outcomes.', 4);

    -- 6. Insert Lessons for Module 5
    INSERT INTO lessons (module_id, title, description, order_index) VALUES
    (v_m5_id, 'Requirements Life Cycle Management & Traceability', 'Ensuring requirements remain consistent and valid from inception to implementation.', 1),
    (v_m5_id, 'Change Request Management & Impact Analysis', 'Systematic evaluation of changes to scope and their downstream effects on project value.', 2),
    (v_m5_id, 'Solution Evaluation & Value Assessment', 'Measuring actual vs. expected performance of implemented solutions.', 3),
    (v_m5_id, 'User Acceptance Testing (UAT) Frameworks', 'The BA role in ensuring the solution meets business needs through rigorous testing.', 4);

    -- 7. Insert Lessons for Module 6
    INSERT INTO lessons (module_id, title, description, order_index) VALUES
    (v_m6_id, 'Developing Business Cases & Feasibility Studies', 'Synthesizing analysis into compelling arguments for investment and strategic direction.', 1),
    (v_m6_id, 'Strategy Analysis: Gap Analysis & SWOT', 'Evaluating organizational readiness and defining the path to the desired future state.', 2),
    (v_m6_id, 'AI Integration in the BA Workflow', 'Practical applications of Generative AI to automate documentation and elicitation tasks.', 3),
    (v_m6_id, 'Certification Paths (CBAP/CCBA) & Career Roadmap', 'Professional development planning and preparing for global BA certifications.', 4);

END $$;
