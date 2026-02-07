// Demo Courses Configuration
// This file contains the course catalog used across the application

export const DEMO_COURSES = [
    {
        id: 'BA101',
        name: 'Business Analysis Fundamentals',
        code: 'BA101',
        duration: '8 weeks',
        description: 'Learn the core principles of business analysis including requirements gathering, stakeholder management, and process modeling.',
        level: 'Beginner',
        price: 499
    },
    {
        id: 'PM201',
        name: 'Project Management Professional',
        code: 'PM201',
        duration: '10 weeks',
        description: 'Master project management methodologies including Agile, Scrum, and traditional waterfall approaches.',
        level: 'Intermediate',
        price: 699
    },
    {
        id: 'CS301',
        name: 'Cybersecurity Essentials',
        code: 'CS301',
        duration: '12 weeks',
        description: 'Comprehensive introduction to cybersecurity concepts, threat analysis, and security best practices.',
        level: 'Intermediate',
        price: 799
    },
    {
        id: 'AI401',
        name: 'AI & Machine Learning Basics',
        code: 'AI401',
        duration: '6 weeks',
        description: 'Introduction to artificial intelligence and machine learning concepts with hands-on Python projects.',
        level: 'Beginner',
        price: 599
    },
    {
        id: 'DA501',
        name: 'Data Analytics Bootcamp',
        code: 'DA501',
        duration: '14 weeks',
        description: 'Intensive bootcamp covering data analysis, visualization, SQL, and business intelligence tools.',
        level: 'Advanced',
        price: 999
    },
    {
        id: 'PO301',
        name: 'Product Owner Certification',
        code: 'PO301',
        duration: '8 weeks',
        description: 'Learn product ownership, backlog management, and stakeholder collaboration in Agile environments.',
        level: 'Intermediate',
        price: 649
    }
];

export const PAYMENT_METHODS = [
    { value: 'transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'cash', label: 'Cash Payment', icon: '💵' },
    { value: 'crypto', label: 'Cryptocurrency', icon: '₿' }
];

export const PAYMENT_STATUSES = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'paid', label: 'Paid', color: 'green' },
    { value: 'partial', label: 'Partial Payment', color: 'blue' }
];

// Helper function to get course by ID
export const getCourseById = (courseId) => {
    return DEMO_COURSES.find(course => course.id === courseId);
};

// Helper function to get multiple courses by IDs
export const getCoursesByIds = (courseIds) => {
    return DEMO_COURSES.filter(course => courseIds.includes(course.id));
};

// Helper function to calculate total price for selected courses
export const calculateTotalPrice = (courseIds) => {
    const courses = getCoursesByIds(courseIds);
    return courses.reduce((total, course) => total + course.price, 0);
};
