
db.courses.deleteMany({}); // Clear to start fresh with the MERGED set

db.courses.insertMany([
    // --- Original Web/Tech Courses ---
    {
        title: 'Full Stack Web Development 2025',
        description: 'Master modern web development with React, Node.js, and MongoDB. Build real-world projects.',
        instructor: 'John Doe',
        duration: 40,
        price: 89.99,
        level: 'beginner',
        category: 'programming',
        rating: 4.8,
        enrollments: 1250,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: 'Python for Data Science Bootcamp',
        description: 'Learn Python programming, data analysis, and visualization with Pandas and Matplotlib.',
        instructor: 'Sarah Smith',
        duration: 35,
        price: 94.99,
        level: 'intermediate',
        category: 'data-science',
        rating: 4.9,
        enrollments: 850,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: 'DevOps Engineering Mastery',
        description: 'Become a DevOps engineer. Learn Docker, Kubernetes, Jenkins, Terraform, and AWS.',
        instructor: 'Mike Chen',
        duration: 50,
        price: 129.99,
        level: 'advanced',
        category: 'programming',
        rating: 4.7,
        enrollments: 2100,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    // --- New Technical Engineering Courses ---
    {
        title: 'Introduction to Structural Engineering',
        description: 'Understand the core concepts of structural analysis, loads, and materials. Essential for Civil Engineering.',
        instructor: 'Dr. Robert Build',
        duration: 45,
        price: 99.99,
        level: 'beginner',
        category: 'other',
        rating: 4.8,
        enrollments: 450,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: 'Thermodynamics & Heat Transfer',
        description: 'Comprehensive guide to the laws of thermodynamics, entropy, and heat transfer mechanisms for Mechanical Engineers.',
        instructor: 'Prof. James Joule',
        duration: 60,
        price: 119.99,
        level: 'intermediate',
        category: 'other',
        rating: 4.9,
        enrollments: 320,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: 'Electrical Circuit Analysis',
        description: 'Master the fundamentals of DC and AC circuit analysis, Kirchhoff\'s laws, and network theorems.',
        instructor: 'Eng. Nikola T.',
        duration: 50,
        price: 89.99,
        level: 'beginner',
        category: 'other',
        rating: 4.7,
        enrollments: 680,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: 'MATLAB for Engineers',
        description: 'Learn numerical computing, data analysis, and algorithm development using MATLAB. tailored for engineering applications.',
        instructor: 'Sarah Tech',
        duration: 40,
        price: 109.99,
        level: 'intermediate',
        category: 'programming',
        rating: 4.8,
        enrollments: 1100,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: 'Engineering Mechanics: Statics',
        description: 'Analyze force systems, equilibrium of particles and rigid bodies, and friction. The foundation of mechanical design.',
        instructor: 'Dr. Newton',
        duration: 55,
        price: 94.99,
        level: 'beginner',
        category: 'other',
        rating: 4.6,
        enrollments: 540,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
]);
