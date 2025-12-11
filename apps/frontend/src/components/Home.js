import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_COURSE_API || 'http://localhost:3001';

export default function Home() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { currentUser, logout, getUserData } = useAuth();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/courses`);
            const data = await response.json();

            if (data.success) {
                setCourses(data.data.courses || []);
            }
            setLoading(false);
        } catch (err) {
            console.log('Backend not reachable, using sample data');
            setCourses([
                {
                    _id: '1',
                    title: 'Full Stack Web Development 2025',
                    description: 'Master modern web development with React, Node.js, and MongoDB. Build real-world projects.',
                    instructor: 'John Doe',
                    duration: 40,
                    price: 89.99,
                    level: 'beginner',
                    category: 'Development',
                    rating: 4.8,
                    enrollments: 1250
                },
                {
                    _id: '2',
                    title: 'Python for Data Science Bootcamp',
                    description: 'Learn Python programming, data analysis, and visualization with Pandas and Matplotlib.',
                    instructor: 'Sarah Smith',
                    duration: 35,
                    price: 94.99,
                    level: 'intermediate',
                    category: 'Data Science',
                    rating: 4.9,
                    enrollments: 850
                },
                {
                    _id: '3',
                    title: 'DevOps Engineering Mastery',
                    description: 'Become a DevOps engineer. Learn Docker, Kubernetes, Jenkins, Terraform, and AWS.',
                    instructor: 'Mike Chen',
                    duration: 50,
                    price: 129.99,
                    level: 'advanced',
                    category: 'DevOps',
                    rating: 4.7,
                    enrollments: 2100
                },
                {
                    _id: '4',
                    title: 'AWS Certified Solutions Architect',
                    description: 'Comprehensive guide to passing the AWS Solutions Architect Associate exam.',
                    instructor: 'Cloud Guru',
                    duration: 45,
                    price: 149.99,
                    level: 'advanced',
                    category: 'Cloud',
                    rating: 4.9,
                    enrollments: 3500
                },
                {
                    _id: '5',
                    title: 'Machine Learning A-Z',
                    description: 'Hands-on Machine Learning with Python. Build predictive models and AI applications.',
                    instructor: 'AI Expert',
                    duration: 60,
                    price: 199.99,
                    level: 'intermediate',
                    category: 'AI',
                    rating: 4.6,
                    enrollments: 1800
                },
                {
                    _id: '6',
                    title: 'UI/UX Design Fundamentals',
                    description: 'Learn to design beautiful user interfaces and user experiences using Figma.',
                    instructor: 'Design Pro',
                    duration: 25,
                    price: 79.99,
                    level: 'beginner',
                    category: 'Design',
                    rating: 4.8,
                    enrollments: 950
                }
            ]);
            setError(null);
            setLoading(false);
        }
    };

    async function handleLogout() {
        try {
            await logout();
        } catch {
            console.error("Failed to log out");
        }
    }

    const categories = ['All', ...new Set(courses.map(course => course.category))];

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="App">
            <header className="App-header">
                <div className="header-content">
                    <div className="brand">
                        <h1>🎓 Learning Platform</h1>
                        <p>Discover amazing courses and grow your skills</p>
                    </div>
                    <div className="auth-buttons">
                        {currentUser ? (
                            <div className="user-menu">
                                <div className="user-info">
                                    <span className="user-avatar">👤</span>
                                    <span className="user-email">{currentUser.email}</span>
                                </div>
                                <Link to="/dashboard" className="btn-secondary btn-sm" style={{ marginRight: '10px' }}>My Dashboard</Link>
                                <button onClick={handleLogout} className="btn-secondary btn-sm">Log Out</button>
                            </div>
                        ) : (
                            <div className="guest-menu">
                                <Link to="/login" className="btn-secondary">Log In</Link>
                                <Link to="/signup" className="btn-primary" style={{ marginLeft: '10px' }}>Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="container">
                {currentUser && (
                    <div className="welcome-banner">
                        <div className="welcome-content">
                            <h2>👋 Welcome back, <span className="user-highlight">{getUserData()?.full_name || getUserData()?.username || currentUser.email.split('@')[0]}</span>!</h2>
                            <p className="welcome-subtitle">Ready to continue your learning journey?</p>
                        </div>
                        <div className="welcome-stats">
                            <div className="stat-item">
                                <span className="stat-icon">📚</span>
                                <div>
                                    <div className="stat-number">{filteredCourses.length}</div>
                                    <div className="stat-label">Courses Available</div>
                                </div>
                            </div>
                            <div className="stat-item">
                                <span className="stat-icon">🎯</span>
                                <div>
                                    <div className="stat-number">24/7</div>
                                    <div className="stat-label">Access Anytime</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="controls-section">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="🔍 Search for courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="category-filters">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && <div className="loading">Loading courses...</div>}

                {error && <div className="error">{error}</div>}

                {!loading && !error && (
                    <div className="courses-grid">
                        {filteredCourses.length === 0 ? (
                            <div className="empty-state">
                                <h2>No courses found</h2>
                                <p>Try adjusting your search or filter</p>
                            </div>
                        ) : (
                            filteredCourses.map((course) => (
                                <div key={course._id} className="course-card">
                                    <div className="course-header">
                                        <span className={`badge badge-${course.level}`}>
                                            {course.level}
                                        </span>
                                        <span className="badge badge-category">
                                            {course.category}
                                        </span>
                                    </div>

                                    <h3>{course.title}</h3>
                                    <p className="course-description">{course.description}</p>

                                    <div className="course-meta">
                                        <div className="instructor">
                                            <strong>👤</strong> {course.instructor}
                                        </div>
                                        <div className="duration">
                                            <strong>⏱️</strong> {course.duration}h
                                        </div>
                                    </div>

                                    <div className="course-footer">
                                        <div className="price">${course.price}</div>
                                        <div className="stats">
                                            <span>⭐ {course.rating.toFixed(1)}</span>
                                            <span>👥 {course.enrollments}</span>
                                        </div>
                                    </div>

                                    <button
                                        className="btn-enroll"
                                        onClick={async (event) => {
                                            if (!currentUser) {
                                                alert("Please log in to enroll in this course!");
                                                return;
                                            }

                                            const button = event.currentTarget;
                                            button.textContent = 'Enrolling...';
                                            button.disabled = true;

                                            try {
                                                const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                                                const token = localStorage.getItem('authToken');

                                                const response = await fetch(`${API_BASE}/api/enrollments`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'x-user-id': userData.id || currentUser.uid,
                                                    },
                                                    body: JSON.stringify({
                                                        courseId: course._id,
                                                        userId: userData.id || currentUser.uid
                                                    })
                                                });

                                                const data = await response.json();

                                                if (data.success) {
                                                    button.textContent = '✓ Enrolled!';
                                                    button.style.background = '#10b981';
                                                    setTimeout(() => {
                                                        alert(`🎉 Successfully enrolled in ${course.title}!\n\nGo to Dashboard to start learning!`);
                                                    }, 500);
                                                } else {
                                                    button.textContent = 'Enroll Now';
                                                    button.disabled = false;
                                                    alert(data.message || 'Failed to enroll in course');
                                                }
                                            } catch (error) {
                                                console.error('Enrollment error:', error);
                                                button.textContent = 'Enroll Now';
                                                button.disabled = false;
                                                alert('Failed to enroll. Please try again.');
                                            }
                                        }}
                                    >
                                        Enroll Now
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>

            <footer className="footer">
                <p>Built with ❤️ using modern DevOps practices</p>
                <p className="tech-stack">
                    React • Node.js • Python • Go • Kubernetes • ArgoCD • Prometheus
                </p>
            </footer>
        </div>
    );
}
