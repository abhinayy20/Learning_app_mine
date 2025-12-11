import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../Dashboard.css';

const API_BASE = process.env.REACT_APP_COURSE_API || 'http://localhost:3001';

export default function Dashboard() {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser, getUserData, logout } = useAuth();
    const userData = getUserData();

    useEffect(() => {
        if (currentUser) {
            fetchEnrollments();
        }
    }, [currentUser]);

    const fetchEnrollments = async () => {
        try {
            const userId = userData?.id || currentUser.uid;

            const response = await fetch(`${API_BASE}/api/enrollments/me`, {
                headers: {
                    'x-user-id': userId,
                }
            });

            const data = await response.json();

            if (data.success) {
                setEnrollments(data.data.enrollments || []);
            }
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch enrollments:', err);
            setError('Failed to load enrollments');
            setLoading(false);
        }
    };

    const handleUnenroll = async (enrollmentId, courseTitle) => {
        console.log('Unenroll clicked:', { enrollmentId, courseTitle });

        if (!window.confirm(`Are you sure you want to unenroll from "${courseTitle}"?`)) {
            console.log('User cancelled unenroll');
            return;
        }

        try {
            const userId = userData?.id || currentUser.uid;
            console.log('Attempting unenroll with userId:', userId);

            const url = `${API_BASE}/api/enrollments/${enrollmentId}`;
            console.log('DELETE request to:', url);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'x-user-id': userId,
                }
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                alert('Successfully unenrolled from course');
                fetchEnrollments(); // Refresh the list
            } else {
                alert(data.message || 'Failed to unenroll');
            }
        } catch (err) {
            console.error('Unenroll error:', err);
            alert('Failed to unenroll. Please try again.');
        }
    };

    async function handleLogout() {
        try {
            await logout();
        } catch {
            console.error("Failed to log out");
        }
    }

    return (
        <div className="App">
            <header className="App-header">
                <div className="header-content">
                    <div className="brand">
                        <h1>🎓 My Dashboard</h1>
                        <p>Track your learning progress</p>
                    </div>
                    <div className="auth-buttons">
                        <div className="user-menu">
                            <div className="user-info">
                                <span className="user-avatar">👤</span>
                                <span className="user-email">
                                    {userData?.full_name || userData?.username || currentUser.email}
                                </span>
                            </div>
                            <Link to="/" className="btn-secondary btn-sm" style={{ marginRight: '10px' }}>Browse Courses</Link>
                            <button onClick={handleLogout} className="btn-secondary btn-sm">Log Out</button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container">
                {userData && (
                    <div className="user-profile-card">
                        <h2>Welcome back, {userData.full_name || userData.username}!</h2>
                        {userData.college_name && (
                            <p>📚 {userData.college_name} • {userData.enrolled_course}</p>
                        )}
                        {userData.city && (
                            <p>📍 {userData.city}, {userData.state}</p>
                        )}
                    </div>
                )}

                <h2 className="section-title">My Enrolled Courses ({enrollments.length})</h2>

                {loading && <div className="loading">Loading your courses...</div>}
                {error && <div className="error">{error}</div>}

                {!loading && !error && enrollments.length === 0 && (
                    <div className="empty-dashboard">
                        <h3>📚 No courses yet!</h3>
                        <p>Start your learning journey by enrolling in a course.</p>
                        <Link to="/" className="btn-primary">Browse Courses</Link>
                    </div>
                )}

                {!loading && !error && enrollments.length > 0 && (
                    <div className="courses-grid">
                        {enrollments.map((enrollment) => {
                            const course = enrollment.courseId;
                            if (!course) return null;

                            return (
                                <div key={enrollment._id} className="course-card enrolled">
                                    <div className="enrollment-badge">✓ Enrolled</div>

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

                                    <div className="progress-section">
                                        <div className="progress-header">
                                            <span>Progress</span>
                                            <span className="progress-percentage">{enrollment.progress}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${enrollment.progress}%` }}
                                            ></div>
                                        </div>
                                        <p className="progress-lessons">
                                            {enrollment.completedLessons} / {enrollment.totalLessons} lessons completed
                                        </p>
                                    </div>

                                    <div className="course-meta">
                                        <div className="instructor">
                                            <strong>👤</strong> {course.instructor}
                                        </div>
                                        <div className="duration">
                                            <strong>⏱️</strong> {course.duration}h
                                        </div>
                                    </div>

                                    <div className="course-actions">
                                        <Link
                                            to={`/learn/${course._id}`}
                                            className="btn-continue"
                                            style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}
                                        >
                                            {enrollment.progress > 0 ? 'Continue Learning' : 'Start Course'}
                                        </Link>
                                        <button
                                            className="btn-unenroll"
                                            onClick={() => handleUnenroll(enrollment._id, course.title)}
                                        >
                                            Unenroll
                                        </button>
                                    </div>

                                    <div className="enrollment-date">
                                        Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <footer className="footer">
                <p>Keep learning and growing! 🚀</p>
            </footer>
        </div>
    );
}
